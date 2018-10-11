import { YAMLNode } from "yaml-ast-parser";
import * as schema from "../../schema";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, hasKey, mapWithMappingsNode, normalizeOneOrMany } from "../yaml-util";
import { createTemplateStringModel } from "./template-string";


export function isFindStepNode(node: YAMLNode) {
  return hasKey(node, "find");
}

export function createFindStepModel(node: YAMLNode, metadata: Metadata): models.FindStep {
  return setMetadata(mapWithMappingsNode<schema.FindStepBody, models.FindStep>(node.mappings[0].value, {
    action: ["actions", (n: YAMLNode) => createFindStepActionModels(n, metadata)],
    with_text: ["withText", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
    query: ["query", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
    find: ["child", (n: YAMLNode) => createFindStepModel(n, metadata)],
  }, {
    type: "find",
  }), metadata, node);
}

export function createFindStepActionModels(node: YAMLNode, metadata: Metadata): models.FindStepAction[] {
  return setMetadata(normalizeOneOrMany(node).map(x => {
    let obj: models.FindStepAction;
    if (x.value === "click") {
      obj = { type: "click" } as models.ClickAction;
    } else {
      obj = mapWithMappingsNode<schema.FindInputAction, models.TextInputAction>(x, {
        input: ["value", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
      }, {
        type: "textInput",
      });
    }
    return setMetadata(obj, metadata, x);
  }) as models.FindStepAction[], metadata, node);
}
