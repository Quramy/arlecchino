import { YAMLNode, YamlMap as YAMLMap } from "yaml-ast-parser";
import * as schema from "../../schema";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, hasKey, convertMapping, normalizeOneOrMany, withValidateMappingType, withValidateNonNullMaping, withCatchCompileError, withValidateBooleanType } from "../yaml-util";
import { createTemplateStringModel } from "./template-string";

export function isReserveDialogAnswerStepNode(node: YAMLNode) {
  return node.value === "reserve_dialog_answer" || hasKey(node, "reserve_dialog_answer");
}

export function createReserveNextDialogAnswerStepModel(node: YAMLNode, metadata: Metadata): models.ReserveNextDialogAnswerStep {
  if (node.value === "reserve_dialog_answer") {
    return setMetadata({
      type: "reserveNextDialogAnswer",
      isAccept: true,
    } as models.ReserveNextDialogAnswerStep, metadata, node);
  } else {
    return withCatchCompileError(
      () => setMetadata(convertMapping<schema.ReserveDialogAnswerStepBody, models.ReserveNextDialogAnswerStep>(
          withValidateMappingType(withValidateNonNullMaping(node.mappings[0]).value),
          {
            accept: ["isAccept", (node: YAMLNode) => withValidateBooleanType(node).valueObject],
            text: ["text", (node: YAMLNode) => createTemplateStringModel(node, metadata)],
          },
          { "type": "reserveNextDialogAnswer" },
        ),
        metadata,
        node),
      metadata
    );
  }
}
