const threads = require('node:worker_threads');
const { Worker, isMainThread } = threads;

const LOCKED = 0;
const UNLOCKED = 1;

class Mutex {
  constructor(shared, offset = 0, initial = false) {
    this.lock = new Int32Array(shared, offset, 1);
    if (initial) Atomics.store(this.lock, 0, UNLOCKED);
    this.owner = false;
  }

  enter(callback) {
    Atomics.wait(this.lock, 0, LOCKED);
    Atomics.store(this.lock, 0, LOCKED);
    this.owner = true;
    setTimeout(callback, 0);
  }

  leave() {
    if (!this.owner) return false;
    Atomics.store(this.lock, 0, UNLOCKED);
    Atomics.notify(this.lock, 0, 1);
    this.owner = false;
    return true;
  }

  isLocked() {
    return Atomics.load(this.lock, 0) === LOCKED;
  }
}


module.exports = Mutex;