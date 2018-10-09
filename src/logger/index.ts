export interface Logger {
  debug(...msg: string[]): any;
  log(...msg: string[]): any;
  error(...msg: string[]): any;
}

export type LogLevel = "verbose" | "normal" | "silent";

export class ConsoleLogger {
  level: LogLevel = "normal";

  constructor() {
  }

  debug(...msg: string[]) {
    if (this.level === "verbose") {
      console.log.apply(console, msg);
    }
  }

  log(...msg: string[]) {
    if (this.level !== "silent") {
      console.log.apply(console, msg);
    }
  }

  error(...msg: string[]) {
    if (this.level !== "silent") {
      console.error.apply(console, msg);
    }
  }
}
