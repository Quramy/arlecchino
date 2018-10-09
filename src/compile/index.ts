import fs from "fs";
import {
  load as loadYaml,
  YAMLNode,
  YAMLSequence,
  YAMLMapping,
} from "yaml-ast-parser";
import * as schema from "../schema";
import * as model from "../model";
import { Metadata } from "../types/metadata";
import {
  normalizeOneOrMany,
  mapWithMappingsNode,
  hasKey,
  setMetadata,
} from "./yaml-util";

export function compile(name: string) {
  const txt = fs.readFileSync(name, "utf8");
  const fileMap = new Map();
  fileMap.set(name, txt);
  const metadata = {
    filename: name,
    fileMap,
    nodeMap: new Map(),
  } as Metadata;
  const rootModel = createRootModel(loadYaml(txt), metadata);
  return {
    rootModel,
    metadata,
  };
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

function createConfigurationModel(node: YAMLNode, metadata: Metadata): model.Configuration {
  return setMetadata(mapWithMappingsNode<schema.Configuration, model.Configuration>(node, {
    base_uri: ["baseUri", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
  }), metadata, node);
}

function createStepModels(node: YAMLSequence, metadata: Metadata): model.Step[] {
  const ret: model.Step[] = [];
  node.items.forEach(n => {
    if (isScreenshotStepNode(n)) {
      ret.push(createScreenshotStepModel(n, metadata));
    } else if (isGotoStepNode(n)) {
      ret.push(createGotoStepModel(n, metadata));
    } else if (isWaitForNavigationStepNode(n)) {
      ret.push(createWaitForNavigationStepModel(n, metadata));
    } else if (isFindStepNode(n)) {
      ret.push(createFindStepModel(n, metadata));
    } else if (isSleepStepNode(n)) {
      ret.push(createSleepStep(n, metadata));
    }
  });
  return setMetadata(ret, metadata, node);
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
    query: ["query", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
    find: ["child", (n: YAMLNode) => createFindStepModel(n, metadata)],
  }, {
    type: "find",
  }), metadata, node);
}

function createFindStepActionModels(node: YAMLNode, metadata: Metadata): model.FindStepAction[] {
  const actions = normalizeOneOrMany(node).map(x => {
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
  });
  return setMetadata(actions, metadata, node);
}

function createTemplateStringModel(node: YAMLNode, metadata: Metadata): model.TemplateString {
  return setMetadata({
    template: node.value,
  } as model.TemplateString, metadata, node);
}
