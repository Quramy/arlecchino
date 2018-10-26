import fs from "fs";
import path from "path";
import { YAMLNode } from "yaml-ast-parser";
import * as models from "../model";
import { MetadataInCompilation } from "./types";
import { MetadataMapRecord } from "../types/metadata";
import { CompileError, BaseCyclicImportError } from "./errors";

export class DefaultCompilationContext implements MetadataInCompilation {
  catchCompileError = true;
  readonly baseDir: string;
  readonly fileMap = new Map<string, string>();
  readonly nodeMap = new Map<any, MetadataMapRecord>();
  readonly importedStepModels = new Map<string, models.Step[]>();
  readonly caughtErrors: CompileError[] = [];
  private readingFileStack: { name: string }[] = [];

  constructor({ baseDir, entryFilename, content }: { baseDir: string, entryFilename: string, content: string }) {
    this.baseDir = baseDir;
    entryFilename = path.isAbsolute(entryFilename) ? entryFilename : path.resolve(baseDir, entryFilename);
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

  pushCompieError(error: CompileError) {
    if (!this.caughtErrors) return this;
    error.setOccurringFilename(this.currentFilename);
    this.caughtErrors.push(error);
    return this;
  }

  pushFileState(name: string) {
    if (this.readingFileStack.some(s => s.name === name)) {
      throw new BaseCyclicImportError([...this.readingFileStack, { name }].map(f => path.relative(this.baseDir, f.name)));
    }
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
