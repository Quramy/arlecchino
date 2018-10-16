import { Browser, Page } from "puppeteer";
import { ConsoleLogger } from "../../logger";
import { DefaultExecutionContext } from "../execution-context";

export class TestExecutionContext extends DefaultExecutionContext {
  constructor (browser: Browser, page: Page) {
    super({
      logger: new ConsoleLogger("normal"),
      metadata: {
        nodeMap: new Map(),
        fileMap: new Map(),
      },
      showBrowser: false,
    });
    this._browser = browser;
    this._currentPage = page;
  }

  async clearBrowser() {
    // nothing to do in test environment
  }
}
