
export type Remove<T, U> = Pick<T, Exclude<keyof T, U>>;
export type Replace<T, S> = Remove<T, keyof S> & S;
