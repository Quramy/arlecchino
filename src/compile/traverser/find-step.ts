import { YAMLNode, YamlMap as YAMLMap } from "yaml-ast-parser";
import * as schema from "../../schema";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, hasKey, convertMapping, normalizeOneOrMany, withValidateMappingType, withValidateNonNullMaping, withCatchCompileError } from "../yaml-util";
import { createTemplateStringModel } from "./template-string";
import { parse } from "../../accessor";
import { createAccessorExpression } from "./accessor-expression";
import { NotMatchedSequenceItemError } from "../errors";

export function isFindStepNode(node: YAMLNode): node is YAMLMap {
  return hasKey(node, "find");
}

export function createFindStepModel(node: YAMLMap, metadata: Metadata): models.FindStep {
  function createInternal(node: YAMLNode): models.FindStep {
    return withCatchCompileError(
      () => setMetadata(convertMapping<schema.FindStepBody, models.FindStep>(withValidateMappingType(node), {
        query: ["query", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
        with_text: ["withText", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
        traverse: ["traverse", (n: YAMLNode) => createFindStepTraverseModels(n, metadata)],
        store: ["toStores", (n: YAMLNode) => createFindStepStoreModels(n, metadata)],
        action: ["actions", (n: YAMLNode) => createFindStepActionModels(n, metadata)],
        find: ["child", createInternal],
      }, { type: "find" }, { requiredKeys: ["query"] }), metadata, node),
      metadata,
    );
  }
  return createInternal(withValidateNonNullMaping(node.mappings[0]).value);
}

export function createFindStepTraverseModels(node: YAMLNode, metadata: Metadata): models.FindTraverse[] {
  return withCatchCompileError(() => setMetadata(normalizeOneOrMany(node).map(x => {
    const v = x.value as schema.FindTraverse;
    let m: models.FindTraverse | null = null;
    if (v === "prev")        m = { type: "previous"   } as models.FindTraverse;
    if (v === "next")        m = { type: "next"       } as models.FindTraverse;
    if (v === "parent")      m = { type: "parent"     } as models.FindTraverse;
    if (v === "first_child") m = { type: "firstChild" } as models.FindTraverse;
    if (v === "last_child")  m = { type: "lastChild"  } as models.FindTraverse;
    if (m) return setMetadata(m, metadata, x);
    throw new NotMatchedSequenceItemError(x);
  }), metadata, node), metadata);
}

export function createFindStepStoreModels(node: YAMLNode, metadata: Metadata): models.FindStore[] {
  return withCatchCompileError(() => setMetadata(normalizeOneOrMany(node).map(x => {
    return convertMapping<schema.FindStore, models.FindStore>(x, {
      from: ["from", (n: YAMLNode) => {
        return setMetadata(n.value, metadata, n);
      }],
      to: ["expression", (n: YAMLNode) => createAccessorExpression(n, metadata)],
    }, { }, { requiredKeys: ["from", "to"] });
  }) as models.FindStore[], metadata, node), metadata);
}

export function createFindStepActionModels(node: YAMLNode, metadata: Metadata): models.FindStepAction[] {
  return withCatchCompileError(() => setMetadata(normalizeOneOrMany(node).map(x => {
    let obj: models.FindStepAction;
    if (x.value === "click") {
      obj = { type: "click" } as models.ClickAction;
    } else if (x.value === "submit") {
      obj = { type: "submit" } as models.SubmitAction;
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
  }) as models.FindStepAction[], metadata, node), metadata);
}
