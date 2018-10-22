import { Counter } from "./types";

export function sleep(time = 0) {
  return new Promise<void>(res => {
    setTimeout(() => res(), time);
  });
}

export function runSequential<T, S>(items: T[], runner: (item: T) => Promise<S>) {
  return items.reduce((acc, x) => acc.then((results) => runner(x).then(r => [...results, r])), Promise.resolve([] as S[]));
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

