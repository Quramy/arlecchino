import {
  load as parseYaml,
} from "js-yaml";
import { YAMLNode } from "yaml-ast-parser";
import { MetadataInCompilation as Metadata } from "../types";
import * as schema from "../../schema";
import * as models from "../../model";
import {
  setMetadata,
  normalizeOneOrMany,
  convertMapping,
  withCatchCompileError,
  withValidateBooleanType,
  withValidateNumberType,
  withValidateStringType,
} from "../yaml-util";
import { ImportFileNotFoundError, NoSupportedIncludeVariablesFormatError } from "../errors";
import { createTemplateStringModel } from "./template-string";

export function createConfigurationModel(node: YAMLNode, metadata: Metadata): models.Configuration {
  return withCatchCompileError(() => setMetadata(convertMapping<schema.Configuration, models.Configuration>(node, {
    base_uri: ["baseUri", (n: YAMLNode) => createTemplateStringModel(n, metadata)],
    include_var: ["importVariables", (n: YAMLNode) => createImportVariables(n, metadata)],  // secret
    import_var: ["importVariables", (n: YAMLNode) => createImportVariables(n, metadata)],
    viewport: ["viewport", (n: YAMLNode) => createViewportModel(n, metadata)],
  }), metadata, node), metadata);
}

export function createViewportModel(node: YAMLNode, metadata: Metadata): models.Viewport {
  if (typeof node.value === "string") {
    return withCatchCompileError(() => setMetadata({
      name: createTemplateStringModel(node, metadata),
    } as models.Viewport, metadata, node), metadata);
  } else {
    const vpObj = withCatchCompileError(() => convertMapping<schema.ViewportObject, models.ViewportObject>(node, {
      "width": ["width", n => withValidateNumberType(n).valueObject],
      "height": ["height", n => withValidateNumberType(n).valueObject],
      "device_scale_factor": ["deviceScaleFactor", n => withValidateNumberType(n).valueObject],
      "has_touch": ["hasTouch", n => withValidateBooleanType(n).valueObject],
      "is_mobile": ["isMobile", n => withValidateBooleanType(n).valueObject],
      "is_landscape": ["isLandscape", n => withValidateBooleanType(n).valueObject],
    }), metadata);
    return setMetadata({
      value: vpObj,
    } as models.Viewport, metadata, node);
  }
}

export function createImportVariables(node: YAMLNode, metadata: Metadata) {
  return normalizeOneOrMany(node).map(n => withCatchCompileError(() => {
    withValidateStringType(n);
    const { absPath, content } = metadata.readFile(n.value);
    if (!content) throw new ImportFileNotFoundError(n, absPath);

    let variableObject;
    try {
      variableObject = JSON.parse(content);
    } catch (e) {
      // nothing to do
    }
    try {
      variableObject = parseYaml(content);
    } catch (e) {
      throw new NoSupportedIncludeVariablesFormatError(n);
    }
    return variableObject;
  }, metadata)).reduce((acc, vars) => ({ ...acc, ...vars }), { });
}
