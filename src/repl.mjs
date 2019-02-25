export default class REPL {
  constructor() {
    this.__started = false;
    this.__events = {};
  }

  subscribe(eventName, fn) {
    if (!this.__events[eventName]) {
      this.__events[eventName] = [];
    }

    this.__events[eventName].push(fn);

    return () => {
      this.__events[eventName] = this.__events[eventName].filter(eventFn => fn !== eventFn);
    };
  }

  emit(eventName, data) {
    const event = this.__events[eventName];
    if (event) {
      event.forEach(fn => {
        fn.call(null, data);
      });
    }
  }

  start() {
    if (!this.__started) {
      this.__stdin = process.openStdin();
      this.__stdin.on("data", msg => {
        this.process(msg);
      });
    }

    return this;
  }

  splitCmd(str) {
    const args = str
      .toLowerCase()
      .trim()
      .split(/ +/g);
    return { cmd: args.shift(), args };
  }

  process(msg) {
    const { cmd, args } = this.splitCmd(msg.asciiSlice().slice(0, -1));
    switch (cmd) {
      case "clear":
        switch (args[0]) {
          case undefined:
            this.emit("event--throw-msg", "`clear` requires arguments");
            break;

          case "cache": {
            const key = args[1];
            switch (key) {
              case undefined:
              case "all":
                this.emit("event--cache-cleared-all");
                break;

              default:
                this.emit("event--cache-clear-by-key", key);
            }
            break;
          }

          default:
            this.emit("event--throw-msg", `UNKNOWN ARGUMENT: ${args[0]}`);
        }
        break;

      default:
        this.emit("event--throw-msg", `UNKNOWN COMMAND: ${cmd}`);
    }
  }
}
