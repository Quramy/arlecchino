import { Page, Browser } from "puppeteer";
declare var browser: Browser;
declare var page: Page;

describe("hoge", () => {
  it("run test", () => {
    console.log(page);
  });
});
