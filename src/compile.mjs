import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, rmdirSync, unlinkSync } from "fs";
import webpack from "webpack";
import webpackCompileConfig from "../webpack-compiler.config.mjs";
import CompileSass from "./compileSass";

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

    this.htmlText = readFileSync(resPath, "utf8");

    const jsSources = ((text, ...regexp) => {
      const js = [];
      regexp.forEach(reg => {
        const match = text.match(new RegExp(reg, "g"));
        if (match !== null) {
          js.push(match);
        }
      });

      return js;
    })(
      this.htmlText,
      "(?<=<[Ss][Cc][Rr][Ii][Pp][Tt]>)([\\s\\S]*?)(?=<\\/[Ss][Cc][Rr][Ii][Pp][Tt]>)",
      "(?<=<[Vv][Ii][Ee][Ww]-[Ss][Oo][Uu][Rr][Cc][Ee]>)([\\s\\S]*?)(?=<\\/[Vv][Ii][Ee][Ww]-[Ss][Oo][Uu][Rr][Cc][Ee]>)",
      "(?<=<[Ss][Tt][Rr][Ee][Aa][Mm]-[Ss][Oo][Uu][Rr][Cc][Ee]>)([\\s\\S]*?)(?=<\\/[Ss][Tt][Rr][Ee][Aa][Mm]-[Ss][Oo][Uu][Rr][Cc][Ee]>)"
    );

    this.config = {
      configs: [],
      scripts: [],
      sass: new CompileSass({ htmlText: this.htmlText }),
      paths: {
        pathOriginal: resPath.slice(0, resPath.lastIndexOf("/")),
        pathResolve: resolvePath,
        tempFolder: "/$temp"
      }
    };

    const {
      configs,
      scripts,
      paths: { pathOriginal, tempFolder }
    } = this.config;
    if (jsSources !== null) {
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
    }
  }

  run() {
    return new Promise(resolve => {
      const {
        configs,
        scripts,
        sass,
        paths: { pathOriginal, pathResolve, tempFolder }
      } = this.config;
      let promises = [];

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
      promises = promises.concat(sass.compile());

      Promise.all(promises).then(() => {
        scripts
          .sort((a, b) => b.idx - a.idx)
          .forEach(({ file, data, idx }) => {
            const newdata = readFileSync(file, "utf8");
            this.htmlText = this.htmlText.slice(0, idx) + newdata + this.htmlText.slice(idx + data[0].length);
          });
        const { scss, css } = sass;
        scss.reverse().forEach((data, i) => {
          const idx = this.htmlText.indexOf(data);
          this.htmlText =
            this.htmlText.slice(0, idx) + css[scss.length - i - 1] + this.htmlText.slice(idx + data.length);
        });
        const dirName = pathResolve.slice(0, pathResolve.lastIndexOf("/"));
        if (!existsSync(dirName)) {
          mkdirSync(dirName, { recursive: true });
        }
        writeFileSync(pathResolve, this.htmlText.replace(/text\/scss/g, "text/css"), "utf8");

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
