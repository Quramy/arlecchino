import * as models from "../model";
import { Metadata } from "../types/metadata";
import { getDefinitionFromModel } from "../logger/trace-functions";

export class NoElementFoundError extends Error {
  constructor(
    public readonly step: models.FindStep,
    public readonly key: keyof models.FindStep,
    public readonly val: string,
  ) {
    super();
  }

  traceMessage(metadata: Metadata) {
    const m = this.step[this.key];
    const def = getDefinitionFromModel(m, metadata, 1);
    if (!def) return;
    return "Confirm the definition of this step:\n" + 
      `${def.filename}:${def.postion.start.line + 1}:${def.postion.start.character + 1}` + "\n" + def.contents;
  }
}
