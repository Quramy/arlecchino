import assert from "assert";
import { load } from "yaml-ast-parser";
import { MetadataInCompilation } from "../types";
import { dummyMetadata } from "../testing";

import { isScreenshotStepNode, createScreenshotStepModel } from "./screenshot-step";

describe("isScreenshotStepNode", () => {
  it("should return true", () => {
    const node = load(`screenshot`);
    expect(isScreenshotStepNode(node)).toBeTruthy();
  });

  it("should return false", () => {
    const node = load(`screenshots`);
    expect(isScreenshotStepNode(node)).toBeFalsy();
  });
});

describe("createScreenshotStepModel", () => {
  it("should return model correctly", () => {
    const node = load(`screenshot`);
    expect(createScreenshotStepModel(node, dummyMetadata()).type).toBe("screenshot");
  });
});
