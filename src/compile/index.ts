import fs from "fs";
import {
  load as loadYaml,
  YAMLNode,
  YAMLSequence,
  YAMLMapping,
} from "yaml-ast-parser";
// import * as schema from "../schema";
import * as model from "../model";

export function compile(name: string) {
  const txt = fs.readFileSync(name, "utf8");
  const metadataMap: Map<any, YAMLNode> = new Map();
  const rootModel = createRootModel(loadYaml(txt), metadataMap);
  return {
    rootModel,
    metadataMap,
  };
}

export type MetadataMap = Map<any, YAMLNode>;

function isSuiteSchema(node: YAMLNode) {
  return hasKey(node, "scenario");
}
function createRootModel(node: YAMLNode, metadataMap: MetadataMap) {
  let m: any = { };
  if (isSuiteSchema(node)) {
    node.mappings.forEach((n: YAMLMapping) => {
      if (n.key.value === "configuration") {
        m.configuration = createConfigurationModel(n.value, metadataMap);
      } else if (n.key.value === "scenario") {
        m.scenarios = createScenarioModels(n.value, metadataMap);
      }
    });
  } else {
    m = {
      configuration: {},
      scenarios: createScenarioModels(node, metadataMap),
    };
  }
  metadataMap.set(m, node);
  return m;
}

function createScenarioModels(n: YAMLNode, metadataMap: MetadataMap): any {
  return normalizeOneOrMany(n).map(node => {
    const obj: any = { };
    node.mappings.forEach((n: YAMLMapping) => {
      const key = n.key.value;
      if (key === "configuration") {
        obj.configuration = createConfigurationModel(n.value, metadataMap);
      } else if (key === "description") {
        obj.description = n.value.value;
      } else if (key === "steps") {
        obj.steps = createStepModels(n.value as YAMLSequence, metadataMap);
      } else {
        // obj[key] = visitNode(n.value);
      }
    });
    metadataMap.set(obj, node);
    return obj;
  });
}

function createConfigurationModel(node: YAMLNode, metadataMap: MetadataMap): model.Configuration {
  const obj: any = { };
  node.mappings.forEach((n: YAMLMapping) => {
    if (n.key.value === "base_uri") {
      obj.baseUri = createTemplateStringModel(n.value, metadataMap);
    } else {
      throw new Error("invalid key");
    }
  });
  metadataMap.set(obj, node);
  return obj;
}

function createStepModels(node: YAMLSequence, metadataMap: MetadataMap): model.Step[] {
  const ret: any[] = [];
  node.items.forEach(n => {
    if (isScreenshotStepNode(n)) {
      ret.push(createScreenshotStepModel(n, metadataMap));
    } else if (isGotoStepNode(n)) {
      ret.push(createGotoStepModel(n, metadataMap));
    } else if (isWaitForNavigationStepNode(n)) {
      ret.push(createWaitForNavigationStepModel(n, metadataMap));
    } else if (isFindStepNode(n)) {
      ret.push(createFindStepModel(n, metadataMap));
    }
  });
  return ret;
}

function isGotoStepNode(node: YAMLNode) {
  return hasKey(node, "goto");
}
function createGotoStepModel(node: YAMLNode, metadataMap: MetadataMap): model.GotoStep {
  const obj = {
    type: "goto",
    urlFragment: createTemplateStringModel(node.mappings[0].value, metadataMap),
  } as any;
  metadataMap.set(obj, node);
  return obj;
}

function isWaitForNavigationStepNode(node: YAMLNode) {
  return node.value === "wait_for_navigation";
}
function createWaitForNavigationStepModel(node: YAMLNode, metadataMap: MetadataMap): model.WaitForNavigationStep {
  const obj = {
    type: "waitForNavigation",
    timeout: 10_000,
  } as any;
  metadataMap.set(obj, node);
  return obj;
}

function isScreenshotStepNode(n: YAMLNode) {
  return n.value === "screenshot";
}
function createScreenshotStepModel(node: YAMLNode, metadataMap: MetadataMap): model.ScreenshotStep {
  const obj = {
    type: "screenshot",
    fullPage: true,
  } as model.ScreenshotStep;
  metadataMap.set(obj, node);
  return obj;
}

function isFindStepNode(node: YAMLNode) {
  return hasKey(node, "find");
}
function createFindStepModel(node: YAMLNode, metadataMap: MetadataMap): model.FindStep {
  const ret: any = {
    type: "find",
  };
  node.mappings[0].value.mappings.forEach((n: YAMLMapping) => {
    if (n.key.value === "query") {
      ret.query = createTemplateStringModel(n.value, metadataMap);
    } else if (n.key.value === "action") {
      ret.actions = createFindStepActionModels(n.value, metadataMap);
    } else if (n.key.value === "find") {
      ret.child = createFindStepModel(n.value.value, metadataMap);
    }
  });
  metadataMap.set(ret, node);
  return ret;
}

function createFindStepActionModels(node: YAMLNode, metadataMap: MetadataMap): model.FindStepAction[] {
  const actions = normalizeOneOrMany(node).map(x => {
    const obj = { } as any;
    if (x.value === "click") {
      obj.type = "click";
    } else {
      x.mappings.forEach((n: YAMLMapping) => {
        if (n.key.value === "input") {
          obj.type = "textInput";
          obj.value = createTemplateStringModel(n.value, metadataMap);
        } else {
          console.error(n);
          throw new Error();
        }
      });
    }
    metadataMap.set(obj, x);
    return obj;
  });
  metadataMap.set(actions, node);
  return actions;
}

function createTemplateStringModel(node: YAMLNode, metadataMap: MetadataMap): model.TemplateString {
  const obj: model.TemplateString = {
    template: node.value,
  };
  metadataMap.set(obj, node);
  return obj;
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
