import fs from "fs";
import path from "path";
import {
  load as parseYaml,
} from "js-yaml";
import { YAMLNode } from "yaml-ast-parser";
import { MetadataInCompilation as Metadata } from "../types";
import * as schema from "../../schema";
import * as models from "../../model";
import { setMetadata, normalizeOneOrMany, convertMapping } from "../yaml-util";
import { IncludeFileNotFoundError, NoSupportedIncludeVariablesFormatError } from "../errors";
import { createTemplateStringModel } from "./template-string";

export function createConfigurationModel(node: YAMLNode, metadata: Metadata): models.Configuration {
  return setMetadata(convertMapping<schema.Configuration, models.Configuration>(node, {
    base_uri: ["baseUri", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
    include_var: ["includedVariables", (n: YAMLNode) => createIncludedVariables(n, metadata)],
    viewport: ["viewport", (n: YAMLNode) => createViewportModel(n, metadata)],
  }), metadata, node);
}

export function createViewportModel(node: YAMLNode, metadata: Metadata): models.Viewport {
  if (typeof node.value === "string") {
    return setMetadata({
      name: createTemplateStringModel(node, metadata),
    } as models.Viewport, metadata, node);
  } else {
    const vpObj = convertMapping<schema.ViewportObject, models.ViewportObject>(node, {
      "width": ["width", (n: YAMLNode) => n.valueObject],
      "height": ["height", (n: YAMLNode) => n.valueObject],
      "device_scale_factor": ["deviceScaleFactor", (n: YAMLNode) => n.valueObject],
      "has_touch": ["deviceScaleFactor", (n: YAMLNode) => n.valueObject],
      "is_mobile": ["isMobile", (n: YAMLNode) => n.valueObject],
      "is_landscape": ["isLandscape", (n: YAMLNode) => n.valueObject],
    });
    return setMetadata({
      value: vpObj,
    } as models.Viewport, metadata, node);
  }
}

export function createIncludedVariables(node: YAMLNode, metadata: Metadata) {
  return normalizeOneOrMany(node).map(n => {
    if (typeof n.value !== "string") {
      // TODO
      throw new Error();
    }
    const nameToBeIncluded = path.resolve(path.dirname(metadata.currentFilename), n.value);
    if (!fs.existsSync(nameToBeIncluded)) {
      throw new IncludeFileNotFoundError(n, nameToBeIncluded);
    }
    let contents: string;
    contents = fs.readFileSync(nameToBeIncluded, "utf8");
    metadata.fileMap.set(nameToBeIncluded, contents);
    let variableObject;
    try {
      variableObject = JSON.parse(contents);
    } catch (e) {
      // nothing to do
    }
    try {
      variableObject = parseYaml(contents);
    } catch (e) {
      throw new NoSupportedIncludeVariablesFormatError(n);
    }
    return variableObject;
  }).reduce((acc, vars) => ({ ...acc, ...vars }), { });
}
