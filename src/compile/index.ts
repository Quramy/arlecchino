import fs from "fs";
import path from "path";
import { load as parse } from "yaml-ast-parser";
import { Metadata as BaseMetadata } from "../types/metadata";
import { MetadataInCompilation as Metadata, CompileErrorsHandler } from "./types";
import { Logger } from "../logger";
import { createRootModel } from "./traverser/suite";
import { createLoggingCompileErrorsHandler } from "./error-handler";
import { DefaultCompilationContext } from "./compilation-context";

export function compileFromFile(filename: string, logger: Logger) {
  let textContent: string;
  try {
    textContent = fs.readFileSync(filename, "utf8");
  } catch (e) {
    if (e.message) {
      logger.error(`Cannot open '${filename}'.`);
      return;
    } 
    throw e;
  }
  return compileFromText(textContent, filename, createLoggingCompileErrorsHandler(logger));
}

export function compileFromText(textContent: string, filename: string, errorHandler?: CompileErrorsHandler) {
  const context = new DefaultCompilationContext({
    entryFilename: filename,
    content: textContent,
  });

  const rootModel = createRootModel(parse(textContent), context);
  if (context.caughtErrors.length && errorHandler) {
    errorHandler(context.caughtErrors, context);
    return;
  }
  return {
    rootModel,
    metadata: {
      fileMap: context.fileMap,
      nodeMap: context.nodeMap,
    } as BaseMetadata,
  };
}
