import path from "path";
import { compileFromFile } from "./compile";
import { run } from "./runner";
import { LogLevel, ConsoleLogger } from "./logger";
import { DefaultExecutionContext } from "./runner/execution-context";

export type MainOption = {
  logLevel: LogLevel,
  baseDir: string,
  outDir: string,
  suiteFile: string,
  showBrowser?: boolean,
  validateOnly?: boolean,
  experimentalReport?: boolean,
};

export async function main(opt: MainOption) {
  const { suiteFile, logLevel, baseDir, outDir} = opt;
  const logger = new ConsoleLogger(logLevel);
  const result = compileFromFile(baseDir, suiteFile, logger);
  if (!result) return false;
  const { rootModel, metadata } = result;

  logger.debug("Compiled model: ");
  logger.debugObj(rootModel);
  if (opt.validateOnly) {
    return true;
  }

  const executionContext = new DefaultExecutionContext({
    outDir: path.resolve(baseDir, outDir),
    logger,
    showBrowser: opt.showBrowser,
    metadata,
  });
  await executionContext.init();

  const { experimentalReport } = opt;

  const results = await run(executionContext, rootModel, { experimentalReport }); 
  await executionContext.shutdown();
  return results.every(r => r.result);
}
