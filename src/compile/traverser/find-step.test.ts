import assert from "assert";
import { load, YamlMap as YAMLMap } from "yaml-ast-parser";
import { MetadataInCompilation } from "../types";
import { dummyMetadata } from "../testing";
import { isFindStepNode, createFindStepModel, createFindStepStoreModels } from "./find-step";
import { NotAllowedValueTypeError, RequiredKeyNotExistError, NoRequiredValueError } from "../errors";

describe("isFindStepNode", () => {
  it("should return true", () => {
    const node = load(`find:`);
    expect(isFindStepNode(node)).toBeTruthy();
  });

  it("should return false", () => {
    const node = load(`find`);
    expect(isFindStepNode(node)).toBeFalsy();
  });
});

describe("createFindStepModel", () => {
  it("should return model correctly", () => {
    const node = load(`
      find:
         query: div
    `);
    expect(createFindStepModel(node as YAMLMap, dummyMetadata())).toEqual({
      type: "find",
      query: {
        template: "div",
      },
    });
  });

  it("should return nested model correctly", () => {
    const node = load(`
      find:
        query: div
        find:
          query: a
    `);
    expect(createFindStepModel(node as YAMLMap, dummyMetadata()).child!.type).toBe("find");
  });

  it("should throw compile error with invalid schema: no mappings value", () => {
    const node = load(`find:`);
    expect(() => createFindStepModel(node as YAMLMap, dummyMetadata()))
      .toThrowError(NoRequiredValueError);
  });

  it("should throw compile error with invalid schema: null", () => {
    const node = load(`find: div`);
    expect(() => createFindStepModel(node as YAMLMap, dummyMetadata()))
      .toThrowError(NotAllowedValueTypeError);
  });

  it("should throw compile error with invalid schema: missing query key", () => {
    const node = load(`
      find:
        action: click
    `);
    expect(() => createFindStepModel(node as YAMLMap, dummyMetadata()))
      .toThrowError(RequiredKeyNotExistError);
  });

  it("should throw compile error with invalid schema: query is null", () => {
    const node = load(`
      find:
        query:
    `);
    expect(() => createFindStepModel(node as YAMLMap, dummyMetadata()))
      .toThrowError(NoRequiredValueError);
  });
});

describe("createFindStepStoreModels", () => {
  it("should return models correctly", () => {
    const node = load(`
      from: text
      to: "foundNode.textContent"
    `);
    expect(createFindStepStoreModels(node as YAMLMap, dummyMetadata())).toEqual([{
      from: "text",
      expression: ["foundNode", "textContent"],
    }]);
  });
});
