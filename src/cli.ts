#!/usr/bin/env node

import yargs from "yargs";
import {
  MainOption,
} from "./main";

const cliOptions = yargs
  .locale("en")
  .wrap(120)
  .usage("arlecchino [options] <scenario YAML file>")
  .version(require("../package.json").version)
  .option("showBrowser", { boolean: true, alias: "d" })
  .option("verbose", { boolean: true, alias: "v" })
  .option("quiet", { boolean: true, alias: "q" })
  .option("test", { boolean: true, alias: "t" })

if (!cliOptions.argv._.length) {
  cliOptions.showHelp();
  process.exit(0);
}

const opt = {
  logLevel: cliOptions.argv.verbose ? "verbose" : cliOptions.argv.quiet ? "silent" : "normal",
  showBrowser: cliOptions.argv.showBrowser,
  validateOnly: cliOptions.argv.test,
  suiteFile: cliOptions.argv._[0],
} as MainOption;

((require("./main") as typeof import("./main")).main)(opt)
.then((ret) => {
  if (!ret) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})
.catch(err => {
  console.error(err);
  process.exit(2);
});

