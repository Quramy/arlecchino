export type RootModel = {
  configuration: Configuration,
  scenarios: Scenario[],
};

export type Configuration = {
  baseUri?: TemplateString,
  includedVariables?: any,
  viewport?: Viewport,
};

export type Viewport = {
  name?: TemplateString,
  value?: ViewportObject,
}

export type ViewportObject = {
  width?: number,
  height?: number,
  deviceScaleFactor?: number,
  isMobile?: boolean,
  hasTouch?: boolean,
  isLandscape?: boolean,
};

export type Scenario = {
  description: string,
  configuration: Configuration,
  steps: Step[],
};

export type Step =
  GotoStep |
  SleepStep |
  ScreenshotStep |
  WaitForNavigationStep |
  FindStep |
  StopStep
;

export type SleepStep = {
  type: "sleep",
  time: number,
};

export type StopStep = {
  type: "stop",
};

export interface GotoStep {
  readonly type: "goto";
  readonly urlFragment: TemplateString;
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
  query: TemplateString,
  withText?: TemplateString,
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
  value: TemplateString,
};

export type TemplateString = {
  template: string,
}
