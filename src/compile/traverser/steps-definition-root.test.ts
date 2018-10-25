import { load, YAMLSequence } from "yaml-ast-parser";
import { dummyMetadata } from "../testing";

import { isStepsDefinitionRootNode, extractStepsFromStepsDefinitionRoot } from "./steps-definition-root";
import { isSequence } from "../yaml-util";
import { TooManyStepsDefinitionsError } from "../errors";

describe("isStepsDefinitionRootNode", () => {
  it("should return true when node is suiteNode", () => {
    const node = load(`
      scenario:
        steps:
    `) as YAMLSequence;
    expect(isStepsDefinitionRootNode(node)).toBeTruthy();
  });

  it("should return true when node is multiple scenario suiteNode", () => {
    const node = load(`
      scenario:
        - steps:
    `) as YAMLSequence;
    expect(isStepsDefinitionRootNode(node)).toBeTruthy();
  });

  it("should return true when node has steps mapping", () => {
    const node = load(`steps:`) as YAMLSequence;
    expect(isStepsDefinitionRootNode(node)).toBeTruthy();
  });

  it("should return true when node is a sequence of steps mapping", () => {
    const node = load(`
      - steps:
      - steps:
    `) as YAMLSequence;
    expect(isStepsDefinitionRootNode(node)).toBeTruthy();
  });

  it("should return false otherwise", () => {
    const node = load(`
      - steps
    `) as YAMLSequence;
    expect(isStepsDefinitionRootNode(node)).toBeFalsy();
  });
});

describe("extractStepsFromStepsDefinitionRoot", () => {
  describe("without ref_id", () => {
    it("should return sequenceNode when node is suiteNode", () => {
      const node = load(`
        scenario:
          steps:
            - pause
      `) as YAMLSequence;
      expect(isSequence(extractStepsFromStepsDefinitionRoot(node, undefined, dummyMetadata()))).toBeTruthy();
    });

    it("should throw an error when suite node has multiple steps items ", () => {
      const node = load(`
        scenario:
          - steps:
              - pause
          - steps:
              - pause
      `) as YAMLSequence;
      expect(() => extractStepsFromStepsDefinitionRoot(node, undefined, dummyMetadata())).toThrowError(TooManyStepsDefinitionsError);
    });

    it("should return sequenceNode when node is a steps mapping", () => {
      const node = load(`
        steps:
          - pause
      `) as YAMLSequence;
      expect(isSequence(extractStepsFromStepsDefinitionRoot(node, undefined, dummyMetadata()))).toBeTruthy();
    });

    it("should throw an error when node is a sequence of steps items", () => {
      const node = load(`
        - steps:
            - pause
        - steps:
            - pause
      `) as YAMLSequence;
      expect(() => extractStepsFromStepsDefinitionRoot(node, undefined, dummyMetadata())).toThrowError(TooManyStepsDefinitionsError);
    });
  });

  describe("with ref_id", () => {
    it("should return sequenceNode when node is suiteNode", () => {
      const node = load(`
        scenario:
          ref_id: my_steps
          steps:
            - pause
      `) as YAMLSequence;
      expect(isSequence(extractStepsFromStepsDefinitionRoot(node, "my_steps", dummyMetadata()))).toBeTruthy();
    });

    it("should return sequenceNode when node has multiple steps items", () => {
      const node = load(`
        scenario:
          - ref_id: my_steps
            steps:
              - pause
          - ref_id: other_steps
            steps:
              - pause
      `) as YAMLSequence;
      expect(isSequence(extractStepsFromStepsDefinitionRoot(node, "my_steps", dummyMetadata()))).toBeTruthy();
    });

    it("should return sequenceNode when node is a step mapping", () => {
      const node = load(`
        ref_id: my_steps
        steps:
          - pause
      `) as YAMLSequence;
      expect(isSequence(extractStepsFromStepsDefinitionRoot(node, "my_steps", dummyMetadata()))).toBeTruthy();
    });

    it("should return sequenceNode when node is a sequence of step items", () => {
      const node = load(`
        - ref_id: my_steps
          steps:
            - pause
        - ref_id: other_steps
          steps:
            - pause
        - steps:
            - pause
      `) as YAMLSequence;
      expect(isSequence(extractStepsFromStepsDefinitionRoot(node, "my_steps", dummyMetadata()))).toBeTruthy();
    });
  });
});
