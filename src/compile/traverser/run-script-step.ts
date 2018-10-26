import { YAMLNode, YamlMap as YAMLMap } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, hasKey, withValidateNonNullMaping, withCatchCompileError } from "../yaml-util";
import { createFileReferenceModel } from "./template-string";

export function isRunScriptStepNode(node: YAMLNode): node is YAMLMap {
  return hasKey(node, "run_script");
}

export function createRunScriptStepModel(node: YAMLMap, metadata: Metadata): models.RunScriptStep {
  return withCatchCompileError(() => setMetadata({
    type: "runScript",
    scriptFile: createFileReferenceModel(withValidateNonNullMaping(node.mappings[0]).value, metadata),
  } as models.RunScriptStep, metadata, node), metadata);
}
