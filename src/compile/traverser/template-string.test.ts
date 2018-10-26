import assert from "assert";
import { load } from "yaml-ast-parser";
import { MetadataInCompilation } from "../types";
import { dummyMetadata } from "../testing";

import { createTemplateStringModel } from "./template-string";
import { NotAllowedValueTypeError } from "../errors";

describe("createTemplateStringModel", () => {
  it("should throw compile error when value type is not string", () => {
    const node = load(`- a`);
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
