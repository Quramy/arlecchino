import fs from "fs";
import * as yaml from "js-yaml";
import * as yap from "yaml-ast-parser";
import * as schema from "../schema";
import * as model from "../model";

export function load(name: string) {
  const txt = fs.readFileSync(name, "utf8");
  const obj = yaml.load(txt);
  const x = yap.load(txt);
  console.log(x);
  return obj as schema.Root;
}

export function createRootModel(obj: schema.Root) {
  let m: model.RootModel;
  if (isSuiteSchema(obj)) {
    m = {
      configuration: createConfigurationModel(obj.configuration),
      scenarios: createScenarioModels(obj.scenario),
    };
  } else {
    m = {
      configuration: createDefaultConfigurationModel(),
      scenarios: createScenarioModels(obj),
    };
  }
  return m;
}

function isSuiteSchema(x: schema.Root): x is schema.Suite {
  return (x as any).scenario;
}

function createDefaultConfigurationModel(): model.Configuration {
  return { };
}

function createConfigurationModel(c?: schema.Configuration): model.Configuration {
  if (!c) return createDefaultConfigurationModel();
  return {
    baseUri: c.base_uri,
  };
}

function createScenarioModels(s: schema.Scenario | schema.Scenario[]): model.Scenario[] {
  return normalizeOneOrMany(s).map(ss => {
    return {
      configuration: createConfigurationModel(ss.configuration),
      description: ss.description,
      steps: createStepModels(ss.steps),
    } as model.Scenario;
  });
}

function createStepModels(s: schema.Step[]): model.Step[] {
  return s.map(step => {
    if (isScreenshotStepNode(step)) {
      return createScreenshotStepModel(step);
    } else if (isWaitForNavigationStepNode(step)) {
      return createWaitForNavigationStepModel(step);
    } else if (isGotoStepNode(step)) {
      return createGotoStepModel(step);
    } else if (isFindStepNode(step)) {
      return createFindStepModel(step);
    } else {
      throw new NoMatchedTypeError(step);
    }
  });
}

function isGotoStepNode(x: schema.Step): x is schema.GotoStep {
  return !!(x as any).goto;
}
function createGotoStepModel(s: schema.GotoStep): model.GotoStep {
  return {
    type: "goto",
    urlFragment: s.goto,
  };
}

function isWaitForNavigationStepNode(x: schema.Step): x is schema.WaitForNavigationStep {
  return x === "wait_for_navigation";
}
function createWaitForNavigationStepModel(s: schema.WaitForNavigationStep): model.WaitForNavigationStep {
  return {
    type: "waitForNavigation",
    timeout: 10_000,
  };
}

function isScreenshotStepNode(x: schema.Step): x is schema.ScreenshotStep {
  return x === "screenshot";
}
function createScreenshotStepModel(s: schema.ScreenshotStep): model.ScreenshotStep {
  return {
    type: "screenshot",
    fullPage: true,
  };
}

function isFindStepNode(x: schema.Step): x is schema.FindStep {
  return (x as any).find;
}
function createFindStepModel(s: schema.FindStep): model.FindStep {
  return {
    type: "find",
    query: s.find.query,
    actions: createFindStepActionModels(s.find.action),
    child: s.find.find ? createFindStepModel(s.find.find) : undefined,
  };
}

function createFindStepActionModels(s?: schema.FindAction | schema.FindAction[]): model.FindStepAction[] {
  return normalizeOneOrMany(s).map(a => {
    if (a === "click") {
      return {
        type: "click",
      } as model.ClickAction;
    } else if (a.input) {
      return {
        type: "textInput",
        value: a.input,
      } as model.TextInputAction;
    } else {
      throw new NoMatchedTypeError(s);
    }
  });
}

class NoMatchedTypeError extends Error {
  constructor(x: any) {
    super(`${JSON.stringify(x)}`);
  }
}

function normalizeOneOrMany<T>(x?: T | T[]): T[] {
  if (!x) return [];
  return Array.isArray(x) ? x : [x]
}
