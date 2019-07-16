import { YAMLNode } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata, withValidateStringType, withCatchCompileError } from "../yaml-util";
import { NotAllowedValueTypeError } from "../errors";

export function createTemplateStringModel(node: YAMLNode, metadata: Metadata): models.TemplateString {
  return withCatchCompileError(() => {
    return setMetadata({
      template: withValidateStringType(node).value,
    } as models.TemplateString, metadata, node)
  }, metadata);
}

export function createFileReferenceModel(node: YAMLNode, metadata: Metadata): models.FileReference {
  return withCatchCompileError(() => {
    return setMetadata({
      template: withValidateStringType(node).value,
      referencedBy: metadata.currentFilename,
    } as models.FileReference, metadata, node)
  }, metadata);
}
