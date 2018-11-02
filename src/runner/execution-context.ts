import path from "path";
import { Page, Browser, launch, ElementHandle } from "puppeteer";

import {
  render as mustacheRender,
} from "mustache";

import { assignValue, AccessorExpression } from "../accessor";

import { Logger } from "../logger";
import { Metadata } from "../types/metadata";
import * as models from "../model";

import { ExecutionContext, Counter, StepExecutor, ResultWriter, PreparePageOptions, ArlecchinoContext } from "./types";
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
  latestElementHandle: ElementHandle | null = null;
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
      if (this.latestElementHandle) {
        await this.latestElementHandle.dispose();
        this.latestElementHandle = null;
      }
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

  getVariables() {
    // TODO should be support to replacement for the included variables?
    const variables = { ...this.currentConfiguration.importVariables };
    return {
      ...variables,
      ...this._storedValue,
      $env: process.env,
    };
  }

  evaluateValue({ template }: models.TemplateString) {
    return mustacheRender(template, this.getVariables());
  }

  evaluateFileReference(opt: models.FileReference) {
    const filename = this.evaluateValue(opt);
    if (path.isAbsolute(filename)) return filename;
    return path.resolve(this.metadata.baseDir, path.dirname(opt.referencedBy), filename);
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

  publish() {
    const ctx: ArlecchinoContext = {
      logger: this.logger,
      resultWriter: this.resultWriter,
      browser: this.browser,
      currentPage: this.currentPage,
      latestElementHandle: this.latestElementHandle,
      visible: this.visible,
      stepExecutor: this.stepExecutor,
      currentConfiguration: this.currentConfiguration,
      evaluateValue: this.evaluateValue.bind(this),
      evaluateFileReference: this.evaluateFileReference.bind(this),
      getVariables: this.getVariables.bind(this),
      assignToStore: this.assignToStore.bind(this),
    };
    return Object.seal(ctx);
  }
}
