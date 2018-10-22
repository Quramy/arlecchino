import * as models from "../model";

import { NoElementFoundError } from "./errors";
import { ExecutionContext } from "./types";
import { mergeConfiguration } from "./merge-configuration";
import { runSequential } from "./util";

export async function run(ctx: ExecutionContext, rootModel: models.RootModel) {
  return await runSequential(rootModel.scenarios, async (scenario) => {
    const conf = mergeConfiguration(rootModel.configuration, scenario.configuration);
    await ctx.preparePage({ conf, scenarioName: scenario.description });
    ctx.logger.log(`Execute scenario: "${scenario.description}" .`);
    try {
      await runSequential(scenario.steps, async step => {
        ctx.logger.debug(`Execute  - ${step.type} step.`);
        await ctx.stepExecutor.executeStep(step);
      });
      ctx.flush();
      return { scenarioName: scenario.description, result: true };
    } catch (e) {
      ctx.flush();
      if (e instanceof NoElementFoundError) {
        ctx.logger.error(`Can't find element: ${e.key}: ${e.val}`);
        const traceMessage = e.traceMessage(ctx.metadata);
        if (traceMessage) ctx.logger.error(traceMessage);
        return { scenarioName: scenario.description, result: false };
      }
      throw e;
    }
  });
}
