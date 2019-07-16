import { YAMLNode } from "yaml-ast-parser";
import * as schema from "../../schema";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, withCatchCompileError, hasKey, convertMapping, withValidateNonNullMaping, withValidateBooleanType } from "../yaml-util";
import { createTemplateStringModel } from "./template-string";

export function isScreenshotStepNode(n: YAMLNode) {
  return n.value === "screenshot" || hasKey(n, "screenshot");
}

export function createScreenshotStepModel(node: YAMLNode, metadata: Metadata): models.ScreenshotStep {
  if (typeof node.value === "string") {
    return withCatchCompileError(() => setMetadata({
      type: "screenshot",
      fullPage: true,
    } as models.ScreenshotStep, metadata, node), metadata);
  } else {
    return withCatchCompileError(() => setMetadata(convertMapping<schema.ScreenshotStepBody, models.ScreenshotStep>(withValidateNonNullMaping(node.mappings[0]).value, {
      full_page: ["fullPage", (n: YAMLNode) => withValidateBooleanType(n).valueObject],
      name: ["name", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
    }, { type: "screenshot", fullPage: true }), metadata, node), metadata);
  }
}
