import { load, YAMLNode } from "yaml-ast-parser";
import { MetadataInCompilation as Metadata } from "../types";
import { hasKey, withValidateMappingType, withCatchCompileError, withValidateNonNullMaping, withValidateStringType } from "../yaml-util";
import * as schema from "../../schema";
import * as models from "../../model";
import { ImportFileNotFoundError, NoStepsFoundError, BaseCyclicImportError, CyclicImportError } from "../errors";
import { isStepsDefinitionRootNode, extractStepsFromStepsDefinitionRoot } from "./steps-definition-root";
import { createStepModels } from "./step";

export function isImportStepsNode(node: YAMLNode) {
  return hasKey(node, "import_steps");
}

export function importSteps(node: YAMLNode, metadata: Metadata): models.Step[] {
  const v = withValidateNonNullMaping(withValidateMappingType(node).mappings[0]).value;
  let refId: string | undefined = undefined;
  let fileName: string;
  const targetName = withValidateStringType(v).value;

  if (metadata.importedStepModels.has(targetName)) {
    return metadata.importedStepModels.get(targetName) as models.Step[];
  }

  const tmp = targetName.match(/([^\$]+)\$([^\$]+)$/);
  if (tmp) {
    fileName = tmp[1];
    refId = tmp[2];
  } else {
    fileName = targetName;
  }

  const { absPath, content } = metadata.readFile(fileName);

  if (!content) {
    throw new ImportFileNotFoundError(node, absPath);
  }

  try {
    metadata.pushFileState(absPath);
  } catch (error) {
    if (error instanceof BaseCyclicImportError) {
      withCatchCompileError(() => {
        throw new CyclicImportError(node, error);
      }, metadata);
      return [];
    }
    throw error;
  }

  const ret = withCatchCompileError(() => {

    const nodeToImport = load(content);
    if (!isStepsDefinitionRootNode(nodeToImport)) {
      throw new NoStepsFoundError(nodeToImport, refId);
    }

    const stepsNode = extractStepsFromStepsDefinitionRoot(nodeToImport, refId, metadata);
    return createStepModels(stepsNode, metadata);
  }, metadata, []);
  metadata.popFileState();
  metadata.importedStepModels.set(targetName, ret);
  return ret;
}
