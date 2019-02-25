export default class Cache {
  constructor({ createInstance }) {
    this.__queue = new Map();
    this.__createInstance = createInstance;
  }

  deleteInstance(module) {
    this.__queue.delete(module);
  }

  hasInstance(module) {
    return this.__queue.has(module);
  }

  clear() {
    this.__queue.clear();
  }

  get(opt) {
    if (!this.hasInstance(opt.module)) {
      this.__queue.set(opt.module, this.__createInstance(opt));
    }

    return this.__queue.get(opt.module);
  }
}
