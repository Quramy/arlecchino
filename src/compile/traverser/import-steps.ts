import { load, YAMLNode } from "yaml-ast-parser";
import { MetadataInCompilation as Metadata } from "../types";
import { hasKey, withValidateMappingType, withCatchCompileError, withValidateNonNullMaping, withValidateStringType } from "../yaml-util";
import * as schema from "../../schema";
import * as models from "../../model";
import { ImportFileNotFoundError } from "../errors";

export function isImportStepsNode(node: YAMLNode) {
  return hasKey(node, "import_steps");
}

export function importSteps(node: YAMLNode, metadata: Metadata): models.Step[] {
  return withCatchCompileError(() => {
    const v = withValidateNonNullMaping(withValidateMappingType(node).mappings[0]).value;
    const targetName = withValidateStringType(v).value;

    // check metadata has compiled model
    //
    // check cyclick

    const { absPath, content } = metadata.readFile(targetName);

    // check content
    if (!content) {
      throw new ImportFileNotFoundError(node, absPath);
    }

    const stepsNode = load(content);

    metadata.pushFileState(absPath);

    // compile

    metadata.popFileState();

    throw new Error();
  }, metadata);
}
