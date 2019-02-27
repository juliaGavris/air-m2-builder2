import fs from "fs";
import Install from "./install";
import Cache from "./cache";
import Repl from "./repl";
import Request from "./request";

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
      const request = new Request({ req, dirname, units, currentName, optional });

      if (request.error) {
        console.log(request.error);
        res.send(`ERROR '${request.options.module}': no install source error`);
        return;
      } else if (request.mode === "currentModule") {
        res.sendFile(`${dirname}/src/${request.fileName}`);
        return;
      }

      const opt = request.options;

      requester
        .get(opt)
        .then(() => {
          return res.sendFile(opt.resolvePath);
        })
        .catch(error => {
          installer.deleteInstance(opt.module);
          res.send(error);
        });
    });
  };
}
