import { load, YAMLSequence } from "yaml-ast-parser";
import { dummyMetadata } from "../testing";
import { importSteps } from "./import-steps";
import * as models from "../../model";

describe("ImportSteps", () => {

  it("sould returns steps models correctly", () => {
    const metadata = dummyMetadata({
      fileCache: [{
        name: "steps.yml",
        content: `
          steps:
            - pause
        `
      }]
    });
    const node = load(`import_steps: steps.yml`);
    expect(importSteps(node, metadata)).toEqual([{
      type: "pause"
    }] as models.Step[]);
  });

  it("sould returns steps models correctly with ref_id", () => {
    const metadata = dummyMetadata({
      fileCache: [{
        name: "steps.yml",
        content: `
          ref_id: my_steps
          steps:
            - pause
        `
      }]
    });
    const node = load(`import_steps: steps.yml$my_steps`);
    expect(importSteps(node, metadata)).toEqual([{
      type: "pause"
    }] as models.Step[]);
  });
});
