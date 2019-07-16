import { YAMLNode, YamlMap as YAMLMap } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, hasKey, withValidateNonNullMaping, normalizeOneOrMany, withCatchCompileError } from "../yaml-util";
import { createTemplateStringModel } from "./template-string";

export function isEchoStepNode(node: YAMLNode): node is YAMLMap {
  return hasKey(node, "echo");
}

export function createEchoStepModel(node: YAMLNode, metadata: Metadata): models.EchoStep {
  return withCatchCompileError(() => setMetadata({
    type: "echo",
    messages: normalizeOneOrMany(withValidateNonNullMaping(node.mappings[0]).value).map(n => createTemplateStringModel(n, metadata)),
  } as models.EchoStep, metadata, node), metadata);
}
