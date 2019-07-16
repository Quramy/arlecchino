import { YAMLNode, YamlMap as YAMLMap } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, hasKey, withValidateNonNullMaping, withCatchCompileError } from "../yaml-util";
import { createTemplateStringModel } from "./template-string";

export function isGotoStepNode(node: YAMLNode): node is YAMLMap {
  return hasKey(node, "goto");
}

export function createGotoStepModel(node: YAMLMap, metadata: Metadata): models.GotoStep {
  return withCatchCompileError(() => setMetadata({
    type: "goto",
    urlFragment: createTemplateStringModel(withValidateNonNullMaping(node.mappings[0]).value, metadata),
  } as models.GotoStep, metadata, node), metadata);
}
