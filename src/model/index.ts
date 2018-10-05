export type RootModel = {
  configuration: Configuration,
  scenarios: Scenario[],
};

export type Configuration = {
  baseUri?: string,
};

export type Scenario = {
  description: string,
  configuration: Configuration,
  steps: Step[],
};

export type Step =
  GotoStep |
  ScreenshotStep |
  WaitForNavigationStep |
  FindStep
;

export interface GotoStep {
  readonly type: "goto";
  readonly urlFragment: string;
}

export type ScreenshotStep = {
  type: "screenshot",
  fullPage: boolean,
};

export type WaitForNavigationStep = {
  type: "waitForNavigation",
  timeout: number,
};

export type FindStep = {
  type: "find",
  query: string,
  actions?: FindStepAction[],
  child?: FindStep,
};

export type FindStepAction =
  ClickAction |
  TextInputAction
;

export type ClickAction = {
  type: "click",
};

export type TextInputAction = {
  type: "textInput",
  value: string,
};
