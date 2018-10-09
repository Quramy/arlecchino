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
  .option("verbose", { boolean: true, alias: "v" })
  .option("quiet", { boolean: true, alias: "q" })
  .option("scenarioFile", { string: true, alias: "s" })

const opt = {
  logLevel: cliOptions.argv.verbose ? "verbose" : cliOptions.argv.quiet ? "silent" : "normal",
  showBrowser: cliOptions.argv.showBrowser,
  suiteFile: cliOptions.argv.scenarioFile,
} as MainOption;

(((require("./main") as typeof import("./main")).main)(opt) as Promise<void>)
.then(() => process.exit(0))
.catch(err => {
  console.error(err);
  process.exit(1);
});

