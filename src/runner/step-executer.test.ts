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

  describe("reserveNextDialogAnswer", () => {
    it("should close alert dialog", async done => {
      const { executor, context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/dialog.html");
      await executor.reserveNextDialogAnswer({ type: "reserveNextDialogAnswer", isAccept: true });
      await executor.find({
        type: "find",
        query: { template: "#btn_alert" },
        actions: [{ type: "click" }],
      });
      const alerted = await context.currentPage.evaluate(() => Promise.resolve((window as any).alerted));
      expect(alerted).toBeTruthy();
      done();
    });

    it("should close confirm dialog", async done => {
      const { executor, context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/dialog.html");
      await executor.reserveNextDialogAnswer({ type: "reserveNextDialogAnswer", isAccept: true });
      await executor.find({
        type: "find",
        query: { template: "#btn_confirm" },
        actions: [{ type: "click" }],
      });
      const confirmed = await context.currentPage.evaluate(() => Promise.resolve((window as any).confirmed));
      expect(confirmed).toBeTruthy();
      done();
    });

    it("should close prompt dialog", async done => {
      const { executor, context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/dialog.html");
      await executor.reserveNextDialogAnswer({ type: "reserveNextDialogAnswer", isAccept: true, text: { template: "msg" }});
      await executor.find({
        type: "find",
        query: { template: "#btn_prompt" },
        actions: [{ type: "click" }],
      });
      const confirmed = await context.currentPage.evaluate(() => Promise.resolve((window as any).promptMessage));
      expect(confirmed).toBe("msg");
      done();
    });

    it("should close dialog over navigation", async done => {
      const { executor, context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/index.html");
      await executor.reserveNextDialogAnswer({ type: "reserveNextDialogAnswer", isAccept: true });
      await context.currentPage.goto("http://localhost:3000/dialog.html");
      await executor.find({
        type: "find",
        query: { template: "#btn_alert" },
        actions: [{ type: "click" }],
      });
      const alerted = await context.currentPage.evaluate(() => Promise.resolve((window as any).alerted));
      expect(alerted).toBeTruthy();
      done();
    });
  });

});
