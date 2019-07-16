import { Browser, Page, ElementHandle } from "puppeteer";
import * as models from "../model";
import { Logger } from "../logger";
import { Metadata } from "../types/metadata";
import { AccessorExpression } from "../accessor";

export interface ArlecchinoContext {
  readonly logger: Logger;
  readonly resultWriter: ResultWriter;
  readonly browser: Browser;
  readonly currentPage: Page; 
  readonly visible: boolean;
  readonly stepExecutor: StepExecutor;
  readonly currentConfiguration: models.Configuration;
  readonly latestElementHandle: ElementHandle | null;
  evaluateValue(opt: models.TemplateString): string;
  evaluateFileReference(opt: models.FileReference): string;
  getVariables(): any;
  assignToStore(expression: AccessorExpression, value: any): void;
}

export interface ResultWriter {
  setPrefix(prefix: string): void,
  writeObjAsJson(obj: any, name: string): Promise<void>;
  writeBinary(buf: Buffer, name: string): Promise<void>;
}

export interface StepExecutor {
  executeStep(step: models.Step): Promise<void>;
}

export type PreparePageOptions = {
  conf: models.Configuration,
  scenarioName: string,
};

export interface Counter {
  getAndIncrement(): number;
  get(): number;
  reset(): void;
}

export interface ExecutionContext extends ArlecchinoContext {
  readonly metadata: Metadata;
  readonly counters: { screenshot: Counter };
  latestElementHandle: ElementHandle | null;
  init(): Promise<void>;
  shutdown(): Promise<void>;
  flush(): Promise<void>;
  preparePage(opt: PreparePageOptions): Promise<void>;
  publish(): ArlecchinoContext;
}
