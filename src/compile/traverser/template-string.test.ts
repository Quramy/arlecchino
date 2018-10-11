import assert from "assert";
import { load } from "yaml-ast-parser";
import { createTemplateStringModel } from "./template-string";
import { MetadataInCompilation } from "../types";
import { NotAllowedValueTypeError } from "../errors";
import { dummyMetadata } from "../testing";

describe("createTemplateStringModel", () => {
  it("should throw compile error when value type is not string", () => {
    const node = load(`0`);
    expect(() => createTemplateStringModel(node, dummyMetadata()))
      .toThrowError(NotAllowedValueTypeError);
  });

  it("should return model correctly", () => {
    const node = load(`"{{ hoge }}"`);
    assert.deepEqual(createTemplateStringModel(node, dummyMetadata()), {
      template: "{{ hoge }}",
    });
  }); 
});
