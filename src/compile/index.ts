import fs from "fs";
import path from "path";
import { load as parse } from "yaml-ast-parser";
import { MetadataInCompilation as Metadata } from "./types";
import { Logger } from "../logger";
import { CompileError } from "./errors";
import { createRootModel } from "./traverser/suite";

export function compileFromFile(filename: string, logger: Logger) {
  const textContent = fs.readFileSync(filename, "utf8");
  return compileFromText(textContent, filename, logger);
}

export function compileFromText(textContent: string, filename: string, logger: Logger) {
  const fileMap = new Map();
  fileMap.set(filename, textContent);

  const metadata = {
    currentFilename: filename,
    fileMap,
    nodeMap: new Map(),
  } as Metadata;

  try {
    const rootModel = createRootModel(parse(textContent), metadata);
    return { rootModel, metadata };
  } catch (e) {
    if (e instanceof CompileError) {
      const def = e.definition(metadata);
      logger.error(e.shortMessage());
      if (def) {
        logger.error(def);
      }
      return;
    }
    throw e;
  }
}
