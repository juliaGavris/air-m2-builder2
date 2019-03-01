import fs from "fs";
import path from "path";
import copyfiles from "copyfiles";
import { exec } from "child_process";

export default class Utils {
  constructor() {}

  getRandomInt(max, min = 0) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getAdditional(filename, requires, all = false) {
    let optDep;
    if (!all) {
      optDep = JSON.parse(fs.readFileSync(filename, "utf8"))[requires];
    } else {
      optDep = JSON.parse(fs.readFileSync(filename, "utf8"));
    }
    return optDep == null ? optDep : Object.keys(optDep).map(key => ({ module: key, source: optDep[key] }));
  }

  addUnique(opt, add) {
    const optMap = opt.map(e => e.module);
    add.forEach(e => {
      if (!optMap.includes(e.module)) {
        opt.push(e);
      }
    });
  }

  copyFiles({ from, to, up }) {
    return new Promise(res => {
      copyfiles([from, to], { up }, err => {
        if (err) {
          throw err;
        }

        res();
      });
    });
  }

  getUp(from) {
    return from
      .replace(/\\/g, "/")
      .slice(0, from.indexOf("**"))
      .match(/\//g).length;
  }

  execute({ pkg, test }) {
    return new Promise(res => {
      if (test) {
        const dirname = path.resolve(path.dirname(""));
        const unit = pkg.match(/[-\w]+$/)[0];
        const from = `${dirname}/${pkg}/**/*`;
        this.copyFiles({ from, to: `${dirname}/node_modules/${unit}`, up: this.getUp(from) }).then(error => {
          res(error);
        });
      } else {
        const execString = `npm i --no-save --no-optional ${pkg}`;
        exec(execString, error => {
          res(error);
        });
      }
    });
  }
}
