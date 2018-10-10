import { YAMLNode } from "yaml-ast-parser";
import { MetadataInCompilation as Metadata } from "./types";
import { getDefinionFromRecord } from "../logger/trace-functions";

export abstract class CompileError extends Error {

  readonly node: YAMLNode;

  constructor(node: YAMLNode) {
    super();
    this.node = node;
  }

  abstract shortMessage(): string;

  definition(metadata: Metadata) {
    const def = getDefinionFromRecord({
      filename: metadata.currentFilename,
      postion: {
        start: this.node.startPosition,
        end: this.node.endPosition,
      },
    }, metadata, 1);
    if (!def) return;
    return `${def.filename}:${def.postion.start.line}:${def.postion.start.character}` + "\n" + def.contents;
  }
}

export class IncludeFileNotFoundError extends CompileError {
  constructor(node: YAMLNode, readonly filenameToBeIncluded: string) {
    super(node);
  }

  shortMessage() {
    return `Cann't find file: ${this.filenameToBeIncluded}`;
  }
}

export class NoSupportedIncludeVariablesFormatError extends CompileError {
  constructor(node: YAMLNode) {
    super(node);
  }

  shortMessage() {
    return `This file is not supported format.`;
  }
}
