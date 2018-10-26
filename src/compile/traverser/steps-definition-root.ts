import { YAMLNode, YAMLMapping, YAMLSequence, YamlMap as YAMLMap } from "yaml-ast-parser";
import * as schema from "../../schema";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";

import { isSuiteSchema } from "./suite";
import { hasKey, isSequence, pick, withValidateStringType, withCatchCompileError } from "../yaml-util";
import { TooManyStepsDefinitionsError, NoStepsFoundError } from "../errors";

export function isStepsDefinitionRootNode(node: YAMLNode) {
  if (hasKey(node, "steps")) return true;
  if (isSequence(node)) {
    return node.items.every(n => hasKey(n, "steps"));
  }
  if (isSuiteSchema(node)) {
    const scenarioNode = pick(node, "scenario");
    if (!scenarioNode) return false;
    if (hasKey(scenarioNode, "steps")) {
      return true;
    }
    if (isSequence(scenarioNode)) {
      return scenarioNode.items.every(n => hasKey(n, "steps"));
    }
  }
  return false;
}

export function extractStepsFromStepsDefinitionRoot(node: YAMLNode, refId: string | undefined, metadata: Metadata) {
  const findSteps = (targetNode: YAMLNode) => {
    if (hasKey(targetNode, "steps")) {
      if (!refId) {
        return pick(targetNode, "steps");
      }
      const refIdNode = pick(targetNode, "ref_id");
      if (!refIdNode || withValidateStringType(refIdNode).value !== refId) return;
      return pick(targetNode, "steps");
    } else if (isSequence(targetNode)) {
      if (!refId && targetNode.items.length !== 1) {
        throw new TooManyStepsDefinitionsError(targetNode);
      }
      if (!refId) {
        return targetNode.items[0];
      }
      const hit = targetNode.items.find(n => {
        const refIdNode = pick(n as YAMLMap, "ref_id");
        if (!refIdNode) return false;
        return refId === withValidateStringType(refIdNode).value;
      });
      if (!hit) return;
      return pick(hit as YAMLMap, "steps");
    }
  };
  let found: YAMLNode | undefined = findSteps(node);
  if (isSuiteSchema(node)) {
    found = findSteps(pick(node, "scenario") as YAMLNode);
  }
  if (!found) {
    throw new NoStepsFoundError(node, refId);
  }
  return found as YAMLSequence;
}
