#!/usr/bin/env node

import yargs from "yargs";
import {
  MainOption,
} from "./main";

const cliOptions = yargs
  .locale("en")
  .wrap(120)
  .version(require("../package.json").version)
  .option("showBrowser", { boolean: true })
  .option("scenarioFile", { string: true, alias: "s" })

const opt = {
  showBrowser: cliOptions.argv.showBrowser,
  suiteFile: cliOptions.argv.scenarioFile,
} as MainOption;

(require("./main").main(opt) as Promise<void>)
.then(() => process.exit(0))
.catch(err => {
  console.error(err);
  process.exit(1);
});

