import { load } from "yaml-ast-parser";
import { dummyMetadata } from "../testing";
import { createDirectVariables, createImportVariables } from "./configuration";
import { ImportFileNotFoundError, NotAllowedValueTypeError } from "../errors";

describe("createDirectVariables", () => {
  it("should return model correctly", () => {
    const node = load(`
      a: str
      b: 100
      c: true
    `);
    const context = dummyMetadata();
    expect(createDirectVariables(node, context)).toEqual({ a: "str", b: 100, c: true });
  });

  it("should ignore nested hash", () => {
    const node = load(`
      hoge: 
        fuga: 100
    `);
    const context = dummyMetadata();
    expect(createDirectVariables(node, context)).toEqual({ });
  });
})

describe("createImportVariables", () => {
  it("should return model correctly from YAML", () => {
    const node = load(`vars.yml`);
    const context = dummyMetadata({
      fileCache: [
        { name: "vars.yml", content: `hoge: foo` },
      ],
    });
    expect(createImportVariables(node, context)).toEqual({ hoge: "foo" });
  });

  it("should return model correctly from JSON", () => {
    const node = load(`vars.yml`);
    const context = dummyMetadata({
      fileCache: [
        { name: "vars.yml", content: `{ "hoge": "foo" }` },
      ],
    });
    expect(createImportVariables(node, context)).toEqual({ hoge: "foo" });
  });

  it("should return model correctly when sequence", () => {
    const node = load(`- vars.yml`);
    const context = dummyMetadata({
      fileCache: [
        { name: "vars.yml", content: `hoge: foo` },
      ],
    });
    expect(createImportVariables(node, context)).toEqual({ hoge: "foo" });
  });

  it("should return model correctly when sequence/samekeys", () => {
    const node = load(`
      - vars1.yml
      - vars2.yml
    `);
    const context = dummyMetadata({
      fileCache: [
        { name: "vars1.yml", content: `hoge: foo` },
        { name: "vars2.yml", content: `hoge: bar` },
      ],
    });
    expect(createImportVariables(node, context)).toEqual({ hoge: "bar" });
  });

  it("should throws an error when node can not be evaluated as string", () => {
    const node = load(`a: b`);
    const context = dummyMetadata({
      fileCache: [],
    });
    expect(() => createImportVariables(node, context)).toThrowError(NotAllowedValueTypeError);
  });

  it("should throws an error when file is not found", () => {
    const node = load(`vars2.yml`);
    const context = dummyMetadata({
      fileCache: [],
    });
    expect(() => createImportVariables(node, context)).toThrowError(ImportFileNotFoundError);
  });
});

