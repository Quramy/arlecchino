import assert from "assert";
import { load } from "yaml-ast-parser";
import { MetadataInCompilation } from "../types";
import { dummyMetadata } from "../testing";

import { isScreenshotStepNode, createScreenshotStepModel } from "./screenshot-step";

describe("isScreenshotStepNode", () => {
  it("should return true when node is a scalar", () => {
    const node = load(`screenshot`);
    expect(isScreenshotStepNode(node)).toBeTruthy();
  });

  it("should return true when node is a mapping", () => {
    const node = load(`screenshot:`);
    expect(isScreenshotStepNode(node)).toBeTruthy();
  });

  it("should return false when node is an invalid scalar", () => {
    const node = load(`screenshots`);
    expect(isScreenshotStepNode(node)).toBeFalsy();
  });

  it("should return false when node is an invalid mapping", () => {
    const node = load(`screenshots:`);
    expect(isScreenshotStepNode(node)).toBeFalsy();
  });
});

describe("createScreenshotStepModel", () => {
  it("should return model correctly when node is a scalar", () => {
    const node = load(`screenshot`);
    expect(createScreenshotStepModel(node, dummyMetadata()).type).toBe("screenshot");
  });

  it("should return model correctly when node is a mapping", () => {
    const node = load(`
      screenshot:
        name: fuga
        full_page: false
    `);
    expect(createScreenshotStepModel(node, dummyMetadata())).toEqual({
      type: "screenshot",
      name: {
        template: "fuga",
      },
      fullPage: false,
    });
  });
});
