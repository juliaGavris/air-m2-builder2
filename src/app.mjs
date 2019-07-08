import { access, constants } from 'fs';
import Install from './install.mjs';
import Cache from './cache.mjs';
import Repl from './repl.mjs';

export default class App {
  constructor ({ execute }) {
    const repl = new Repl();
    repl.start();
    repl.subscribe('event--cache-cleared-all', () => {
      this.installer.clear();
      console.log('cache cleared completely');
    });
    repl.subscribe('event--cache-clear-by-key', key => {
      let hasKey = false;
      [...this.installer.__queue.keys()].forEach(e => {
        if (e.indexOf(key) > -1) {
          this.installer.deleteInstance(e);
          hasKey = true;
        }
      });
      if (hasKey) {
        console.log(`cache cleared: ${key}`);
      } else {
        console.log(`unknown cache key: ${key}`);
      }
    });
    repl.subscribe('event--throw-msg', msg => {
      console.log(msg);
    });

    const install = new Install({ execute });
    this.installer = new Cache({ createInstance: opt => install.go(opt) });
    this.requester = new Cache({
      createInstance: ({ module, resolvePath, moduleFileNameFull, ...options }) => {
        return new Promise((res, rej) => {
          this.installer
            .get({ module, resolvePath, moduleFileNameFull, ...options })
            .then(() => {
              access(resolvePath, constants.F_OK, err => {
                this.requester.deleteInstance(module + moduleFileNameFull);
                if (err) {
                  this.installer.deleteInstance(module + moduleFileNameFull);
                  this.installer
                    .get({
                      module,
                      resolvePath,
                      moduleFileNameFull,
                      ...options
                    })
                    .then(() => {
                      res();
                    })
                    .catch(() => {
                      this.requester.deleteInstance(module + moduleFileNameFull);
                      rej();
                    });
                } else {
                  res();
                }
              });
            })
            .catch(() => {
              this.requester.deleteInstance(module + moduleFileNameFull);
              rej();
            });
        });
      }
    });
  }
}
