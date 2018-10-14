import { Counter } from "./types";

export function sleep(time = 0) {
  return new Promise<void>(res => {
    setTimeout(() => res(), time);
  });
}

export class SimpleCounter implements Counter {
  private count = 0;

  getAndIncrement() {
    return ++this.count;
  }

  get() {
    return this.count;
  }

  reset() {
    this.count = 0;
  }
}

