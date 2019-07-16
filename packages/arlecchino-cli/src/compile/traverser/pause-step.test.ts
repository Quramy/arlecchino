import assert from "assert";
import { load } from "yaml-ast-parser";
import { MetadataInCompilation } from "../types";
import { dummyMetadata } from "../testing";
import { isPauseStepNode, createPauseStepModel } from "./pause-step";

describe("isPauseStepNode", () => {
  it("should return true", () => {
    const node = load(`pause`);
    expect(isPauseStepNode(node)).toBeTruthy();
  });

  it("should return false", () => {
    const node = load(`stop`);
    expect(isPauseStepNode(node)).toBeFalsy();
  });
});

describe("createPauseStepModel", () => {
    const node = load(`pause`);
    expect(createPauseStepModel(node, dummyMetadata()).type).toBe("pause");
});
