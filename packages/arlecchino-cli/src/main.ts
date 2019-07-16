import { compileFromFile } from "./compile";
import { run } from "./runner";
import { LogLevel, ConsoleLogger } from "./logger";
import { DefaultExecutionContext } from "./runner/execution-context";

export type MainOption = {
  logLevel: LogLevel,
  baseDir: string,
  suiteFile: string,
  showBrowser?: boolean,
  validateOnly?: boolean,
};

export async function main(opt: MainOption) {
  const { suiteFile, logLevel, baseDir } = opt;
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
    logger,
    showBrowser: opt.showBrowser,
    metadata,
  });
  await executionContext.init();

  const results = await run(executionContext, rootModel); 
  await executionContext.shutdown();
  return results.every(r => r.result);
}
