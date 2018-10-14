import assert from "assert";
import { load } from "yaml-ast-parser";
import { MetadataInCompilation } from "../types";
import { dummyMetadata } from "../testing";
import { createAccessorExpression } from "./accessor-expression";
import { AssignmentExpressionParseError } from "../errors";

describe("createAccessorExpression", () => {
  it("should throw compile error when value type is not string", () => {
    const node = load(`.`);
    expect(() => createAccessorExpression(node, dummyMetadata()))
      .toThrowError(AssignmentExpressionParseError);
  });

  it("should return parsed expression", () => {
    const node = load(`a.b.c`);
    expect(createAccessorExpression(node, dummyMetadata())).toEqual(["a", "b", "c"]);
  });
});
