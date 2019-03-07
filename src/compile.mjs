import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, rmdirSync, unlinkSync } from "fs";
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
    const {
      mode,
      resolvePath,
      redundantPaths: { resPath }
    } = opt;
    this.config = {
      configs: [],
      scripts: [],
      paths: {
        pathOriginal: resPath.slice(0, resPath.lastIndexOf("/")),
        pathResolve: resolvePath,
        tempFolder: "/$temp"
      }
    };

    this.htmlText = readFileSync(resPath).asciiSlice();
    const sources = this.htmlText.match(/(?<=<[Ss][Cc][Rr][Ii][Pp][Tt]>)([\s\S]*?)(?=<\/[Ss][Cc][Rr][Ii][Pp][Tt]>)/g);
    if (sources === null) {
      return;
    }

    const {
      configs,
      scripts,
      paths: { pathOriginal, tempFolder }
    } = this.config;
    sources.forEach((data, i) => {
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
  }

  run() {
    return new Promise(resolve => {
      const {
        configs,
        scripts,
        paths: { pathOriginal, pathResolve, tempFolder }
      } = this.config;
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
        const dirName = pathResolve.slice(0, pathResolve.lastIndexOf("/"));
        if (!existsSync(dirName)) {
          mkdirSync(dirName, { recursive: true });
        }
        writeFileSync(pathResolve, this.htmlText, "utf8");

        const tempDir = `${pathOriginal}${tempFolder}`;
        if (existsSync(tempDir)) {
          readdirSync(tempDir).forEach(function(file) {
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
