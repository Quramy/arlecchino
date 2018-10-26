export type Root =  Suite | Scenario | Scenario[];
export type StepsDefinitionRoot = StepsDefinition | StepsDefinition[] | Suite;

export type Suite = {
  configuration?: Configuration,
  scenario: Scenario | Scenario[],
};

export type Configuration = {
  base_uri?: string,
  viewport?: ViewportObject,
  include_var?: ImportVar,
  import_var?: ImportVar,
};

export type ImportVar = string | string[];

export type Viewport = /* string | */ ViewportObject;
export type ViewportObject = {
  width?: number,
  height?: number,
  device_scale_factor?: number,
  is_mobile?: boolean,
  has_touch?: boolean,
  is_landscape?: boolean,
};

export type Scenario = StepsDefinition & {
  description: string,
  configuration?: Configuration,
};

export type StepsDefinition = {
  ref_id?: string,
  steps: (ImportSteps | Step)[],
};

export type Step =
  GotoStep |
  SleepStep |
  ScreenshotStep |
  WaitForNavigationStep |
  FindStep |
  PauseStep
;

export type ImportSteps = {
  import_steps: string,
};

export type GotoStep = {
  goto: string,
};

export type SleepStep = {
  sleep: number,
};

export type ScreenshotStep = "screenshot" | {
  screenshot: ScreenshotStepBody,
};

export type ScreenshotStepBody = {
  full_page?: boolean,
  name?: string,
};

export type WaitForNavigationStep = "wait_for_navigation";

export type PauseStep = "pause";

export type EchoStep = {
  echo: string | string[],
};

export type ReserveDialogAnswerStep = "reserve_dialog_answer" | {
  reserve_dialog_answer: ReserveDialogAnswerStepBody,
};

export type ReserveDialogAnswerStepBody = {
  accept?: boolean,
  text?: string,
};

export type FindStep = {
  find: FindStepBody,
};

export type FindStepBody = {
  query: string,
  // query: "$0" | string,
  with_text?: string,
  traverse?: FindTraverse | FindTraverse[],
  store?: FindStore | FindStore[],
  action?: FindAction | FindAction[],
  find?: FindStepBody,
};

export type FindTraverse = "prev" | "next" | "parent" | "first_child" | "last_child";

export type FindStore = {
  from: FindStoreFrom,
  to: string,
};

export type FindStoreFrom = "text" | "html";

export type FindAction =
  FindClickAction |
  FindSubmitAction |
  FindInputAction |
  FindUploadAction
;

export type FindClickAction = "click";

export type FindSubmitAction = "submit";

export type FindInputAction = {
  input: string,
};

export type FindUploadAction = {
  upload: string | string[],
};
