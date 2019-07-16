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
  .option("outDir", { string: true, alias: "o", default: "result", description: "Output directory" })
  .option("showBrowser", { boolean: true, alias: "d", default: false, description: "Display browser" })
  .option("verbose", { boolean: true, alias: "v", default: false, description: "Show debug log" })
  .option("quiet", { boolean: true, alias: "q", default: false, description: "Suppress all log" })
  .option("test", { boolean: true, alias: "t", default: false, description: "Only validate scenario file. Not run" })
  .option("experimentalReport", { boolean: true, default: false, description: "TBD" })
;

if (!cliOptions.argv._.length) {
  cliOptions.showHelp();
  process.exit(0);
}

const opt: MainOption = {
  baseDir: process.cwd(),
  outDir: cliOptions.argv.outDir || "result",
  logLevel: cliOptions.argv.verbose ? "verbose" : cliOptions.argv.quiet ? "silent" : "normal",
  showBrowser: cliOptions.argv.showBrowser,
  validateOnly: cliOptions.argv.test,
  suiteFile: cliOptions.argv._[0],
  experimentalReport: cliOptions.argv.experimentalReport,
};

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

