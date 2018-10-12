import fs from "fs";
import path from "path";
import * as mkdirp from "mkdirp";

export interface ResultWriter {
  setPrefix(prefix: string): void,
  writeObjAsJson(obj: any, name: string): Promise<void>;
  writeBinary(buf: Buffer, name: string): Promise<void>;
}

export class DefaultResultWriter implements ResultWriter {
  private prefix: string = "";

  setPrefix(prefix: string) {
    this.prefix = prefix;
    mkdirp.sync(this.prefix);
  }

  writeObjAsJson(obj: any, name: string) {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(path.join(this.prefix, name), JSON.stringify(obj, null, 2), "utf8", (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }

  writeBinary(buf: Buffer, name: string) {
    return new Promise<void>((resolve, reject) => {
      fs.writeFile(path.join(this.prefix, name), buf, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

