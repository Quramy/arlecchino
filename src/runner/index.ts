import * as models from "../model";
import {
  launch,
  Browser,
  Page,
  ElementHandle,
} from "puppeteer";

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
    default:
      throw new Error("");
  }
}

export function run(ctx: Context, rootModel: models.RootModel) {
  return rootModel.scenarios.reduce(async (acc, s) => {
    await acc;
    const conf = mergeConfiguration(rootModel.configuration, s.configuration);
    await ctx.preparePage(conf);
    await s.steps.reduce((acc, step) => acc.then(() => nextStep(ctx.page, step)), Promise.resolve());
  }, Promise.resolve());
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

  async screenshot(step: models.ScreenshotStep) {
  }

  async waitForNavigation(step: models.WaitForNavigationStep) {
    await this.page.waitForNavigation();
  }

  async goto(step: models.GotoStep) {
    const { baseUri } = this.context.currentConfiguration;
    const url = baseUri ? baseUri + "/" + step.urlFragment : step.urlFragment;
    await this.page.goto(url);
  }

  async find(step: models.FindStep) {
    const eh = await this.page.$(step.query);
    if (!eh) {
      throw new Error('not found');
    }
    if (step.actions && step.actions.length) {
      await step.actions.reduce((acc, s) => acc.then(() => this.executeFindAction(s, eh)), Promise.resolve());
    }
  }

  private async executeFindAction(action: models.FindStepAction, eh: ElementHandle) {
    if (action.type === "click") {
      return await eh.click();
    } else if (action.type === "textInput") {
      return await eh.type(action.value);
    }
  }
}

export class Context {
  readonly logger: Logger;
  private _currentPage!: Page;
  private _browser!: Browser;
  private _page!: PageWrapper;
  private _currentConfiguration!: models.Configuration;

  constructor() {
    this.logger = {
      log: (...msg: string[]) => console.log.apply(console, msg),
    };
  }

  async init() {
    this._browser = await launch({ headless: false });
    this._page = new PageWrapper(this);
  }

  async preparePage(conf: models.Configuration) {
    if (this._currentPage) {
      await this._currentPage.close();
    }
    this._currentConfiguration = conf;
    this._currentPage = await this._browser.newPage();
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
