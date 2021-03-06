import * as models from "../model";

import { StepExecutionError } from "./errors";
import { ExecutionContext } from "./types";
import { mergeConfiguration } from "./merge-configuration";
import { runSequential } from "./util";
import { logWithDefinition } from "../logger/log-with-definition";

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
    } catch (error) {
      ctx.flush();
      if (error instanceof StepExecutionError) {
        const msg = error.shortMessage();
        logWithDefinition(ctx.logger, ctx.metadata, error, msg);
        return { scenarioName: scenario.description, result: false };
      }
      throw error;
    }
  });
}
