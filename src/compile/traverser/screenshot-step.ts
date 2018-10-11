import { YAMLNode } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata } from "../yaml-util";

export function isScreenshotStepNode(n: YAMLNode) {
  return n.value === "screenshot";
}

export function createScreenshotStepModel(node: YAMLNode, metadata: Metadata): models.ScreenshotStep {
  return setMetadata({
    type: "screenshot",
    fullPage: true,
  } as models.ScreenshotStep, metadata, node);
}