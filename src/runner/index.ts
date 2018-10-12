import path from "path";
import {
  launch,
  Browser,
  Page,
  ElementHandle,
} from "puppeteer";

import {
  render as mustacheRender,
  name,
} from "mustache";

import * as models from "../model";

import {
  ResultWriter,
  DefaultResultWriter,
} from "./result-writer";

import { Logger } from "../logger";
import { sleep } from "./util";
import { Metadata } from "../types/metadata";
import { NoElementFoundError } from "./errors";

function mergeConfiguration(...configurations: models.Configuration[]): models.Configuration {
  return configurations.reduce((acc, conf) => {
    return {
      ...acc,
      ...conf,
      viewport: {
        ...acc.viewport,
        ...conf.viewport,
      },
      includedVariables: {
        ...acc.includedVariables,
        ...conf.includedVariables,
      },
    };
  }, { });
}

function nextStep(page: StepExecutor, step: models.Step) {
  switch (step.type) {
    case "find":
      return page.find(step);
    case "goto":
      return page.goto(step);
    case "screenshot":
      return page.screenshot(step);
    case "waitForNavigation":
      return page.waitForNavigation(step);
    case "sleep":
      return page.sleep(step);
    case "pause":
      return page.stop(step);
    default:
      throw new Error("");
  }
}

export async function run(ctx: Context, rootModel: models.RootModel) {
  await rootModel.scenarios.reduce(async (acc, scenario) => {
    await acc;
    const conf = mergeConfiguration(rootModel.configuration, scenario.configuration);
    await ctx.preparePage({ conf, scenarioName: scenario.description });
    ctx.logger.log(`Execute scenario: "${scenario.description}" .`);
    try {
      await scenario.steps.reduce((acc, step) => acc.then(async () => {
        ctx.logger.debug(`Execute  - ${step.type} step.`);
        await nextStep(ctx.stepExecutor, step);
      }), Promise.resolve());
    } catch (e) {
      if (e instanceof NoElementFoundError) {
        ctx.logger.error(`Can't find element: ${e.key}: ${e.val}`);
        const traceMessage = e.traceMessage(ctx.metadata);
        if (traceMessage) ctx.logger.error(traceMessage);
        return;
      }
      throw e;
    }
  }, Promise.resolve());
  return;
}

export class StepExecutor {

  private readonly context: Context;

  constructor(ctx: Context) {
    this.context = ctx;
  }

  get page() {
    return this.context.currentPage;
  }

  get url() {
    return this.page.url();
  }

  private evalString(templateValue: models.TemplateString) {
    return this.context.evaluateValue(templateValue);
  }

  async screenshot(step: models.ScreenshotStep) {
    const buffer = await this.context.currentPage.screenshot({
      fullPage: step.fullPage,
    });
    const fileName = "screenshot_" + this.context.counters.screenshot.getAndIncrement() + ".png";
    await this.context.resultWriter.writeBinary(buffer, fileName);
  }

  async waitForNavigation(step: models.WaitForNavigationStep) {
    await this.page.waitForNavigation();
  }

  async goto(step: models.GotoStep) {
    const { baseUri } = this.context.currentConfiguration;
    const fragment = this.evalString(step.urlFragment);
    const url = baseUri ? this.evalString(baseUri) + "/" + fragment : fragment;
    await this.page.goto(url);
  }

  async find(step: models.FindStep) {
    const query = this.evalString(step.query);
    const ehList = await this.page.$$(this.evalString(step.query));
    if (!ehList.length) {
      throw new NoElementFoundError(step, "query", query);
    }
    let eh: ElementHandle;
    if (step.withText) {
      const searchText = this.evalString(step.withText);
      const textContents: { index: number, textContents: string | null }[] =
        await this.context.currentPage.$$eval(query, (nodes: Element[]) => nodes.map((n, i) => ({ textContents: n.textContent, index: i })));
      const hit = textContents.find(tc => !!tc.textContents && tc.textContents.includes(searchText));
      if (!hit) {
        throw new NoElementFoundError(step, "withText", searchText);
      }
      eh = ehList[hit.index];
    } else {
      eh = ehList[0];
    }
    if (step.actions && step.actions.length) {
      await step.actions.reduce((acc, s) => acc.then(() => this.executeFindAction(s, eh)), Promise.resolve());
    }
  }

  async sleep(step: models.SleepStep) {
    await sleep(step.time);
  }

  stop(step: models.PauseModel) {
    if (this.context.visible) {
      this.context.logger.log(`Type "_resume_()" and enter key in Browser Developer Tool to resume steps.`);
      return new Promise(res => {
        this.context.currentPage.exposeFunction("_resume_", () => res());
      });
    } else {
      return Promise.resolve();
    }
  }

  // TODO refactor
  private async executeFindAction(action: models.FindStepAction, eh: ElementHandle) {
    if (action.type === "click") {
      return await eh.click();
    } else if (action.type === "textInput") {
      return await eh.type(this.evalString(action.value));
    } else if (action.type === "fileUpload") {
      return await eh.uploadFile.apply(eh, action.files.map(f => path.resolve(path.dirname(action.referencedBy), this.evalString(f))));
    }
  }
}

class Counter {
  private count = 0;

  getAndIncrement() {
    return ++this.count;
  }

  get() {
    return this.count;
  }

  reset() {
    this.count = 0;
  }
}

export type ContextCreateOptions = {
  logger: Logger,
  showBrowser?: boolean,
  metadata: Metadata,
};

export class Context {
  readonly logger: Logger;
  readonly resultWriter: ResultWriter;
  readonly counters: { screenshot: Counter };
  readonly metadata: Metadata;
  private readonly options: ContextCreateOptions;
  private _currentPage!: Page;
  private _browser!: Browser;
  private _stepExecutor!: StepExecutor;
  private _currentConfiguration!: models.Configuration;

  constructor(opt: ContextCreateOptions) {
    this.options = opt;
    this.logger = opt.logger;
    this.counters = { screenshot: new Counter() };
    this.resultWriter = new DefaultResultWriter();
    this.metadata = opt.metadata;
  }

  async init() {
    this._browser = await launch({
      headless: !this.options.showBrowser,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this._stepExecutor = new StepExecutor(this);
  }

  async shutdown() {
    await this._currentPage.close();
    await sleep(100);
    await this._browser.close();
  }

  async preparePage({ conf, scenarioName }: { conf: models.Configuration, scenarioName: string }) {
    if (this._currentPage) {
      await this._currentPage.close();
    }
    // TODO use out dir of cnofig
    this.resultWriter.setPrefix("result/" + scenarioName.replace(/\s+/g, "_"));
    this.counters.screenshot.reset();
    this._currentConfiguration = conf;
    this._currentPage = await this._browser.newPage();

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

  evaluateValue({ template }: { template: string }) {
    // TODO should be support to replacement for the included variables?
    const variables = { ...this.currentConfiguration.includedVariables };
    return mustacheRender(template, {
      ...variables,
      $env: process.env,
    });
  }

  get visible() {
    return this.options.showBrowser;
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
