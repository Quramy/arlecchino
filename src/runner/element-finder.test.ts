import { Page, Browser } from "puppeteer";
import * as models from "../model";
import { TestExecutionContext } from "./testing";
import { ElementFinder } from "./element-finder";
import { NoElementFoundError, PuppeteerEvaluationError } from "./errors";

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
    context,
  };
}

describe("ElementFinder", () => {

  describe("runAll", () => {
    it("should set the elementHandle instance to context", async done => {
      const { context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/table.html");
      const finder = new ElementFinder(context, {
        type: "find",
        query: { template: "#find_target" },
      });
      await finder.runAll();
      expect(context.latestElementHandle).toBeTruthy();
      done();
    });
  });

  describe("findElement", () => {
    it("should find child element in scoped parent when useLastHandled: true and query: !null", async done => {
      const { context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/table.html");
      const lastFinder = new ElementFinder(context, {
        type: "find",
        query: { template: "tbody > tr:not(:first-child)" },
      });
      await lastFinder.runAll();
      const currentFinder = new ElementFinder(context, {
        type: "find",
        query: { template: "$0 .left" },
        toStores: [{
          from: "text",
          expression: ["result"],
        }],
      });
      await currentFinder.runAll();
      expect(context.getVariables().result).toBe("400");
      done();
    });

    it("should skip find procedure when elementHandle exists in context and useLastHandled: true and query: null", async done => {
      const { context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/table.html");
      const lastFinder = new ElementFinder(context, {
        type: "find",
        query: { template: "#find_target" },
      });
      await lastFinder.runAll();
      const eh = context.latestElementHandle;
      const currentFinder = new ElementFinder(context, {
        query: { template: "$0" },
        type: "find",
      });
      await currentFinder.runAll();
      expect(context.latestElementHandle).toEqual(eh);
      done();
    });

    it("should throw an error when query is invalid", async done => {
      const { context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/table.html");
      const finder = new ElementFinder(context, {
        type: "find",
        query: {template: ">" },
      });
      try {
        await finder.runAll();
      } catch (error) {
        expect(error instanceof PuppeteerEvaluationError).toBeTruthy();
        done();
      }
    });
  });

  describe("traverse", () => {
    it("should select previous sibling element", async done => {
      const { context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/table.html");
      const finder = new ElementFinder(context, {
        type: "find",
        query: {template: "#find_target" },
        traverse: [
          { type: "previous" },
        ],
        toStores: [{
          from: "text",
          expression: ["result"],
        }],
      });
      await finder.runAll();
      expect(context.getVariables().result).toBe("100");
      done();
    });

    it("should select next sibling element", async done => {
      const { context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/table.html");
      const finder = new ElementFinder(context, {
        type: "find",
        query: {template: "#find_target" },
        traverse: [
          { type: "next" },
        ],
        toStores: [{
          from: "text",
          expression: ["result"],
        }],
      });
      await finder.runAll();
      expect(context.getVariables().result).toBe("300");
      done();
    });

    it("should chain selection", async done => {
      const { context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/table.html");
      const finder = new ElementFinder(context, {
        type: "find",
        query: {template: "#find_target" },
        traverse: [
          { type: "parent" },
          { type: "next" },
          { type: "firstChild" },
        ],
        toStores: [{
          from: "text",
          expression: ["result"],
        }],
      });
      await finder.runAll();
      expect(context.getVariables().result).toBe("400");
      done();
    });

    it("should throw error when element to select is null", async done => {
      const { context } = await createContext();
      await context.currentPage.goto("http://localhost:3000/table.html");
      const finder = new ElementFinder(context, {
        type: "find",
        query: {template: "#find_target" },
        traverse: [
          { type: "previous" },
          { type: "previous" },
        ],
        toStores: [{
          from: "text",
          expression: ["result"],
        }],
      });
      try {
        await finder.runAll();
      } catch (e) {
        expect(e instanceof PuppeteerEvaluationError).toBeTruthy();
        done();
      }
    });
  });
});
