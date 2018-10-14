import * as models from "../model";

export function mergeConfiguration(...configurations: models.Configuration[]): models.Configuration {
  return configurations.reduce((acc, conf) => {
    return {
      ...acc,
      ...conf,
      viewport: {
        ...acc.viewport,
        ...conf.viewport,
      },
      includedVariables: {
        ...acc.includedVariables,
        ...conf.includedVariables,
      },
    };
  }, { });
}
