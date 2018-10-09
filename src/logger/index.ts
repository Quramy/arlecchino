export type LogLevel = "verbose" | "normal" | "silent";

export interface Logger {
  level: LogLevel;
  debug(...msg: string[]): any;
  debugObj(obj: any): any;
  log(...msg: string[]): any;
  error(...msg: string[]): any;
}

export class ConsoleLogger {
  level: LogLevel = "normal";

  constructor() {
  }

  debug(...msg: string[]) {
    if (this.level === "verbose") {
      console.log.apply(console, msg);
    }
  }

  debugObj(obj: any) {
    if (this.level === "verbose") {
      console.log(JSON.stringify(obj, null, 2));
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
