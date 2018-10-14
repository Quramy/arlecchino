import path from "path";
import { ElementHandle } from "puppeteer";

import * as models from "../model";
import { NoElementFoundError } from "./errors";
import { sleep } from "./util";
import { ExecutionContext, StepExecutor } from "./types";

export class DefaultStepExecutor implements StepExecutor {

  private readonly context: ExecutionContext;

  constructor(ctx: ExecutionContext) {
    this.context = ctx;
  }

  private get page() {
    return this.context.currentPage;
  }

  private get url() {
    return this.page.url();
  }

  private evalString(templateValue: models.TemplateString) {
    return this.context.evaluateValue(templateValue);
  }

  executeStep(step: models.Step) {
    const delegate = this[step.type] as (s: typeof step) => Promise<void>;
    if (delegate) {
      return delegate.call(this, step);
    }
    throw new Error("");
  }

  async screenshot(step: models.ScreenshotStep) {
    const buffer = await this.context.currentPage.screenshot({
      fullPage: step.fullPage,
    });
    const fileName = "screenshot_" + this.context.counters.screenshot.getAndIncrement() + ".png";
    await this.context.resultWriter.writeBinary(buffer, fileName);
  }

  async waitForNavigation(step: models.WaitForNavigationStep) {
    await this.page.waitForNavigation({ timeout: step.timeout });
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
    if (step.toStores && step.toStores.length) {
      await step.toStores.reduce((acc, s) => acc.then(async () => {
        const result = await eh.executionContext().evaluate((x: HTMLElement, fromType: models.FindStore["from"]) => {
          if (fromType === "html") {
            return Promise.resolve(x.innerHTML);
          } else if (fromType === "text") {
            return Promise.resolve(x.textContent);
          }
        }, eh, s.from);
        this.context.assignToStore(s.expression, result);
        this.context.logger.debug("A value is stored:");
        this.context.logger.debugObj(result);
      }), Promise.resolve());
    }
    if (step.actions && step.actions.length) {
      await step.actions.reduce((acc, s) => acc.then(() => this.executeFindAction(s, eh)), Promise.resolve());
    }
  }

  async sleep(step: models.SleepStep) {
    await sleep(step.time);
  }

  pause(step: models.PauseModel) {
    if (this.context.visible) {
      this.context.logger.log(`Type "_resume_()" and enter key in Browser Developer Tool to resume steps.`);
      return new Promise(res => {
        this.context.currentPage.exposeFunction("_resume_", () => res());
      });
    } else {
      return Promise.resolve();
    }
  }

  async echo(step: models.EchoStep) {
    step.messages.forEach(msg => this.context.logger.log(this.evalString(msg)));
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
