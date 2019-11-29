import sass from 'dart-sass';
import path from 'path';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import csstree from 'css-tree';
import crypto from 'crypto';
import fs from 'fs';

export default class CompileSass {
  constructor ({ htmlText, filePath, cacheDir }) {
    this.cacheDir = cacheDir;
    this.filePath = filePath;
    this.css = [];
    this.scss = [];
    const regex = new RegExp(`(?<=<style[a-z0-9="' ]*type\\s*=\\s*["']?\\s*text\\/scss\\s*["']?[a-z0-9="' ]*>)([\\s\\S]*?)(?=<\\/style>)`, 'gi');
    let match = null;
    while ((match = regex.exec(htmlText))) {
      this.scss.push({
        cssIndex: this.scss.length,
        data: this.processImports(match[0]),
        idx: match.index,
        len: match[0].length
      });
    }
  }

  processImports (scss) {
    return scss.replace(/(?:@import ["'])(\S+)(?:["'];)/g, (match, importPath) => {
      const lvl = (importPath.match(/\.\.\//g) || []).length;
      const rel = new Array(lvl).fill('../').join('') || './';
      return `/* <import rel="${rel}"> */ @import "${path.resolve(this.filePath, importPath).replace(/\\/g, '/')}"; /* </import> */`;
    });
  }

  processPath (css) {
    const regex = /(?:\/\* <import[a-z0-9="' ]*rel\s*=\s*["']?\s*([a-zA-Z0-9.\/]*)\s*["']?[a-z0-9="' ]*> \*\/)([\s\S]*?)(?:\/\* <\/import> \*\/)/gm;

    return css.replace(regex, (full, rel, match) => {
      if (rel === './') return match;
      const ast = csstree.parse(match);
      csstree.walk(ast, (node) => {
        if (node.type === 'Url') {
          const value = node.value;
          let url = (value.type === 'Raw' ? value.value : value.value.substr(1, value.value.length - 2));
          if (url.indexOf('data:') > -1) return;
          node.value.value = `${rel}${url}`.replace(/\/\.\//g, '/');
        }
      });
      return csstree.generate(ast);
    });
  }

  processResources (css) {
    const ast = csstree.parse(css);

    csstree.walk(ast, function (node) {
      if ((this.rule || this.atrule && this.atrule.name === 'media') && node.type === 'Url') {
        let url = (node.value.type === 'Raw' ? node.value.value : node.value.value.substr(1, node.value.value.length - 2));
        if (url.indexOf('data:') === -1) {
          node.value.value = `/* <image url="${url}"> */`;
        }
      }
    });

    return csstree.generate(ast);
  }

  compile () {
    const promises = [];
    this.scss.forEach(({ data }, i) => {
      const hash = crypto.createHash('md5').update(data).digest('hex');
      const cachedPath = `${this.cacheDir}${hash}.css`;
      promises.push(
        new Promise(res => {
          if (fs.existsSync(cachedPath)) {
            fs.readFile(cachedPath, (err, data) => {
              if (err) {
                throw err
              }
              this.css[i] = data;
              res()
            });
          } else {
            sass.render({ data }, (err, result) => {
              if (err) {
                console.log(`Sass compile error:\n${err}`);
                this.css[i] = this.scss[i].data;
                res();
              } else {
                postcss([autoprefixer])
                  .process(result.css.toString(), { from: undefined })
                  .then(({ css }) => {
                    this.css[i] = this.processPath(css);
                    this.css[i] = this.processResources(this.css[i]);
                    fs.writeFileSync(cachedPath, this.css[i], 'utf8');
                    res();
                  });
              }
            });
          }
        })
      );
    });

    return promises;
  }
}
