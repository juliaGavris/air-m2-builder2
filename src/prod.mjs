import utils from "./utils";
import Install from "./install";

const install = new Install();

export default function({ dirname, currentName, units, optional }) {
  let p = 0;

  function bundle() {
    for (let i = p; i < optional.length; i++) {
      const e = optional[i];
      const req = {
        originalUrl: `/m2units/${e.module}/index.js`,
        path: `/m2units/${e.module}/index.js`
      };
      const opt = utils.getRequestOptions({ req, res: null, dirname, units, currentName, optional, mode: "prod" });
      if (typeof opt === "object") {
        opt.force = true;
        opt.mode = "production";

        install.go(opt).then(() => {
          if (opt.resources) {
            const from = `${dirname}/node_modules/${opt.module}/src/**/*`;
            utils.copyFiles({
              from,
              to: `${dirname}/dist/${units.dirS}/${opt.module}`,
              up: utils.getUp(from),
              module: opt.module
            });
          }
          if (p < optional.length) {
            bundle();
          }
        });
      } else {
        if (opt === "currentModule") {
          const from = `${dirname}/src/**/*`;
          utils.copyFiles({
            from,
            to: `${dirname}/dist/${units.dirS}/${currentName}`,
            up: utils.getUp(from),
            module: currentName
          });
        }
      }
    }
    p = optional.length;
  }
  bundle();
}
