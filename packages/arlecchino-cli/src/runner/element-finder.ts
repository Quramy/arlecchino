import { ElementHandle, FrameBase } from "puppeteer";

import { ExecutionContext } from "./types";
import * as models from "../model";
import { NoElementFoundError, PuppeteerEvaluationError } from "./errors";
import { runSequential } from "./util";

export class ElementFinder {

  private eh?: ElementHandle;

  constructor (
    private readonly context: ExecutionContext,
    private readonly step: models.FindStep,
  ) {
  }

  async runAll() {
    await this.findElement();
    await this.traverse();
    await this.store();
    await this.doActions();
    if (this.eh) {
      this.context.latestElementHandle = this.eh;
    }
  }

  async findElement() {
    const query = this.context.evaluateValue(this.step.query);
    let useLastHandled: boolean = false;
    let cssQuery: string = query;
    const hit = query.match(/^\s*\$0($|\s+.*)/);
    if (hit) {
      useLastHandled = true;
      cssQuery = hit[1].trim();
    }
    if (useLastHandled && !cssQuery) {
      if (!this.context.latestElementHandle) {
        throw new NoElementFoundError(this.step, "query", "$0");
      }
      this.eh = this.context.latestElementHandle;
      return;
    }
    if (!cssQuery) {
      throw new NoElementFoundError(this.step, "query", "");
    }
    let handler: FrameBase | ElementHandle;
    if (useLastHandled) {
      if (!this.context.latestElementHandle) {
        throw new NoElementFoundError(this.step, "query", "$0");
      }
      handler = this.context.latestElementHandle;
    } else {
      handler = this.context.currentPage;
    }
    let ehList: ElementHandle[];
    try {
      ehList = await handler.$$(cssQuery);
    } catch (error) {
      throw new PuppeteerEvaluationError(this.step, error.message);
    }
    if (!ehList.length) {
      throw new NoElementFoundError(this.step, "query", cssQuery);
    }
    let eh: ElementHandle;
    if (this.step.withText) {
      const searchText = this.context.evaluateValue(this.step.withText);
      let textContents: { index: number, textContents: string | null }[];
      try {
        textContents = 
          await handler.$$eval(cssQuery, (nodes: Element[]) => nodes.map((n, i) => ({ textContents: n.textContent, index: i })));
      } catch (error) {
        throw new PuppeteerEvaluationError(this.step, error.message);
      }
      const hit = textContents.find(tc => !!tc.textContents && tc.textContents.includes(searchText));
      if (!hit) {
        throw new NoElementFoundError(this.step, "withText", searchText);
      }
      this.eh = ehList[hit.index];
    } else {
      this.eh = ehList[0];
    }
  }

  async traverse() {
    if (!this.eh || !this.step.traverse || !this.step.traverse.length) return;
    await runSequential(this.step.traverse, async t => {
      if (!this.eh) return;
      try {
        const newHandle = (await this.eh.executionContext().evaluateHandle((e: Element, t: models.FindTraverse) => {
          const type = t.type;
          let result: Element | null;
          if (type === "previous") {
            result = e.previousElementSibling;
          } else if (type === "next") {
            result = e.nextElementSibling;
          } else if (type === "parent") {
            result = e.parentElement;
          } else if (type === "firstChild") {
            result = e.firstElementChild;
          } else if (type === "lastChild") {
            result = e.lastElementChild;
          } else {
            return Promise.reject(new Error(""));
          }
          if (!result) {
            return Promise.reject(new Error(""));
          }
          return Promise.resolve(result);
        }, this.eh, t)).asElement();
        if (!newHandle) {
          throw new NoElementFoundError(this.step, "traverse", t.type);
        }
        this.eh = newHandle;
      } catch (e) {
        throw new PuppeteerEvaluationError(this.step, e.message);
      }
    });
  }

  async store() {
    const { toStores } = this.step;
    if (!toStores || !toStores.length) return;
    await runSequential(toStores, async ({ expression, from })=> {
      if (!this.eh) return;
      let result: any;
      try {
        result = await this.eh.executionContext().evaluate((x: HTMLElement, fromType: models.FindStore["from"]) => {
          if (fromType === "html") {
            return Promise.resolve(x.innerHTML);
          } else if (fromType === "text") {
            return Promise.resolve(x.textContent);
          }
        }, this.eh, from);
      } catch (error) {
        throw new PuppeteerEvaluationError(this.step, error.message);
      }
      this.context.assignToStore(expression, result);
      this.context.logger.debug("A value is stored:");
      this.context.logger.debugObj(result);
    });
  }

  async doActions() {
    const { actions } = this.step;
    if (!actions || !actions.length) return;
    try {
      await runSequential(actions, async action => {
        if (!this.eh) return;
        if (action.type === "click") {
          return await this.eh.click();
        } else if (action.type === "submit") {
          return await this.eh.executionContext().evaluate((x: HTMLFormElement) => {
            x.submit();
            return Promise.resolve();
          }, this.eh);
        } else if (action.type === "textInput") {
          return await this.eh.type(this.context.evaluateValue(action.value));
        } else if (action.type === "fileUpload") {
          return await this.eh.uploadFile.apply(this.eh, action.files.map(f => this.context.evaluateFileReference(f)));
        }
      });
    } catch (error) {
      throw new PuppeteerEvaluationError(this.step, error.message);
    }
  }
}
