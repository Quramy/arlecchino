export function sleep(time = 0) {
  return new Promise<void>(res => {
    setTimeout(() => res(), time);
  });
}
