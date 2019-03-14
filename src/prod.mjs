import { Utils } from "./utils";
import { CompileSource } from "./compile";
import Install from "./install";
import RequestOpt from "./request";

const utils = new Utils();

export default function({ dirname, currentName, units, optional, execute }) {
  const install = new Install({ execute });

  const iterator = optional.values();
  (function bundle() {
    const { value } = iterator.next();
    if (value !== undefined) {
      const { module } = value;
      const req = {
        originalUrl: `/m2units/${module}/index.js`,
        path: `/m2units/${module}/index.js`
      };
      const request = new RequestOpt({ req, dirname, units, currentName, optional, mode: "prod" });

      if (request.error) {
        console.log(request.error);
        bundle();
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
              bundle();
            });
          });
      } else {
        const opt = request.options;
        install.go(opt).then(() => {
          utils
            .prodCopyCompile({
              module: opt.module,
              from: `${dirname}/node_modules/${opt.module}/src/**/*`,
              to: `${dirname}/dist/${units.dirS}/${opt.module}`
            })
            .then(() => {
              bundle();
            });
        });
      }
    }
  })();
}
