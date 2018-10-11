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
  constructor(node: YAMLNode, private readonly filenameToBeIncluded: string) {
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

export class NoRequiredValueError extends CompileError {
  constructor(node: YAMLNode) {
    super(node.parent || node);
  }

  shortMessage() {
    return `This field is requierd.`;
  }
}

export class NotAllowedKeyError extends CompileError {
  constructor(node: YAMLNode, private readonly key: string, private readonly allowedKeys: string[]) {
    super(node);
  }

  shortMessage() {
    return `Key '${this.key}' is not allowed in this position. Allowed keys are ${this.allowedKeys.map(k => "'" + k + "'").join(", ")}`;
  }
}

export class NotAllowedValueTypeError extends CompileError {

  constructor(node: YAMLNode, private readonly type: string) {
    super(node);
  }

  shortMessage() {
    return `This field should be ${this.type}.`;
  }
}
