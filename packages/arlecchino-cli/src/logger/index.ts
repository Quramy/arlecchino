import { Chalk } from "chalk/types";
export type LogLevel = "verbose" | "normal" | "silent";

export interface Logger {
  level: LogLevel;
  chalk: Chalk;
  debug(...msg: string[]): any;
  debugObj(obj: any): any;
  log(...msg: string[]): any;
  error(...msg: string[]): any;
}

export class ConsoleLogger implements Logger {
  level: LogLevel = "normal";
  chalk: Chalk;

  constructor(level: LogLevel) {
    this.level = level;
    this.chalk = require("chalk") as Chalk;
  }

  debug(...msg: [string?, ...string[]]) {
    if (this.level === "verbose") {
      console.log.apply(console, msg);
    }
  }

  debugObj(obj: any) {
    if (this.level === "verbose") {
      console.log(JSON.stringify(obj, null, 2));
    }
  }

  log(...msg: [string?, ...string[]]) {
    if (this.level !== "silent") {
      console.log.apply(console, msg);
    }
  }

  error(...msg: [string?, ...string[]]) {
    if (this.level !== "silent") {
      console.error.apply(console, msg);
    }
  }
}
