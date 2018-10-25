import { YAMLNode, YamlMap as YAMLMap, YAMLMapping, YAMLSequence } from "yaml-ast-parser";
import chalk, { Chalk } from "chalk";
import { MetadataInCompilation as Metadata } from "./types";
import { getDefinionFromRecord, getDefinionLinesFromRecord } from "../logger/trace-functions";

export abstract class CompileError extends Error {

  readonly node: YAMLNode;
  chalk!: Chalk;
  private occurringFilename?: string;

  constructor(node: YAMLNode) {
    super();
    this.chalk = chalk;
    this.node = node;
  }

  setOccurringFilename(filename: string) {
    this.occurringFilename = filename;
  }

  abstract shortMessage(): string;

  definition(metadata: Metadata) {
    if (!this.occurringFilename) return;
    return getDefinionLinesFromRecord({
      filename: this.occurringFilename,
      position: {
        start: this.node.startPosition,
        end: this.node.endPosition,
      },
    }, metadata);
  }
}

export class ImportFileNotFoundError extends CompileError {
  constructor(node: YAMLNode, private readonly filename: string) {
    super(node);
  }

  shortMessage() {
    return `Cann't find file: ${this.filename}`;
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
    return `This value should be ${this.type}.`;
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

export class TooManyStepsDefinitionsError extends CompileError {
  constructor(node: YAMLNode) {
    super(node);
  }

  shortMessage() {
    return "There is a sequence which has more than 2 steps items. But you tried to import without ref_id. Specify which steps to import with '<filename>$<ref_id>'.";
  }
}

export class NoStepsFoundError extends CompileError {
  constructor(node: YAMLNode, private refId: string | undefined) {
    super(node);
  }

  shortMessage() {
    if (!this.refId) {
      return "There is no steps to import.";
    }
    return `There is no steps to import whose ref_id is '${this.refId}'.`;
  }
}
