import { load, YamlMap as YAMLMap } from "yaml-ast-parser";
import { MetadataInCompilation } from "../types";
import { dummyMetadata } from "../testing";
import { isGotoStepNode, createGotoStepModel } from "./goto-step";
import { NoRequiredValueError } from "../errors";
import { isReserveDialogAnswerStepNode, createReserveNextDialogAnswerStepModel } from "./reserve-dialog-answer-step";

describe("isReserveDialogAnswerStep", () => {
  it("should return true when node is string", () => {
    const node = load(`reserve_dialog_answer`);
    expect(isReserveDialogAnswerStepNode(node)).toBeTruthy();
  });

  it("should return true when node is mapping", () => {
    const node = load(`
      reserve_dialog_answer:
        accept: true
    `);
    expect(isReserveDialogAnswerStepNode(node)).toBeTruthy();
  });
});

describe("createReserveNextDialogAnswerStep", () => {
  it("should return model correctly when node is string", () => {
    const node = load(`reserve_dialog_answer`);
    expect(createReserveNextDialogAnswerStepModel(node, dummyMetadata()))
      .toEqual({
        type: "reserveNextDialogAnswer",
        isAccept: true,
      })
  });

  it("should return model correctly when node is mapping", () => {
    const node = load(`
      reserve_dialog_answer:
        accept: false
    `);
    expect(createReserveNextDialogAnswerStepModel(node, dummyMetadata()))
      .toEqual({
        type: "reserveNextDialogAnswer",
        isAccept: false,
      })
  });
});
