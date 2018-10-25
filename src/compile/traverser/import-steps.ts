import { load, YAMLNode } from "yaml-ast-parser";
import { MetadataInCompilation as Metadata } from "../types";
import { hasKey, withValidateMappingType, withCatchCompileError, withValidateNonNullMaping, withValidateStringType } from "../yaml-util";
import * as schema from "../../schema";
import * as models from "../../model";
import { ImportFileNotFoundError } from "../errors";
import { isStepsDefinitionRootNode, extractStepsFromStepsDefinitionRoot } from "./steps-definition-root";
import { createStepModels } from "./step";

export function isImportStepsNode(node: YAMLNode) {
  return hasKey(node, "import_steps");
}

export function importSteps(node: YAMLNode, metadata: Metadata): models.Step[] {
  return withCatchCompileError(() => {
    const v = withValidateNonNullMaping(withValidateMappingType(node).mappings[0]).value;
    let refId: string | undefined = undefined;
    let fileName: string;
    const targetName = withValidateStringType(v).value;

    const tmp = targetName.match(/([^\$]+)\$([^\$]+)$/);
    if (tmp) {
      fileName = tmp[1];
      refId = tmp[2];
    } else {
      fileName = targetName;
    }

    // check metadata has compiled model
    //
    // check cyclick

    const { absPath, content } = metadata.readFile(fileName);

    // check content
    if (!content) {
      throw new ImportFileNotFoundError(node, absPath);
    }

    metadata.pushFileState(absPath);
    const nodeToImport = load(content);
    if (!isStepsDefinitionRootNode(nodeToImport)) {
      metadata.popFileState();
      throw new Error(); // TODO
    }

    const stepsNode = extractStepsFromStepsDefinitionRoot(nodeToImport, refId, metadata);
    const stepModels = createStepModels(stepsNode, metadata);
    metadata.popFileState();

    return stepModels;
  }, metadata);
}
