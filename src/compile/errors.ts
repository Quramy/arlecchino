import { YAMLNode, YamlMap as YAMLMap, YAMLMapping } from "yaml-ast-parser";
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
      position: {
        start: this.node.startPosition,
        end: this.node.endPosition,
      },
    }, metadata, 1);
    if (!def) return;
    return `${def.filename}:${def.position.start.line + 1}:${def.position.start.character + 1}` + "\n" + def.contents;
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
  constructor(node: YAMLMapping) {
    super(node.parent || node);
  }

  shortMessage() {
    return `This field is requierd.`;
  }
}

export class RequiredKeyNotExistError extends CompileError {
  constructor(node: YAMLMap, private readonly missingKeys: string[]) {
    super(node);
  }

  shortMessage() {
    return `Some keys are required. Missing keys are ${this.missingKeys.map(k => "'" + k + "'").join(", ")}`;
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
