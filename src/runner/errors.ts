import * as models from "../model";
import { Metadata } from "../types/metadata";
import { getDefinitionFromModel, getDefinionFromRecord, getDefinionLinesFromRecord } from "../logger/trace-functions";
import { DefinitionAccessor } from "../logger/types";

export abstract class StepExecutionError extends Error implements DefinitionAccessor<Metadata> {
  public readonly step: models.Step;

  constructor(step: models.Step) {
    super();
    this.step = step;
  }

  abstract shortMessage(): string; 

  definition(metadata: Metadata) {
    const stepNodeRecord = metadata.nodeMap.get(this.step);
    if (!stepNodeRecord) return;
    return getDefinionLinesFromRecord(stepNodeRecord, metadata);
  }
}

export class NoElementFoundError extends StepExecutionError {
  constructor(
    public readonly step: models.FindStep,
    private readonly key: keyof models.FindStep,
    private readonly val: string,
  ) {
    super(step);
  }

  shortMessage() {
    return `Can't find element: ${this.key}: ${this.val}`;
  }
}

export class NoResolvedScriptError extends StepExecutionError {
  constructor(step: models.RunScriptStep, private readonly msg: string) {
    super(step);
  }

  shortMessage() {
    return this.msg;
  }
}

export class ScriptExportTypeMismatchError extends StepExecutionError {
  constructor(step: models.RunScriptStep, private readonly exportedType: string) {
    super(step);
  }

  shortMessage() {
    return `Exported type is ${this.exportedType}. It must be function type.`;
  }
}
