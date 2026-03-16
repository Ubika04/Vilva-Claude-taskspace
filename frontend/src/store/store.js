/**
 * Vilva Taskspace — Reactive Store
 * Lightweight reactive state container with subscriber pattern.
 */

class Store {
  #state = {};
  #subscribers = {};

  set(key, value) {
    this.#state[key] = value;
    (this.#subscribers[key] || []).forEach(fn => fn(value));
  }

  get(key) {
    return this.#state[key];
  }

  clear() {
    this.#state = {};
  }

  subscribe(key, fn) {
    if (! this.#subscribers[key]) this.#subscribers[key] = [];
    this.#subscribers[key].push(fn);
    return () => {
      this.#subscribers[key] = this.#subscribers[key].filter(f => f !== fn);
    };
  }
}

export const store = new Store();
