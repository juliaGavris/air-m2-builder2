import { Utils } from "./utils";
import { CompileSource } from "./compile";
import Install from "./install";
import RequestOpt from "./request";

const utils = new Utils();

export default class BuildProd {
  constructor(opt) {
    this.opt = opt;
    this.inprocess = [];
    this.install = new Install({ execute: this.opt.execute });
  }

  next() {
    const { optional } = this.opt;

    for (let option of optional) {
      const { module } = option;
      if (!this.inprocess.includes(module)) {
        this.inprocess.push(module);
        this.bundle(option);
      }
    }
  }

  bundle(value) {
    const { dirname, currentName, units, optional } = this.opt;
    const { module } = value;
    const req = {
      originalUrl: `/m2units/${module}/index.js`,
      path: `/m2units/${module}/index.js`
    };
    const request = new RequestOpt({ req, dirname, units, currentName, optional, mode: "prod" });

    if (request.error) {
      console.log(request.error);
      this.next();
    } else if (request.mode === "currentModule") {
      utils
        .prodCopyCompile({
          module: currentName,
          from: `${dirname}/src/**/*`,
          to: `${dirname}/dist/${units.dirS}/${currentName}`
        })
        .then(() => {
          const opt = request.options;
          const path = `${dirname}/dist/${opt.units.dirS}/${opt.module}`;
          const entry = `${dirname}/src/index.js`;
          new CompileSource(opt, { path, entry }).run().then(() => {
            this.next();
          });
        });
    } else {
      const opt = request.options;
      this.install.go(opt).then(() => {
        utils
          .prodCopyCompile({
            module: opt.module,
            from: `${dirname}/node_modules/${opt.module}/src/**/*`,
            to: `${dirname}/dist/${units.dirS}/${opt.module}`
          })
          .then(() => {
            this.next();
          });
      });
    }
  }
}
