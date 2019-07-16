import { YAMLNode, YAMLSequence } from "yaml-ast-parser";
import * as models from "../../model";
import { MetadataInCompilation as Metadata } from "../types";
import { isPauseStepNode, createPauseStepModel } from "./pause-step";
import { isScreenshotStepNode, createScreenshotStepModel } from "./screenshot-step";
import { isSleepStepNode, createSleepStep } from "./sleep-step";
import { isGotoStepNode, createGotoStepModel } from "./goto-step";
import { isWaitForNavigationStepNode, createWaitForNavigationStepModel } from "./wait-for-navigation-step";
import { isFindStepNode, createFindStepModel } from "./find-step";
import { setMetadata, withCatchCompileError, withValidateSequenceType } from "../yaml-util";
import { isEchoStepNode, createEchoStepModel } from "./echo-step";
import { NotMatchedSequenceItemError } from "../errors";
import { isReserveDialogAnswerStepNode, createReserveNextDialogAnswerStepModel } from "./reserve-dialog-answer-step";
import { isImportStepsNode, importSteps } from "./import-steps";
import { isRunScriptStepNode, createRunScriptStepModel } from "./run-script-step";

export function createStepModels(node: YAMLNode, metadata: Metadata): models.Step[] {
  return withCatchCompileError(() => setMetadata(withValidateSequenceType(node).items.reduce((acc, n) => {
    if (isImportStepsNode(n)) {
      return [...acc, ...importSteps(n, metadata)];
    } else if (isScreenshotStepNode(n)) {
      return [...acc, createScreenshotStepModel(n, metadata)];
    } else if (isGotoStepNode(n)) {
      return [...acc, createGotoStepModel(n, metadata)];
    } else if (isWaitForNavigationStepNode(n)) {
      return [...acc, createWaitForNavigationStepModel(n, metadata)];
    } else if (isFindStepNode(n)) {
      return [...acc, createFindStepModel(n, metadata)];
    } else if (isSleepStepNode(n)) {
      return [...acc, createSleepStep(n, metadata)];
    } else if (isPauseStepNode(n)) {
      return [...acc, createPauseStepModel(n, metadata)];
    } else if (isEchoStepNode(n)) {
      return [...acc, createEchoStepModel(n, metadata)];
    } else if (isReserveDialogAnswerStepNode(n)) {
      return [...acc, createReserveNextDialogAnswerStepModel(n, metadata)];
    } else if (isRunScriptStepNode(n)) {
      return [...acc, createRunScriptStepModel(n, metadata)];
    } else {
      throw new NotMatchedSequenceItemError(n);
    }
  }, [] as models.Step[]) as models.Step[], metadata, node), metadata);
}
