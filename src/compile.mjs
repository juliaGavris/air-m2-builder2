import webpack from "webpack";
import webpackCompileConfig from "../webpack-compiler.config.mjs";
import CompileSass from "./compileSass.mjs";
import fs from "fs";
import MemoryFS from 'memory-fs';

const memfs = new MemoryFS();
const statOrig = memfs.stat.bind(memfs);
const readFileOrig = memfs.readFile.bind(memfs);
memfs.stat = function (path, cb) {
  statOrig(path, function(err, result) {
    if (err) {
      return fs.stat(path, cb);
    } else {
      return cb(err, result);
    }
  });
};
memfs.readFile = function (path, cb) {
  readFileOrig(path, function (err, result) {
    if (err) {
      return fs.readFile(path, cb);
    } else {
      return cb(err, result);
    }
  });
};

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
      buildMode: this.opt.buildMode,
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
      buildMode,
      resolvePath,
      redundantPaths: { resPath },
      importPathResolve
    } = opt;

    this.htmlText = fs.readFileSync(resPath, "utf8");

    const jsSources = ((text, ...regexp) => {
      const js = [];
      regexp.forEach(reg => {
        const match = text.match(new RegExp(reg, "gi"));
        if (match !== null) {
          js.push(...match);
        }
      });

      return js;
    })(
      this.htmlText,
      "(?<=<script>)([\\s\\S]*?)(?=<\\/script>)",
      "(?<=<view-source>)([\\s\\S]*?)(?=<\\/view-source>)",
      "(?<=<stream-source>)([\\s\\S]*?)(?=<\\/stream-source>)"
    );

    const croppedPath = resPath.slice(0, resPath.lastIndexOf("/"));
    this.config = {
      configs: [],
      scripts: [],
      sass: new CompileSass({ htmlText: this.htmlText, filePath: croppedPath }),
      paths: {
        pathOriginal: croppedPath,
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

        if (!memfs.existsSync(tempDir)) {
          memfs.mkdirpSync(tempDir);
        }

        scripts.push({ file: `${tempDir}/${filenameBundle}`, idx: this.htmlText.indexOf(data), len: data.length });
        if (importPathResolve) {
          data = importPathResolve(data);
        }
        memfs.writeFileSync(`${tempDir}${filename}`, data, 'utf8');
        const compileOpt = {
          buildMode,
          path: tempDir,
          entry: `${tempDir}${filename}`,
          filename: filenameBundle
        };
        configs.push(webpackCompileConfig(compileOpt));
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
        compiler.inputFileSystem = memfs;
        compiler.resolvers.normal.fileSystem = memfs;
        compiler.outputFileSystem = memfs;

        promises.push(
          new Promise((res, rej) => {
            compiler.run((error, stats) => {
              if (stats.hasErrors()) {
                console.log(`ERROR: ${compiler.options.entry} compile error`);
                rej(`ERROR '${compiler.options.entry}': compile error`);
                return;
              }
              res();
            });
          })
        );
      });
      promises = promises.concat(sass.compile());

      Promise.all(promises).then(() => {
        const { scss, css } = sass;
        Array.prototype
          .concat(scripts, scss)
          .sort((a, b) => b.idx - a.idx)
          .forEach(({ file, cssIndex, idx, len }) => {
            let newdata;
            if (file) {
              newdata = memfs.readFileSync(file, "utf8");
            } else {
              newdata = css[cssIndex];
            }
            this.htmlText = this.htmlText.slice(0, idx) + newdata + this.htmlText.slice(idx + len);
          });
        this.htmlText = this.htmlText
          .replace(/\s*type\s*=\s*["']?\s*text\/scss\s*["']?\s*/g, " ")
          .replace(/<view-source>/gi, '<script data-source-type="view-source">')
          .replace(/<\/view-source>/gi, "</script>")
          .replace(/<stream-source>/gi, '<script data-source-type="stream-source">')
          .replace(/<\/stream-source>/gi, "</script>");
        const dirName = pathResolve.slice(0, pathResolve.lastIndexOf("/"));
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        fs.writeFileSync(pathResolve, this.htmlText, "utf8");

        resolve(this.htmlText);
      });
    });
  }
}

export { CompileSource, CompileResource, CompileHtml };