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
  PauseModel |
  EchoStep |
  ReserveNextDialogAnswerStep
;

export type SleepStep = {
  type: "sleep",
  time: number,
};

export type PauseModel = {
  type: "pause",
};

export type EchoStep = {
  type: "echo",
  messages: TemplateString[],
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

export type ReserveNextDialogAnswerStep = {
  type: "reserveNextDialogAnswer",
  isAccept?: boolean,
  text?: TemplateString,
};

export type FindStep = {
  type: "find",
  query: TemplateString,
  withText?: TemplateString,
  traverse?: FindTraverse[],
  toStores?: FindStore[],
  actions?: FindStepAction[],
  child?: FindStep,
};

export type FindTraverse =
  TraversePrevious |
  TraverseNext |
  TraverseParent |
  TraverseFirst |
  TraverseLast
;

export type TraversePrevious = {
  type: "previous",
};

export type TraverseNext = {
  type: "next",
};

export type TraverseParent = {
  type: "parent",
};

export type TraverseFirst = {
  type: "firstChild",
};

export type TraverseLast = {
  type: "lastChild",
};


export type FindStore = {
  from: "html" | "text",
  expression: (number | string)[],
};

export type FindStepAction =
  ClickAction |
  SubmitAction |
  TextInputAction |
  FileUploadAction
;

export type ClickAction = {
  type: "click",
};

export type SubmitAction = {
  type: "submit";
};

export type TextInputAction = {
  type: "textInput",
  value: TemplateString,
};

export type FileUploadAction = {
  type: "fileUpload",
  referencedBy: string,
  files: TemplateString[],
};

export type TemplateString = {
  template: string,
};
