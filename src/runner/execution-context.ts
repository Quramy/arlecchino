import { Page, Browser, launch } from "puppeteer";

import {
  render as mustacheRender,
} from "mustache";

import { assignValue, AccessorExpression } from "../accessor";

import { Logger } from "../logger";
import { Metadata } from "../types/metadata";
import * as models from "../model";

import { ExecutionContext, Counter, StepExecutor, ResultWriter, PreparePageOptions } from "./types";
import { DefaultResultWriter } from "./result-writer";
import { DefaultStepExecutor } from "./step-executor";
import { SimpleCounter, sleep } from "./util";

export type ContextCreateOptions = {
  logger: Logger,
  showBrowser?: boolean,
  metadata: Metadata,
};

export class DefaultExecutionContext implements ExecutionContext {
  readonly logger: Logger;
  readonly resultWriter: ResultWriter;
  readonly counters: { screenshot: Counter };
  readonly metadata: Metadata;
  private readonly options: ContextCreateOptions;
  protected _currentPage!: Page;
  protected _browser!: Browser;
  protected _stepExecutor!: StepExecutor;
  protected _currentConfiguration!: models.Configuration;
  protected _storedValue!: any;

  constructor(opt: ContextCreateOptions) {
    this.options = opt;
    this.logger = opt.logger;
    this.counters = { screenshot: new SimpleCounter() };
    this.resultWriter = new DefaultResultWriter();
    this.metadata = opt.metadata;
  }

  async init() {
    this._stepExecutor = new DefaultStepExecutor(this);
  }

  async shutdown() {
    await this._currentPage.close();
    await sleep(100);
    await this._browser.close();
  }

  protected async clearBrowser() {
    if (this._currentPage) {
      await this._currentPage.close();
    }
    if (this._browser) {
      await sleep(100);
      await this._browser.close();
    }
    this._browser = await launch({
      headless: !this.options.showBrowser,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this._currentPage = await this._browser.newPage();
  }

  async preparePage({ conf, scenarioName }: PreparePageOptions) {
    await this.clearBrowser();
    // TODO use out dir of cnofig
    this.resultWriter.setPrefix("result/" + scenarioName.replace(/\s+/g, "_"));
    this._storedValue = { };
    this.counters.screenshot.reset();
    this._currentConfiguration = conf;

    // TODO extract function
    const defaultViewport = {
      width: 960,
      height: 600,
    };
    if (conf.viewport && conf.viewport.value) {
      const vp = { ...defaultViewport, ...conf.viewport.value || { } };
      await this._currentPage.setViewport(vp);
    } else {
      await this._currentPage.setViewport(defaultViewport);
    }
  }

  async flush() {
    await this.resultWriter.writeObjAsJson(this._storedValue, "storedValues.json");
  }

  evaluateValue({ template }: { template: string }) {
    // TODO should be support to replacement for the included variables?
    const variables = { ...this.currentConfiguration.includedVariables };
    return mustacheRender(template, {
      ...variables,
      ...this._storedValue,
      $env: process.env,
    });
  }

  assignToStore(expression: AccessorExpression, value: any) {
    this._storedValue = assignValue(expression, this._storedValue, value);
  }

  get visible() {
    return !!this.options.showBrowser;
  }

  get browser() {
    return this._browser;
  }

  get currentPage() {
    return this._currentPage;
  }

  get currentConfiguration() {
    return this._currentConfiguration;
  }

  get stepExecutor() {
    return this._stepExecutor;
  }
}
