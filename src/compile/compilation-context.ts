import fs from "fs";
import path from "path";
import { YAMLNode } from "yaml-ast-parser";
import { MetadataInCompilation } from "./types";
import { MetadataMapRecord } from "../types/metadata";

export class DefaultCompilationContext implements MetadataInCompilation {
  catchCompileError = true;
  readonly fileMap = new Map<string, string>();
  readonly nodeMap = new Map<any, MetadataMapRecord>();
  readonly caughtErrors = [];
  private readingFileStack: { name: string }[] = [];

  constructor({ entryFilename, content }: { entryFilename: string, content: string }) {
    this.pushFileState(entryFilename);
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

  get currentFilename() {
    return this.readingFileStack[this.readingFileStack.length - 1].name;
  }

  pushFileState(name: string) {
    this.readingFileStack.push({ name });
    return this;
  }

  popFileState() {
    const state = this.readingFileStack.pop();
    if (!state) {
      throw new Error();
    }
    return state.name;
  }
}
