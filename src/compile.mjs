import { readFileSync, writeFileSync, mkdirSync } from "fs";
import webpack from "webpack";
import webpackCompileConfig from "../webpack-compiler.config.mjs";

class CompileResource {
  run() {
    return new Promise(resolve => {
      resolve();
    });
  }
}

class CompileDev {
  constructor(opt, { main }) {
    this.opt = opt;
    const { dirname, module, units, mode } = this.opt;

    const path =
      mode === "development"
        ? `${dirname}/node_modules/${module}/${units.dir}`
        : `${dirname}/dist/${units.dirS}/${module}`;
    const compileOpt = {
      mode,
      path,
      entry: `${dirname}/node_modules/${module}/${main}`,
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
    const { mode, resolvePath } = opt;
    this.config = {
      configs: [],
      scripts: [],
      path: resolvePath.slice(0, resolvePath.lastIndexOf("/"))
    };

    this.htmlText = readFileSync(resolvePath).asciiSlice();
    const sources = this.htmlText.match(/(?<=<[Ss][Cc][Rr][Ii][Pp][Tt]>)([\s\S]*?)(?=<\/[Ss][Cc][Rr][Ii][Pp][Tt]>)/g);
    if (sources === null) {
      return;
    }

    const { configs, scripts, path } = this.config;
    sources.forEach((data, i) => {
      const filename = `/script${i}.js`;
      const filenameBundle = `script${i}-bundle.js`;

      writeFileSync(path + filename, data, "utf8");

      const compileOpt = {
        mode,
        path,
        entry: path + filename,
        filename: filenameBundle
      };
      configs.push(webpackCompileConfig(compileOpt));

      scripts.push({ file: `${path}/${filenameBundle}`, data, idx: this.htmlText.indexOf(data) });
    });
  }

  run() {
    return new Promise(resolve => {
      const { configs, scripts, path } = this.config;
      const promises = [];

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

      Promise.all(promises).then(() => {
        scripts.reverse().forEach(script => {
          const { file, data, idx } = script;

          const newdata = readFileSync(file);
          this.htmlText = this.htmlText.slice(0, idx) + newdata + this.htmlText.slice(idx + data.length);
        });
        mkdirSync(`${path}/m2unit`);
        writeFileSync(`${path}/m2unit/index.html`, this.htmlText, "utf8");
        resolve();
      });
    });
  }
}

export { CompileDev, CompileResource, CompileHtml };
