import { compile } from "./compile";
import { Context, run } from "./runner";
import { LogLevel, ConsoleLogger } from "./logger";

export type MainOption = {
  logLevel: LogLevel,
  suiteFile: string,
  showBrowser?: boolean,
};

export async function main(opt: MainOption) {
  const logger = new ConsoleLogger();
  logger.level = opt.logLevel;
  const { suiteFile } = opt;
  const { rootModel, metadata } = compile(suiteFile);
  logger.debug("Compiled model: ");
  logger.debugObj(rootModel);
  const ctx = new Context({
    logger,
    showBrowser: opt.showBrowser,
    metadata,
  });
  await ctx.init();

  await run(ctx, rootModel); 
  await ctx.shutdown();
}
