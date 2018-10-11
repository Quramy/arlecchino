import { YAMLNode } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { setMetadata } from "../yaml-util";
import { NotAllowedValueTypeError } from "../errors";

export function createTemplateStringModel(node: YAMLNode, metadata: Metadata): models.TemplateString {
  if ("valueObject" in node && typeof node.valueObject !== "string") {
    throw new NotAllowedValueTypeError(node, "string");
  }
  return setMetadata({
    template: node.value,
  } as models.TemplateString, metadata, node);
}
