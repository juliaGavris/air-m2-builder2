import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, rmdirSync, unlinkSync } from "fs";
import sass from "sass.js";
import webpack from "webpack";
import webpackCompileConfig from "../webpack-compiler.config.mjs";

class CompileResource {
  run() {
    return new Promise(resolve => {
      resolve();
    });
  }
}

class CompileSource {
  constructor(opt, { path, entry }) {
    this.opt = opt;

    const compileOpt = {
      mode: this.opt.mode,
      path,
      entry,
      filename: "index.js"
    };
    this.config = webpackCompileConfig(compileOpt);
  }

  run() {
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
  constructor(opt) {
    const {
      mode,
      resolvePath,
      redundantPaths: { resPath }
    } = opt;
    this.config = {
      configs: [],
      scripts: [],
      styles: [],
      paths: {
        pathOriginal: resPath.slice(0, resPath.lastIndexOf("/")),
        pathResolve: resolvePath,
        tempFolder: "/$temp"
      }
    };

    this.htmlText = readFileSync(resPath).asciiSlice();
    const jsSources = this.htmlText.match(/(?<=<[Ss][Cc][Rr][Ii][Pp][Tt]>)([\s\S]*?)(?=<\/[Ss][Cc][Rr][Ii][Pp][Tt]>)/g);
    const cssSources = this.htmlText.match(/(?<=<[Ss][Tt][Yy][Ll][Ee]>)([\s\S]*?)(?=<\/[Ss][Tt][Yy][Ll][Ee]>)/g);
    if (jsSources === null || cssSources === null) {
      return;
    }

    const {
      configs,
      scripts,
      styles,
      paths: { pathOriginal, tempFolder }
    } = this.config;
    jsSources.forEach((data, i) => {
      const tempDir = `${pathOriginal}${tempFolder}`;
      const filename = `/script${i}.js`;
      const filenameBundle = `script${i}-bundle.js`;

      if (!existsSync(tempDir)) {
        mkdirSync(tempDir);
      }
      writeFileSync(`${tempDir}${filename}`, data, "utf8");

      const compileOpt = {
        mode,
        path: tempDir,
        entry: `${tempDir}${filename}`,
        filename: filenameBundle
      };
      configs.push(webpackCompileConfig(compileOpt));
      scripts.push({ file: `${tempDir}/${filenameBundle}`, data, idx: this.htmlText.indexOf(data) });
    });
    cssSources.forEach(data => {
      styles.push({ data, idx: this.htmlText.indexOf(data) });
    });
  }

  run() {
    return new Promise(resolve => {
      const {
        configs,
        scripts,
        styles,
        paths: { pathOriginal, pathResolve, tempFolder }
      } = this.config;
      const promises = [];
      const sassStyles = [];

      configs.forEach(config => {
        const compiler = webpack(config);
        promises.push(
          new Promise(res => {
            compiler.run(() => {
              res();
            });
          })
        );
      });
      styles.forEach(({ data }, i) => {
        promises.push(
          new Promise(res => {
            sass.compile(data, result => {
              sassStyles[i] = result;
              res();
            });
          })
        );
      });

      Promise.all(promises).then(() => {
        scripts.reverse().forEach(script => {
          const { file, data, idx } = script;

          const newdata = readFileSync(file);
          this.htmlText = this.htmlText.slice(0, idx) + newdata + this.htmlText.slice(idx + data.length);
        });
        styles.forEach(({ data, idx }, i) => {
          this.htmlText = this.htmlText.slice(0, idx) + sassStyles[i] + this.htmlText.slice(idx + data.length);
        });
        const dirName = pathResolve.slice(0, pathResolve.lastIndexOf("/"));
        if (!existsSync(dirName)) {
          mkdirSync(dirName, { recursive: true });
        }
        writeFileSync(pathResolve, this.htmlText, "utf8");

        const tempDir = `${pathOriginal}${tempFolder}`;
        if (existsSync(tempDir)) {
          readdirSync(tempDir).forEach(file => {
            unlinkSync(`${tempDir}/${file}`);
          });
          rmdirSync(tempDir);
        }

        resolve();
      });
    });
  }
}

export { CompileSource, CompileResource, CompileHtml };
