import { Replace } from "../types/util";
import {
  Metadata as BaseMetadata,
} from "../types/metadata";

import {
  YAMLNode,
} from "yaml-ast-parser";

import { CompileError } from "./errors";

export type MetadataInCompilation = BaseMetadata & {
  caughedErrors: CompileError[];
  catchCompileError: boolean;
  currentFilename: string,
};

export type CompileErrorsHandler = (errors: CompileError[], metadata: MetadataInCompilation) => void;

export type YAMLNumberValueNode = Replace<YAMLNode, { valueObject: number }>;
export type YAMLBooleanValueNode = Replace<YAMLNode, { valueObject: boolean }>;
