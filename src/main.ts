import { compileFromFile } from "./compile";
import { Context, run } from "./runner";
import { LogLevel, ConsoleLogger } from "./logger";

export type MainOption = {
  logLevel: LogLevel,
  suiteFile: string,
  showBrowser?: boolean,
  validateOnly?: boolean,
};

export async function main(opt: MainOption) {
  const { suiteFile, logLevel } = opt;
  const logger = new ConsoleLogger(logLevel);
  const result = compileFromFile(suiteFile, logger);
  if (!result) return false;
  const { rootModel, metadata } = result;

  logger.debug("Compiled model: ");
  logger.debugObj(rootModel);
  if (opt.validateOnly) {
    return true;
  }

  const ctx = new Context({
    logger,
    showBrowser: opt.showBrowser,
    metadata,
  });
  await ctx.init();

  await run(ctx, rootModel); 
  await ctx.shutdown();
  return true;
}
