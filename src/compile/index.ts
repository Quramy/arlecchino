import fs from "fs";
import path from "path";
import {
  load as loadYaml,
  YAMLNode,
  YAMLSequence,
  YAMLMapping,
} from "yaml-ast-parser";
import * as schema from "../schema";
import * as models from "../model";
import { MetadataInCompilation as Metadata } from "./types";
import {
  normalizeOneOrMany,
  mapWithMappingsNode,
  hasKey,
  setMetadata,
} from "./yaml-util";
import {
  CompileError,
} from "./errors";
import { Logger } from "../logger";
import { createTemplateStringModel } from "./traverser/template-string";
import { createConfigurationModel } from "./traverser/configuration";
import { createStepModels } from "./traverser/step";

export function compile(name: string, logger: Logger) {
  const txt = fs.readFileSync(name, "utf8");
  const fileMap = new Map();
  fileMap.set(name, txt);
  const metadata = {
    currentFilename: name,
    fileMap,
    nodeMap: new Map(),
  } as Metadata;
  try {
    const rootModel = createRootModel(loadYaml(txt), metadata);
    return {
      rootModel,
      metadata,
    };
  } catch (e) {
    if (e instanceof CompileError) {
      const def = e.definition(metadata);
      logger.error(e.shortMessage());
      if (def) {
        logger.error(def);
      }
      return;
    }
    throw e;
  }
}

function isSuiteSchema(node: YAMLNode) {
  return hasKey(node, "scenario");
}
function createRootModel(node: YAMLNode, metadata: Metadata): models.RootModel {
  if (isSuiteSchema(node)) {
    return setMetadata(mapWithMappingsNode<schema.Suite, models.RootModel>(node, {
      configuration: ["configuration", (n: YAMLNode) => createConfigurationModel(n, metadata)],
      scenario: ["scenarios", (n: YAMLNode) => createScenarioModels(n, metadata)],
    }), metadata, node);
  } else {
    return setMetadata({
      configuration: {},
      scenarios: createScenarioModels(node, metadata),
    } as models.RootModel, metadata, node);
  }
}

function createScenarioModels(n: YAMLNode, metadata: Metadata): models.Scenario[] {
  return normalizeOneOrMany(n).map(node => {
    return setMetadata(mapWithMappingsNode<schema.Scenario, models.Scenario>(node, {
      configuration: ["configuration", (n: YAMLNode) => createConfigurationModel(n, metadata)],
      description: ["description", (n: YAMLNode) => n.value],
      steps: ["steps", (n: YAMLNode) => createStepModels(n as YAMLSequence, metadata)],
    }), metadata, node);
  });
}
