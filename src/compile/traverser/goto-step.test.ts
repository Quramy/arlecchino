import assert from "assert";
import { load, YamlMap as YAMLMap } from "yaml-ast-parser";
import { MetadataInCompilation } from "../types";
import { dummyMetadata } from "../testing";
import { isGotoStepNode, createGotoStepModel } from "./goto-step";
import { NoRequiredValueError } from "../errors";

describe("isGotoStepNode", () => {
  it("should return true", () => {
    const node = load(`goto: "{{ url }}"`);
    expect(isGotoStepNode(node)).toBeTruthy();
  });

  it("should return false", () => {
    const node = load(`goto`);
    expect(isGotoStepNode(node)).toBeFalsy();
  });
});

describe("createGotoStepModel", () => {
  it("should return model correctly", () => {
    const node = load(`goto: "{{ url }}"`) as YAMLMap;
    expect(createGotoStepModel(node, dummyMetadata()))
      .toEqual({
        type: "goto",
        urlFragment: {
          template: "{{ url }}",
        },
      });
  });

  it("should throw compile error with invalid schema", () => {
    const node = load(`goto:`) as YAMLMap;
    expect(() => createGotoStepModel(node, dummyMetadata()))
      .toThrowError(NoRequiredValueError);
  });
});
