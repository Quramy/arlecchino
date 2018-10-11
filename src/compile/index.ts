import fs from "fs";
import path from "path";
import {
  load as loadYaml,
  YAMLNode,
  YAMLSequence,
  YAMLMapping,
} from "yaml-ast-parser";
import * as schema from "../schema";
import * as model from "../model";
import { MetadataInCompilation as Metadata } from "./types";
import {
  normalizeOneOrMany,
  mapWithMappingsNode,
  hasKey,
  setMetadata,
} from "./yaml-util";
import {
  CompileError,
  IncludeFileNotFoundError,
  NoSupportedIncludeVariablesFormatError,
} from "./errors";
import { Logger } from "../logger";
import { createTemplateStringModel } from "./traverser/template-string";
import { createConfigurationModel } from "./traverser/configuration";

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
function createRootModel(node: YAMLNode, metadata: Metadata): model.RootModel {
  if (isSuiteSchema(node)) {
    return setMetadata(mapWithMappingsNode<schema.Suite, model.RootModel>(node, {
      configuration: ["configuration", (n: YAMLNode) => createConfigurationModel(n, metadata)],
      scenario: ["scenarios", (n: YAMLNode) => createScenarioModels(n, metadata)],
    }), metadata, node);
  } else {
    return setMetadata({
      configuration: {},
      scenarios: createScenarioModels(node, metadata),
    } as model.RootModel, metadata, node);
  }
}

function createScenarioModels(n: YAMLNode, metadata: Metadata): model.Scenario[] {
  return normalizeOneOrMany(n).map(node => {
    return setMetadata(mapWithMappingsNode<schema.Scenario, model.Scenario>(node, {
      configuration: ["configuration", (n: YAMLNode) => createConfigurationModel(n, metadata)],
      description: ["description", (n: YAMLNode) => n.value],
      steps: ["steps", (n: YAMLNode) => createStepModels(n as YAMLSequence, metadata)],
    }), metadata, node);
  });
}

function createStepModels(node: YAMLSequence, metadata: Metadata): model.Step[] {
  return setMetadata(node.items.map(n => {
    if (isScreenshotStepNode(n)) {
      return createScreenshotStepModel(n, metadata);
    } else if (isGotoStepNode(n)) {
      return createGotoStepModel(n, metadata);
    } else if (isWaitForNavigationStepNode(n)) {
      return createWaitForNavigationStepModel(n, metadata);
    } else if (isFindStepNode(n)) {
      return createFindStepModel(n, metadata);
    } else if (isSleepStepNode(n)) {
      return createSleepStep(n, metadata);
    } else if (isStopStepNode(n)) {
      return createStopStep(n, metadata);
    }
  }) as model.Step[], metadata, node);
}

function isGotoStepNode(node: YAMLNode) {
  return hasKey(node, "goto");
}
function createGotoStepModel(node: YAMLNode, metadata: Metadata): model.GotoStep {
  return setMetadata({
    type: "goto",
    urlFragment: createTemplateStringModel(node.mappings[0].value, metadata),
  } as model.GotoStep, metadata, node);
}

function isSleepStepNode(node: YAMLNode) {
  return hasKey(node, "sleep");
}
function createSleepStep(node: YAMLNode, metadata: Metadata): model.SleepStep {
  return setMetadata({
    type: "sleep",
    time: node.mappings[0].value.value,
  } as model.SleepStep, metadata, node);
}

function isWaitForNavigationStepNode(node: YAMLNode) {
  return node.value === "wait_for_navigation";
}
function createWaitForNavigationStepModel(node: YAMLNode, metadata: Metadata): model.WaitForNavigationStep {
  return setMetadata({
    type: "waitForNavigation",
    timeout: 10_000,
  } as model.WaitForNavigationStep, metadata, node);
}

function isScreenshotStepNode(n: YAMLNode) {
  return n.value === "screenshot";
}
function createScreenshotStepModel(node: YAMLNode, metadata: Metadata): model.ScreenshotStep {
  return setMetadata({
    type: "screenshot",
    fullPage: true,
  } as model.ScreenshotStep, metadata, node);
}

function isFindStepNode(node: YAMLNode) {
  return hasKey(node, "find");
}
function createFindStepModel(node: YAMLNode, metadata: Metadata): model.FindStep {
  return setMetadata(mapWithMappingsNode<schema.FindStepBody, model.FindStep>(node.mappings[0].value, {
    action: ["actions", (n: YAMLNode) => createFindStepActionModels(n, metadata)],
    with_text: ["withText", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
    query: ["query", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
    find: ["child", (n: YAMLNode) => createFindStepModel(n, metadata)],
  }, {
    type: "find",
  }), metadata, node);
}

function createFindStepActionModels(node: YAMLNode, metadata: Metadata): model.FindStepAction[] {
  return setMetadata(normalizeOneOrMany(node).map(x => {
    let obj: model.FindStepAction;
    if (x.value === "click") {
      obj = { type: "click" } as model.ClickAction;
    } else {
      obj = mapWithMappingsNode<schema.FindInputAction, model.TextInputAction>(x, {
        input: ["value", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
      }, {
        type: "textInput",
      });
    }
    return setMetadata(obj, metadata, x);
  }) as model.FindStepAction[], metadata, node);
}

function isStopStepNode(node: YAMLNode) {
  return node.value === "stop";
}
function createStopStep(node: YAMLNode, metadata: Metadata): model.StopStep {
  return setMetadata({
    type: "stop",
  } as model.StopStep, metadata, node);
}

