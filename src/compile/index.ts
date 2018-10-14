import fs from "fs";
import path from "path";
import { load as parse } from "yaml-ast-parser";
import { Metadata as BaseMetadata } from "../types/metadata";
import { MetadataInCompilation as Metadata, CompileErrorsHandler } from "./types";
import { Logger } from "../logger";
import { createRootModel } from "./traverser/suite";
import { createLoggingCompileErrorsHandler } from "./error-handler";

export function compileFromFile(filename: string, logger: Logger) {
  const textContent = fs.readFileSync(filename, "utf8");
  return compileFromText(textContent, filename, createLoggingCompileErrorsHandler(logger));
}

export function compileFromText(textContent: string, filename: string, errorHandler?: CompileErrorsHandler) {
  const fileMap = new Map();
  fileMap.set(filename, textContent);

  const metadata = {
    currentFilename: filename,
    catchCompileError: !!errorHandler,
    caughedErrors: [],
    fileMap,
    nodeMap: new Map(),
  } as Metadata;

  const rootModel = createRootModel(parse(textContent), metadata);
  if (metadata.caughedErrors.length && errorHandler) {
    errorHandler(metadata.caughedErrors, metadata);
    return;
  }
  return {
    rootModel,
    metadata: {
      fileMap: metadata.fileMap,
      nodeMap: metadata.nodeMap,
    } as BaseMetadata,
  };
}
