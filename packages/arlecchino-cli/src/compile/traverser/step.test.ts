import { load, YAMLSequence } from "yaml-ast-parser";
import { dummyMetadata } from "../testing";
import { createStepModels } from "./step";
import { NotMatchedSequenceItemError } from "../errors";

describe("createStepModels", () => {
  it("should throw compile error with invalid schema", () => {
    const node = load(`- not_matched_step`) as YAMLSequence;
    expect(() => createStepModels(node, dummyMetadata())).toThrowError(NotMatchedSequenceItemError);
  });
});
