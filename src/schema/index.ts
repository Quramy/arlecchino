export type Root =  Suite | Scenario | Scenario[];

export type Suite = {
  configuration?: Configuration,
  scenario: Scenario | Scenario[],
};

export type Configuration = {
  base_uri?: string,
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
  FindStep
;

export type GotoStep = {
  goto: string,
};

export type SleepStep = {
  sleep: number,
};

export type ScreenshotStep = "screenshot";

export type WaitForNavigationStep = "wait_for_navigation";

export type FindStep = {
  find: {
    query: string,
    action?: FindAction | FindAction[],
    find?: FindStep,
  }
};

export type FindAction =
  FindClickAction |
  FindInputAction
;

export type FindClickAction = "click";

export type FindInputAction = {
  input: string,
};
