import path from "path";
import { ElementHandle } from "puppeteer";

import { ExecutionContext } from "./types";
import * as models from "../model";
import { NoElementFoundError } from "./errors";
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
    await this.store();
    await this.doActions();
  }

  async findElement() {
    const query = this.context.evaluateValue(this.step.query);
    const ehList = await this.context.currentPage.$$(query);
    if (!ehList.length) {
      throw new NoElementFoundError(this.step, "query", query);
    }
    let eh: ElementHandle;
    if (this.step.withText) {
      const searchText = this.context.evaluateValue(this.step.withText);
      const textContents: { index: number, textContents: string | null }[] =
        await this.context.currentPage.$$eval(query, (nodes: Element[]) => nodes.map((n, i) => ({ textContents: n.textContent, index: i })));
      const hit = textContents.find(tc => !!tc.textContents && tc.textContents.includes(searchText));
      if (!hit) {
        throw new NoElementFoundError(this.step, "withText", searchText);
      }
      this.eh = ehList[hit.index];
    } else {
      this.eh = ehList[0];
    }
  }

  async store() {
    const { toStores } = this.step;
    if (!toStores || !toStores.length) return;
    await runSequential(toStores, async ({ expression, from })=> {
      if (!this.eh) return;
      const result = await this.eh.executionContext().evaluate((x: HTMLElement, fromType: models.FindStore["from"]) => {
        if (fromType === "html") {
          return Promise.resolve(x.innerHTML);
        } else if (fromType === "text") {
          return Promise.resolve(x.textContent);
        }
      }, this.eh, from);
      this.context.assignToStore(expression, result);
      this.context.logger.debug("A value is stored:");
      this.context.logger.debugObj(result);
    });
  }

  async doActions() {
    const { actions } = this.step;
    if (!actions || !actions.length) return;
    await runSequential(actions, async action => {
      if (!this.eh) return;
      if (action.type === "click") {
        return await this.eh.click();
      } else if (action.type === "textInput") {
        return await this.eh.type(this.context.evaluateValue(action.value));
      } else if (action.type === "fileUpload") {
        return await this.eh.uploadFile.apply(this.eh, action.files.map(f => path.resolve(path.dirname(action.referencedBy), this.context.evaluateValue(f))));
      }
    });
  }
}
