import * as models from "../model";
import {
  launch,
  Browser,
  Page,
  ElementHandle,
} from "puppeteer";

import {
  render as mustacheRender,
} from "mustache";

import {
  ResultWriter,
  DefaultResultWriter,
} from "./result-writer";

import { 
  restore,
} from "../logger/restore";

import {
  sleep,
} from "./util";
import { Metadata } from "../types/metadata";

export interface Logger {
  log(...msg: string[]): any;
}

function mergeConfiguration(...configurations: models.Configuration[]): models.Configuration {
  return configurations.reduce((acc, conf) => ({ ...acc, ...conf }), { });
}

function nextStep(page: PageWrapper, step: models.Step) {
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
    default:
      throw new Error("");
  }
}

export async function run(ctx: Context, rootModel: models.RootModel) {
  await rootModel.scenarios.reduce(async (acc, scenario) => {
    await acc;
    const conf = mergeConfiguration(rootModel.configuration, scenario.configuration);
    await ctx.preparePage({ conf, scenarioName: scenario.description });
    await scenario.steps.reduce((acc, step) => acc.then(async () => {
      const m = restore(step, ctx.metadata);
      if (m) {
        ctx.logger.log(m.fragment);
      }
      await nextStep(ctx.page, step);
    }), Promise.resolve());
  }, Promise.resolve());
  return;
}

export class PageWrapper {

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

  private async next(step: models.Step) {
    return this;
  }

  private evalString(templateValue: models.TemplateString) {
    return this.context.evaluateValue(templateValue);
  }

  async screenshot(step: models.ScreenshotStep) {
    const buffer = await this.context.currentPage.screenshot({
      fullPage: step.fullPage,
    });
    const fileName = "screenshot_" + this.context.counter.getAndIncrement() + ".png";
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
    const eh = await this.page.$(this.evalString(step.query));
    if (!eh) {
      throw new Error('not found');
    }
    if (step.actions && step.actions.length) {
      await step.actions.reduce((acc, s) => acc.then(() => this.executeFindAction(s, eh)), Promise.resolve());
    }
  }

  async sleep(step: models.SleepStep) {
    await sleep(step.time);
  }

  // TODO refactor
  private async executeFindAction(action: models.FindStepAction, eh: ElementHandle) {
    if (action.type === "click") {
      return await eh.click();
    } else if (action.type === "textInput") {
      return await eh.type(this.evalString(action.value));
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
  showBrowser?: boolean,
  metadata: Metadata,
};

export class Context {
  readonly logger: Logger;
  readonly resultWriter: ResultWriter;
  readonly counter: Counter;
  readonly metadata: Metadata;
  private readonly options: ContextCreateOptions;
  private _currentPage!: Page;
  private _browser!: Browser;
  private _page!: PageWrapper;
  private _currentConfiguration!: models.Configuration;

  constructor(opt: ContextCreateOptions) {
    this.options = opt;
    this.logger = {
      log: (...msg: string[]) => console.log.apply(console, msg),
    };
    this.counter = new Counter();
    this.resultWriter = new DefaultResultWriter();
    this.metadata = opt.metadata;
  }

  async init() {
    this._browser = await launch({
      headless: !this.options.showBrowser,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    this._page = new PageWrapper(this);
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
    this.counter.reset();
    this._currentConfiguration = conf;
    this._currentPage = await this._browser.newPage();
  }

  evaluateValue({ template }: { template: string }) {
    return mustacheRender(template, {
      $env: process.env,
    });
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

  get page() {
    return this._page;
  }
}
