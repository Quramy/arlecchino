import fs from "fs";
import {
  load as loadYaml,
  YAMLNode,
  YAMLSequence,
  YAMLMapping,
} from "yaml-ast-parser";
// import * as schema from "../schema";
import * as model from "../model";
import { Metadata } from "../types/metadata";

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

function setMetadata<T>(obj: T, metadata: Metadata, node: YAMLNode): T {
  metadata.nodeMap.set(obj, {
    filename: metadata.filename,
    postion: {
      start: node.startPosition,
      end: node.endPosition,
    },
  });
  return obj;
}

function isSuiteSchema(node: YAMLNode) {
  return hasKey(node, "scenario");
}
function createRootModel(node: YAMLNode, metadata: Metadata) {
  let m: any = { };
  if (isSuiteSchema(node)) {
    node.mappings.forEach((n: YAMLMapping) => {
      if (n.key.value === "configuration") {
        m.configuration = createConfigurationModel(n.value, metadata);
      } else if (n.key.value === "scenario") {
        m.scenarios = createScenarioModels(n.value, metadata);
      }
    });
  } else {
    m = {
      configuration: {},
      scenarios: createScenarioModels(node, metadata),
    };
  }
  return setMetadata(m, metadata, node);
}

function createScenarioModels(n: YAMLNode, metadata: Metadata): any {
  return normalizeOneOrMany(n).map(node => {
    const obj: any = { };
    node.mappings.forEach((n: YAMLMapping) => {
      const key = n.key.value;
      if (key === "configuration") {
        obj.configuration = createConfigurationModel(n.value, metadata);
      } else if (key === "description") {
        obj.description = n.value.value;
      } else if (key === "steps") {
        obj.steps = createStepModels(n.value as YAMLSequence, metadata);
      } else {
        // obj[key] = visitNode(n.value);
      }
    });
    return setMetadata(obj, metadata, node);
  });
}

function createConfigurationModel(node: YAMLNode, metadata: Metadata): model.Configuration {
  const obj: any = { };
  node.mappings.forEach((n: YAMLMapping) => {
    if (n.key.value === "base_uri") {
      obj.baseUri = createTemplateStringModel(n.value, metadata);
    } else {
      throw new Error("invalid key");
    }
  });
  return setMetadata(obj, metadata, node);
}

function createStepModels(node: YAMLSequence, metadata: Metadata): model.Step[] {
  const ret: any[] = [];
  node.items.forEach(n => {
    if (isScreenshotStepNode(n)) {
      ret.push(createScreenshotStepModel(n, metadata));
    } else if (isGotoStepNode(n)) {
      ret.push(createGotoStepModel(n, metadata));
    } else if (isWaitForNavigationStepNode(n)) {
      ret.push(createWaitForNavigationStepModel(n, metadata));
    } else if (isFindStepNode(n)) {
      ret.push(createFindStepModel(n, metadata));
    }
  });
  return setMetadata(ret, metadata, node);
}

function isGotoStepNode(node: YAMLNode) {
  return hasKey(node, "goto");
}
function createGotoStepModel(node: YAMLNode, metadata: Metadata): model.GotoStep {
  const obj = {
    type: "goto",
    urlFragment: createTemplateStringModel(node.mappings[0].value, metadata),
  } as any;
  return setMetadata(obj, metadata, node);
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
  const ret: any = {
    type: "find",
  };
  node.mappings[0].value.mappings.forEach((n: YAMLMapping) => {
    if (n.key.value === "query") {
      ret.query = createTemplateStringModel(n.value, metadata);
    } else if (n.key.value === "action") {
      ret.actions = createFindStepActionModels(n.value, metadata);
    } else if (n.key.value === "find") {
      ret.child = createFindStepModel(n.value.value, metadata);
    }
  });
  return setMetadata(ret, metadata, node);
}

function createFindStepActionModels(node: YAMLNode, metadata: Metadata): model.FindStepAction[] {
  const actions = normalizeOneOrMany(node).map(x => {
    const obj = { } as any;
    if (x.value === "click") {
      obj.type = "click";
    } else {
      x.mappings.forEach((n: YAMLMapping) => {
        if (n.key.value === "input") {
          obj.type = "textInput";
          obj.value = createTemplateStringModel(n.value, metadata);
        } else {
          console.error(n);
          throw new Error();
        }
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

class NoMatchedTypeError extends Error {
  constructor(x: any) {
    super(`${JSON.stringify(x)}`);
  }
}

function hasKey(node: YAMLNode, k: string) {
  if (!node.mappings) return false;
  return (node.mappings as any[]).map((v: { key: YAMLNode }) => v.key.value as string).some(key => key === k);
}

function normalizeOneOrMany(node: YAMLNode): YAMLNode[] {
  if ((node as YAMLSequence).items) return (node as YAMLSequence).items as YAMLNode[];
  return [node];
}
