import { YAMLNode, YamlMap as YAMLMap, YAMLMapping, YAMLSequence } from "yaml-ast-parser";
import chalk, { Chalk } from "chalk";
import { MetadataInCompilation as Metadata } from "./types";
import { getDefinionFromRecord, getDefinionLinesFromRecord } from "../logger/trace-functions";

export abstract class CompileError extends Error {

  readonly node: YAMLNode;
  chalk!: Chalk;

  constructor(node: YAMLNode) {
    super();
    this.chalk = chalk;
    this.node = node;
  }

  abstract shortMessage(): string;

  definition(metadata: Metadata) {
    return getDefinionLinesFromRecord({
      filename: metadata.currentFilename,
      position: {
        start: this.node.startPosition,
        end: this.node.endPosition,
      },
    }, metadata);
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
    return `A value is required.`;
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

export class NotMatchedSequenceItemError extends CompileError {

  constructor(node: YAMLNode) {
    super(node);
  }

  shortMessage() {
    return "This item is not allowed in this sequence.";
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

export class AssignmentExpressionParseError extends CompileError {
  constructor(node: YAMLNode, private readonly msg: string) {
    super(node);
  }

  shortMessage() {
    return this.msg;
  }
}
