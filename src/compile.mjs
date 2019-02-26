import fs from "fs";
import webpack from "webpack";
import webpackCompileConfig from "../webpack-compiler.config.mjs";

export default class Compile {
  constructor() {}

  go(opt) {
    if (this.config(opt)) {
      return this.run();
    }

    opt.resources = true;
    return new Promise(resolve => {
      resolve();
    });
  }

  config({ dirname, module, units, mode = "development" }) {
    const pkg = JSON.parse(fs.readFileSync(dirname + `/node_modules/${module}/package.json`, "utf8"));

    const match = pkg.main.match(/\.\w+$/g);
    const extension = match ? match[0] : null;
    const path =
      mode === "development"
        ? `${dirname}/node_modules/${module}/${units.dir}`
        : `${dirname}/dist/${units.dirS}/${module}`;

    if (extension === ".js") {
      const compileOpt = {
        mode,
        path,
        entry: `${dirname}/node_modules/${module}/${pkg.main}`,
        filename: "index.js"
      };
      this.__config = webpackCompileConfig(compileOpt);
      this.__module = module;

      return true;
    }

    return false;
  }

  run() {
    return new Promise((res, rej) => {
      console.log(`compile: ${this.__module} ...`);

      const compiler = webpack(this.__config);

      compiler.run((error, stats) => {
        if (stats.hasErrors()) {
          console.log(`ERROR: ${this.__module} compile error`);
          console.log(stats.compilation.errors);
          rej(`ERROR '${this.__module}': compile error`);
          return;
        }

        console.log(`compile: ${this.__module} -- ok`);
        res();
      });
    });
  }
}
