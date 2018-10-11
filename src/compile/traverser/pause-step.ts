import { YAMLNode } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata } from "../yaml-util";

export function isPauseStepNode(node: YAMLNode) {
  return node.value === "pause";
}

export function createPauseStepModel(node: YAMLNode, metadata: Metadata): models.PauseModel {
  return setMetadata({
    type: "pause",
  } as models.PauseModel, metadata, node);
}

