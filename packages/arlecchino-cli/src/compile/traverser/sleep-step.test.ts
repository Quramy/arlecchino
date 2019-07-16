import { load, YamlMap as YAMLMap } from "yaml-ast-parser";
import { dummyMetadata } from "../testing";

import { isSleepStepNode, createSleepStep } from "./sleep-step";
import { NotAllowedValueTypeError } from "../errors";

describe("isSleepStepNode", () => {
  it("should return true", () => {
    const node = load(`sleep: 20`);
    expect(isSleepStepNode(node)).toBeTruthy();
  });

  it("should return false", () => {
    const node = load(`sleep`);
    expect(isSleepStepNode(node)).toBeFalsy();
  });
});

describe("createSleepStep", () => {
  it("should return model correctly", () => {
    const node = load(`sleep: 20`) as YAMLMap;
    expect(createSleepStep(node, dummyMetadata()))
      .toEqual({
        type: "sleep",
        time: 20,
      });
  });

  it("should throw compile error with invalid schema", () => {
    const node = load(`sleep: 20a`) as YAMLMap;
    expect(() => createSleepStep(node, dummyMetadata()))
      .toThrowError(NotAllowedValueTypeError);
  });
});
