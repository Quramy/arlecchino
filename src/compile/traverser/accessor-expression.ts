import { YAMLNode } from "yaml-ast-parser";
import { MetadataInCompilation as Metadata } from "../types";
import { AccessorExpression, AccessorParseError, parse } from "../../accessor";
import { AssignmentExpressionParseError } from "../errors";
import { setMetadata } from "../yaml-util";

export function createAccessorExpression(node: YAMLNode, metadata: Metadata): AccessorExpression {
  try {
    return setMetadata(parse(node.value), metadata, node);
  } catch (e) {
    if (e instanceof AccessorParseError) {
      throw new AssignmentExpressionParseError(node, e.message);
    } else {
      throw e;
    }
  }
}
