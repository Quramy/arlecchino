import { Page, Browser } from "puppeteer";
import * as models from "../model";
import { TestExecutionContext } from "./testing";
import { DefaultStepExecutor } from "./step-executor";

// browser and page are exposed by jest-puppeteer
declare var browser: Browser;
declare var page: Page;

async function createContext(c?: models.Configuration) {
  const context = new TestExecutionContext(browser, page);
  await context.init();
  await context.preparePage({
    conf: c || { },
    scenarioName: "test",
  });
  return {
    executor: context.stepExecutor as DefaultStepExecutor,
    context
  };
}

describe("stepExecutor", () => {

  describe("goto", () => {
    it("should navigate given full url", async (done) => {
      const { executor, context } = await createContext();
      await executor.goto({ type: "goto", urlFragment: { template: "http://localhost:3000" } });
      expect(context.currentPage.url()).toEqual("http://localhost:3000/");
      done();
    });

    it("should navigate given url fragment", async (done) => {
      const { executor, context } = await createContext({ baseUri: { template: "http://localhost:3000" } });
      await executor.goto({ type: "goto", urlFragment: { template: "/index.html" } });
      expect(context.currentPage.url()).toEqual("http://localhost:3000/index.html");
      done();
    });
  });

});
