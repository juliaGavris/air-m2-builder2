import webpack from 'webpack';
import webpackCompileConfig from '../webpack-compiler.config.mjs';
import { dirname, normalize, resolve } from 'path';
import fse from 'fs-extra';
import crypto from 'crypto';

import sass from 'node-sass';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import csstree from 'css-tree';

const SOURCE_TYPES = ['js', 'jsx', 'scss'];

class CompileResource {
  run () {
    return new Promise(resolve => {
      resolve();
    });
  }
}

class CompileSource {
  constructor (opt, { path, entry }) {
    this.opt = opt;

    const compileOpt = {
      buildMode: this.opt.buildMode,
      path,
      entry,
      filename: 'index.js'
    };
    this.config = webpackCompileConfig(compileOpt);
  }

  run () {
    return new Promise((res, rej) => {
      console.log(`compile: ${this.opt.module} ...`);

      const compiler = webpack(this.config);

      compiler.run((error, stats) => {
        if (stats.hasErrors()) {
          console.log(`ERROR: ${this.opt.module} compile error`);
          console.log(stats.compilation.errors);
          rej(`ERROR '${this.opt.module}': compile error`);
          return;
        }

        console.log(`compile: ${this.opt.module} -- ok`);
        res();
      });
    });
  }
}

class CompileHtml {
  constructor ({ buildMode, cacheDir = false, inputFile, outputFile, importPathResolve = null }) {
    this.inputFile = inputFile;
    this.outputFile = outputFile;
    this.buildMode = buildMode;
    this.buildDir = ~inputFile.indexOf('node_modules') ? dirname(inputFile) : dirname(outputFile);
    this.cacheDir = cacheDir;
    this.importPathResolve = importPathResolve;
  }

  // sass
  processImports (scss) {
    return scss.replace(/(?:@import ["'])(\S+)(?:["'];)/g, (match, importPath) => {
      const lvl = (importPath.match(/\.\.\//g) || []).length;
      const rel = new Array(lvl).fill('../').join('') || './';
      return `/* <import rel="${rel}"> */ @import "${resolve(dirname(this.inputFile), importPath).replace(/\\/g, '/')}"; /* </import> */`;
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
  ////




  regexps = {
    js: ['(?<=<script>)([\\s\\S]*?)(?=<\\/script>)', '(?<=<view-source>)([\\s\\S]*?)(?=<\\/view-source>)', '(?<=<stream-source>)([\\s\\S]*?)(?=<\\/stream-source>)'],
    jsx: ['(?<=<react-source>)([\s\S]*?)(?=<\/react-source>)'],
    scss: [`(?<=<style[a-z0-9="' ]*type\\s*=\\s*["']?\\s*text\\/scss\\s*["']?[a-z0-9="' ]*>)([\\s\\S]*?)(?=<\\/style>)`]
  };

  extractSources = (htmlSource, regexps) => regexps.map((regexp) => htmlSource.match(new RegExp(regexp, 'gi'))).flat().filter(Boolean);

  configureCompiler = async ({ htmlSource, source, type }) => {
    const { buildMode, buildDir } = this;
    const hash = crypto.createHash('md5').update(source).digest('hex');
    const filename = `.tmp-${hash}.${type}`;
    const filenameBundle = `.tmp-${hash}-bundle.compiled`;

    await fse.ensureDir(buildDir);

    const meta = {
      file: `${buildDir}/${filenameBundle}`,
      start: htmlSource.indexOf(source),
      length: source.length
    };

    // if (this.importPathResolve) {
    //   debugger
    //   source = this.importPathResolve(source);
    // }


    if (type === 'scss') {
      return new Promise(async (resolve) => {
        if (await fse.exists(`${buildDir}/${filenameBundle}`)) {
          resolve({...meta, data: (await fse.readFile(`${buildDir}/${filenameBundle}`)).toString() });
        } else {
          const start = Date.now()
          sass.render({ data: this.processImports(source) }, (err, result) => {
            if (err) {
              console.log(`Sass compile error:\n${err}`, buildDir);
            } else {
              postcss([autoprefixer])
                .process(result.css.toString(), { from: undefined })
                .then(({ css }) => {
                  css = this.processPath(css);
                  css = this.processResources(css);
                  fse.writeFile(`${buildDir}/${filenameBundle}`, css, 'utf8');
                  resolve({...meta, data: css });
                });
            }
          })

        }
      });
    }


    await fse.writeFile(`${buildDir}/${filename}`, source, 'utf8');

    const config = webpackCompileConfig({
      buildMode,
      path: normalize(buildDir),
      entry: `${buildDir}/${filename}`,
      filename: filenameBundle,
    });

    const compiler = webpack(config);

    return new Promise((resolve, reject) => {
      compiler.run(async (error, stats) => {
        if (stats.hasErrors()) {
          console.log(`ERROR: ${compiler.options.entry} compile error`);
          reject(`ERROR '${compiler.options.entry}': compile error`);
        } else {
          resolve({
            ...meta,
            data: (await fse.readFile(meta.file)).toString()
          });
        }
      });

    });

  };

  async run () {
    const { buildDir, cacheDir, inputFile, outputFile } = this;

    try {
      let htmlSource = await fse.readFile(inputFile, 'utf8');

      const sources = SOURCE_TYPES.map((type) => ({
        type,
        sources: this.extractSources(htmlSource, this.regexps[type])
      }));

      const promises = sources
        .map(({ type, sources }) => sources.map((source) => this.configureCompiler({ htmlSource, source, type })))
        .flat();

      return new Promise((resolve, reject) => {
        Promise.all(promises).then(async (compiled) => {
          const outputHtml = compiled
            .sort((a, b) => b.start - a.start)
            .reduce((outputHtml, { start, length, data }) => outputHtml.slice(0, start) + data + outputHtml.slice(start + length), htmlSource)
            .replace(/\s*type\s*=\s*["']?\s*text\/scss\s*["']?\s*/g, ' ')
            .replace(/<view-source>/gi, '<script data-source-type="view-source">')
            .replace(/<\/view-source>/gi, '</script>')
            .replace(/<react-source>/gi, '<script data-source-type="view-source">')
            .replace(/<\/react-source>/gi, '</script>')
            .replace(/<stream-source>/gi, '<script data-source-type="stream-source">')
            .replace(/<\/stream-source>/gi, '</script>');

          await fse.ensureDir(dirname(outputFile));
          await fse.writeFile(outputFile, outputHtml, 'utf8');

          // glob(`${this.buildDir}/.tmp*.*`, {}, (err, files) => {
          //   if (err) throw err;
          //   files.map(file => fse.unlink(file, () => {}));
          // });

          resolve(outputHtml);
        });
      });
    } catch (err) {
      throw new Error(err);
    }
  }
}

export { CompileSource, CompileResource, CompileHtml };