import { YAMLNode, YAMLSequence } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { isPauseStepNode, createPauseStepModel } from "./pause-step";
import { isScreenshotStepNode, createScreenshotStepModel } from "./screenshot-step";
import { isSleepStepNode, createSleepStep } from "./sleep-step";
import { isGotoStepNode, createGotoStepModel } from "./goto-step";
import { isWaitForNavigationStepNode, createWaitForNavigationStepModel } from "./wait-for-navigation-step";
import { isFindStepNode, createFindStepModel } from "./find-step";
import { setMetadata, withCatchCompileError } from "../yaml-util";
import { isEchoStepNode, createEchoStepModel } from "./echo-step";
import { NotMatchedSequenceItemError } from "../errors";
import { isReserveDialogAnswerStepNode, createReserveNextDialogAnswerStepModel } from "./reserve-dialog-answer-step";

export function createStepModels(node: YAMLSequence, metadata: Metadata): models.Step[] {
  return withCatchCompileError(() => setMetadata(node.items.map(n => {
    if (isScreenshotStepNode(n)) {
      return createScreenshotStepModel(n, metadata);
    } else if (isGotoStepNode(n)) {
      return createGotoStepModel(n, metadata);
    } else if (isWaitForNavigationStepNode(n)) {
      return createWaitForNavigationStepModel(n, metadata);
    } else if (isFindStepNode(n)) {
      return createFindStepModel(n, metadata);
    } else if (isSleepStepNode(n)) {
      return createSleepStep(n, metadata);
    } else if (isPauseStepNode(n)) {
      return createPauseStepModel(n, metadata);
    } else if (isEchoStepNode(n)) {
      return createEchoStepModel(n, metadata);
    } else if (isReserveDialogAnswerStepNode(n)) {
      return createReserveNextDialogAnswerStepModel(n, metadata);
    } else {
      throw new NotMatchedSequenceItemError(n);
    }
  }) as models.Step[], metadata, node), metadata);
}
