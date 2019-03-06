import { access, constants } from "fs";
import Install from "./install";
import Cache from "./cache";
import Repl from "./repl";

export default class App {
  constructor({ execute }) {
    const repl = new Repl();
    repl.start();
    repl.subscribe("event--cache-cleared-all", () => {
      this.installer.clear();
      console.log("cache cleared completely");
    });
    repl.subscribe("event--cache-clear-by-key", key => {
      if (this.installer.hasInstance(key)) {
        this.installer.deleteInstance(key);
        console.log(`cache cleared: ${key}`);
      } else {
        console.log(`unknown cache key: ${key}`);
      }
    });
    repl.subscribe("event--throw-msg", msg => {
      console.log(msg);
    });

    const install = new Install({ execute });
    this.installer = new Cache({ createInstance: opt => install.go(opt) });
    this.requester = new Cache({
      createInstance: ({ module, resolvePath, ...options }) => {
        return new Promise((res, rej) => {
          this.installer
            .get({ module, resolvePath, ...options })
            .then(() => {
              access(resolvePath, constants.F_OK, err => {
                this.requester.deleteInstance(module);

                if (err) {
                  this.installer.deleteInstance(module);
                  this.installer
                    .get({ module, resolvePath, ...options })
                    .then(() => {
                      res();
                    })
                    .catch(() => {
                      this.requester.deleteInstance(module);
                      rej();
                    });
                } else {
                  res();
                }
              });
            })
            .catch(() => {
              this.requester.deleteInstance(module);
              rej();
            });
        });
      }
    });
  }
}
