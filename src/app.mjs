import fs from "fs";
import Install from "./install";
import Cache from "./cache";
import utils from "./utils";
import Repl from "./repl.mjs";

let install, installer, requester;

if (!process.argv[2] || process.argv[2].split(":")[1] === "dev") {
  const repl = new Repl();
  repl.start();
  repl.subscribe("event--cache-cleared-all", () => {
    installer.clear();
    console.log("cache cleared completely");
  });
  repl.subscribe("event--cache-clear-by-key", key => {
    if (installer.hasInstance(key)) {
      installer.deleteInstance(key);
      console.log(`cache cleared: ${key}`);
    } else {
      console.log(`unknown cache key: ${key}`);
    }
  });
  repl.subscribe("event--throw-msg", msg => {
    console.log(msg);
  });

  install = new Install();
  installer = new Cache({ createInstance: opt => install.go(opt) });
  requester = new Cache({
    createInstance: ({ module, resolvePath, ...options }) => {
      return new Promise((res, rej) => {
        installer
          .get({ module, resolvePath, ...options })
          .then(() => {
            fs.access(resolvePath, fs.constants.F_OK, err => {
              requester.deleteInstance(module);

              if (err) {
                // console.log(`CACHE ERROR: ${module}`);
                installer.deleteInstance(module);
                installer
                  .get({ module, resolvePath, ...options })
                  .then(() => {
                    res();
                  })
                  .catch(() => {
                    requester.deleteInstance(module);
                    rej();
                  });
              } else {
                res();
              }
            });
          })
          .catch(() => {
            requester.deleteInstance(module);
            rej();
          });
      });
    }
  });
}

export default function after({ dirname, currentName, units, optional }) {
  return function(app) {
    app.get(`/${units.dirS}/`, (req, res) => {
      res.sendFile(dirname + req.originalUrl);
    });
    app.get(`/${units.dirS}/*`, (req, res) => {
      const opt = utils.getRequestOptions({ req, res, dirname, units, currentName, optional });

      if (opt === null) {
        return;
      }

      // console.log(`REQUEST: ${module} -- ${path.fullPath}`);
      requester
        .get(opt)
        .then(() => {
          // console.log(`GET: ${opt.resolvePath} -- OK`);
          return res.sendFile(opt.resolvePath);
        })
        .catch(error => {
          // console.log(`GET: ${opt.resolvePath} -- FAIL`);
          installer.deleteInstance(opt.module);
          res.send(error);
        });
    });
  };
}
