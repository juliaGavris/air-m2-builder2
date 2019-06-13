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
    const { module, moduleFileNameFull } = opt;

    if (!this.hasInstance(module + moduleFileNameFull)) {
      this.__queue.set(module + moduleFileNameFull, this.__createInstance(opt));
    }

    return this.__queue.get(module + moduleFileNameFull);
  }
}
