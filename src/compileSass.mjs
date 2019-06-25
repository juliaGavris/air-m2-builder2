import sass from "dart-sass";
import path from "path";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import csstree from 'css-tree';
import fs from 'fs';

export default class CompileSass {
  constructor({ htmlText, filePath, module }) {
    const reg = `(?<=<style[a-z0-9="' ]*type\\s*=\\s*["']?\\s*text\\/scss\\s*["']?[a-z0-9="' ]*>)([\\s\\S]*?)(?=<\\/style>)`;
    this.filePath = filePath
    this.module = module
    this.scss = (htmlText.match(new RegExp(reg, "gi")) || []).reduce((acc, style, i) => {
      acc.push({
        cssIndex: i,
        data: style.replace(/(?<=@import ["'])(\S+)(?=["'];)/g, match =>
          path.resolve(filePath, match).replace(/\\/g, "/")
        ),
        idx: htmlText.indexOf(style),
        len: style.length
      });
      return acc;
    }, []);
    this.css = [];
  }

  processPath (css) {
    const ast = csstree.parse(css);
    csstree.walk(ast, (node) => {
      if (node.type === 'Url') {
        const value = node.value;
        let url = (value.type === 'Raw' ? value.value : value.value.substr(1, value.value.length - 2)).replace(/([^#?]+)([#?].*)/g, '$1');
        let relPath = this.filePath.split('/');

        if (url.indexOf('data:') > -1 || fs.existsSync(path.resolve(this.filePath, url)) || relPath.slice(-1) === this.module) return;

        do {
          url = `../${url}`.replace(/\/\.\//g, '/');
          if (fs.existsSync(path.resolve(this.filePath, url))) {
            node.value.value = url;
          }
        } while (relPath.length && relPath.pop() !== this.module);
      }
    });
    return csstree.generate(ast);
  }
  
  compile() {
    const promises = [];
    this.scss.forEach(({ data }, i) => {
      promises.push(
        new Promise(res => {
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
                  res();
                });
            }
          });
        })
      );
    });

    return promises;
  }
}
