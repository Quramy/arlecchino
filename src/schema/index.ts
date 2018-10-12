export type Root =  Suite | Scenario | Scenario[];

export type Suite = {
  configuration?: Configuration,
  scenario: Scenario | Scenario[],
};

export type Configuration = {
  base_uri?: string,
  viewport?: ViewportObject,
  include_var: IncludeVar,
};

export type IncludeVar = string | string[];

export type Viewport = /* string | */ ViewportObject;
export type ViewportObject = {
  width?: number,
  height?: number,
  device_scale_factor?: number,
  is_mobile?: boolean,
  has_touch?: boolean,
  is_landscape?: boolean,
};

export type Scenario = {
  description: string,
  configuration?: Configuration,
  steps: Step[],
};

export type Step = 
  GotoStep |
  SleepStep |
  ScreenshotStep |
  WaitForNavigationStep |
  FindStep |
  PauseStep
;

export type GotoStep = {
  goto: string,
};

export type SleepStep = {
  sleep: number,
};

export type ScreenshotStep = "screenshot";

export type WaitForNavigationStep = "wait_for_navigation";

export type PauseStep = "pause";

export type EchoStep = {
  echo: string | string[],
};

export type FindStep = {
  find: FindStepBody,
};

export type FindStepBody = {
  query: string,
  // query: "$0" | string,
  with_text?: string,
  store?: FindStore | FindStore[],
  action?: FindAction | FindAction[],
  find?: FindStepBody,
};

export type FindStore = {
  from: FindStoreFrom,
  to: string,
};

export type FindStoreFrom = "text" | "html";

export type FindAction =
  FindClickAction |
  FindInputAction |
  FindUploadAction
;

export type FindClickAction = "click";

export type FindInputAction = {
  input: string,
};

export type FindUploadAction = {
  upload: string | string[],
};
