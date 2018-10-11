import { Replace } from "../types/util";
import {
  Metadata as BaseMetadata,
} from "../types/metadata";

import {
  YAMLNode,
} from "yaml-ast-parser";

export type MetadataInCompilation = BaseMetadata & {
  currentFilename: string,
};

export type YAMLNumberValueNode = Replace<YAMLNode, { valueObject: number }>;
export type YAMLBooleanValueNode = Replace<YAMLNode, { valueObject: boolean }>;
