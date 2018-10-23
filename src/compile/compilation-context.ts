import fs from "fs";
import path from "path";
import { YAMLNode } from "yaml-ast-parser";
import { MetadataInCompilation } from "./types";
import { MetadataMapRecord } from "../types/metadata";

export class DefaultCompilationContext implements MetadataInCompilation {
  currentFilename: string;
  catchCompileError = true;
  readonly fileMap = new Map<string, string>();
  readonly nodeMap = new Map<any, MetadataMapRecord>();
  readonly caughtErrors = [];

  constructor({ entryFilename, content }: { entryFilename: string, content: string }) {
    this.currentFilename = entryFilename;
    this.fileMap.set(entryFilename, content);
  }

  readFile(targetFilename: string) {
    const filename = path.isAbsolute(targetFilename) ? targetFilename : path.resolve(path.dirname(this.currentFilename), targetFilename);
    if (this.fileMap.has(filename)) {
      return {
        absPath: filename,
        content: this.fileMap.get(filename),
      };
    }
    if (!fs.existsSync(filename)) {
      return {
        absPath: filename,
      };
    }
    const content = fs.readFileSync(filename, "utf8");
    this.fileMap.set(filename, content);
    return {
      absPath: filename,
      content,
    }
  }
}
