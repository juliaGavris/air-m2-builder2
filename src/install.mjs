import fs from "fs";
import { exec } from "child_process";
import Compile from "./compile";
import utils from "./utils";

export default class Install {
  constructor() {
    this.__queue = [];
    this.__pending = false;
  }

  go(opt = {}) {
    return this.install(opt).then(() => {
      const { dirname, module, units, optional } = opt;
      const pkgPath = dirname + `/node_modules/${module}/package.json`;
      if (fs.existsSync(pkgPath)) {
        const additionals = utils.getAdditional(pkgPath, units.requires);
        if (additionals != null) {
          utils.addUnique(optional, additionals);
        }
      }

      return new Compile(opt).run();
    });
  }

  install(opt) {
    if (opt.force || !fs.existsSync(opt.dirname + `/node_modules/${opt.module}`)) {
      return this.pushRequest(opt);
    } else {
      return new Promise(res => {
        res(opt);
      });
    }
  }

  pushRequest(opt) {
    this.__queue.push(opt);

    if (!this.__pending) {
      this.__pending = true;
      this.promise = new Promise((res, rej) => {
        setTimeout(() => {
          this.run()
            .then(() => {
              res();
            })
            .catch(error => {
              rej(error);
            });
        }, 1000);
      });
    }

    return this.promise;
  }

  next(cb) {
    if (this.__queue.length > 0) {
      this.run().then(() => {
        cb();
      });
    } else {
      this.__pending = false;
      cb();
    }
  }

  run() {
    return new Promise((res, rej) => {
      const processing = this.__queue.splice(0, this.__queue.length);
      const pkg = processing
        .reduce((prev, cur) => {
          if (cur.source.match(/^git\+ssh/g)) {
            return prev + cur.source + " ";
          } else if (cur.source.match(/^(\^|~)?\d+\.\d+\.\d+$/g)) {
            return prev + `${cur.module}@${cur.source} `;
          }

          return prev + cur.module + " ";
        }, "")
        .trim();
      const execString = `npm i --no-save --no-optional ${pkg}`;
      const pkgList = pkg.replace(/ /g, "\n").split("\n");
      pkgList.forEach(p => {
        console.log(`install: ${p} ...`);
      });

      exec(execString, error => {
        if (error) {
          console.log(error);
          rej(`ERROR: install error\n${pkgList.join("\n")}`);
          this.__pending = false;
          return;
        }

        pkgList.forEach(p => {
          console.log(`install: ${p} -- ok`);
        });
        this.next(res);
      });
    });
  }
}
