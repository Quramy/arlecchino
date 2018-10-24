import { Replace } from "../types/util";
import {
  Metadata as BaseMetadata,
} from "../types/metadata";

import {
  YAMLNode,
} from "yaml-ast-parser";

import { CompileError } from "./errors";

export interface MetadataInCompilation extends BaseMetadata {
  readonly currentFilename: string;
  readonly caughtErrors: CompileError[];
  pushFileState(absoluteFilename: string): this;
  popFileState(): string;
  catchCompileError: boolean;
  readFile(filename: string): { absPath: string, content?: string };
}

export type CompileErrorsHandler = (errors: CompileError[], metadata: MetadataInCompilation) => void;

export type YAMLNumberValueNode = Replace<YAMLNode, { valueObject: number }>;
export type YAMLBooleanValueNode = Replace<YAMLNode, { valueObject: boolean }>;
