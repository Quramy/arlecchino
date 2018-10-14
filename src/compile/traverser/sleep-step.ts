import { YAMLNode, YamlMap as YAMLMap } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, hasKey, withValidateNumberType, withCatchCompileError, withValidateNonNullMaping } from "../yaml-util";

export function isSleepStepNode(node: YAMLNode): node is YAMLMap {
  return hasKey(node, "sleep");
}

export function createSleepStep(node: YAMLMap, metadata: Metadata): models.SleepStep {
  return withCatchCompileError(() => setMetadata({
    type: "sleep",
    time: withValidateNumberType(withValidateNonNullMaping(node.mappings[0]).value).valueObject,
  } as models.SleepStep, metadata, node), metadata);
}
