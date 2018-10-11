import { YAMLNode, YamlMap as YAMLMap } from "yaml-ast-parser";
import * as schema from "../../schema";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, hasKey, convertMapping, normalizeOneOrMany, withValidateMappingType, withValidateNonNullMaping } from "../yaml-util";
import { createTemplateStringModel } from "./template-string";

export function isFindStepNode(node: YAMLNode): node is YAMLMap {
  return hasKey(node, "find");
}

export function createFindStepModel(node: YAMLMap, metadata: Metadata): models.FindStep {
  function createInternal(node: YAMLNode): models.FindStep {
    return setMetadata(convertMapping<schema.FindStepBody, models.FindStep>(withValidateMappingType(node), {
      query: ["query", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
      with_text: ["withText", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
      action: ["actions", (n: YAMLNode) => createFindStepActionModels(n, metadata)],
      find: ["child", createInternal],
    }, {
      type: "find",
    },
    {
      requiredKeys: ["query"],
    }), metadata, node);
  }
  return createInternal(withValidateNonNullMaping(node.mappings[0]).value);
}

export function createFindStepActionModels(node: YAMLNode, metadata: Metadata): models.FindStepAction[] {
  return setMetadata(normalizeOneOrMany(node).map(x => {
    let obj: models.FindStepAction;
    if (x.value === "click") {
      obj = { type: "click" } as models.ClickAction;
    } else if (hasKey(x, "input")) {
      obj = convertMapping<schema.FindInputAction, models.TextInputAction>(x, {
        input: ["value", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
      }, {
        type: "textInput",
      });
    } else if (hasKey(x, "upload")) {
      obj = convertMapping<schema.FindUploadAction, models.FileUploadAction>(x, {
        upload: ["files", (n: YAMLNode) => normalizeOneOrMany(n).map(nn => createTemplateStringModel(nn, metadata))],
      }, {
        type: "fileUpload",
        referencedBy: metadata.currentFilename,
      });
    } else {
      // TODO
      throw new Error();
    }
    return setMetadata(obj, metadata, x);
  }) as models.FindStepAction[], metadata, node);
}
