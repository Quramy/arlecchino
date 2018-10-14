import { YAMLNode } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, withCatchCompileError } from "../yaml-util";
import { createTemplateStringModel } from "./template-string";

export function isWaitForNavigationStepNode(node: YAMLNode) {
  return node.value === "wait_for_navigation";
}

export function createWaitForNavigationStepModel(node: YAMLNode, metadata: Metadata): models.WaitForNavigationStep {
  return withCatchCompileError(() => setMetadata({
    type: "waitForNavigation",
    timeout: 10_000,
  } as models.WaitForNavigationStep, metadata, node), metadata);
}
