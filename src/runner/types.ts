import { Browser, Page } from "puppeteer";
import * as models from "../model";
import { Logger } from "../logger";
import { Metadata } from "../types/metadata";
import { AccessorExpression } from "../accessor";

export interface Counter {
  getAndIncrement(): number;
  get(): number;
  reset(): void;
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

export interface ExecutionContext {
  readonly logger: Logger;
  readonly resultWriter: ResultWriter;
  readonly counters: { screenshot: Counter };
  readonly metadata: Metadata;
  readonly browser: Browser;
  readonly currentPage: Page; 
  readonly currentConfiguration: models.Configuration;
  readonly visible: boolean;
  readonly stepExecutor: StepExecutor;
  init(): Promise<void>;
  shutdown(): Promise<void>;
  flush(): Promise<void>;
  preparePage(opt: PreparePageOptions): Promise<void>;
  evaluateValue(opt: models.TemplateString): string;
  assignToStore(expression: AccessorExpression, value: any): void;
}
