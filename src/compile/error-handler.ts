import { MetadataInCompilation as Metadata, CompileErrorsHandler } from "./types";
import { CompileError } from "./errors";
import { Logger } from "../logger";
import { logWithDefinition } from "../logger/log-with-definition";

export function createLoggingCompileErrorsHandler(logger: Logger): CompileErrorsHandler {
  return (errors: CompileError[], metadata: Metadata) => {
    logger.error(`Found ${errors.length} errors.`);
    errors.forEach(e => logError(logger, metadata, e));
  };
}

function logError(logger: Logger, metadata: Metadata, error: CompileError) {
  logger.error("");
  const msg = error.shortMessage();
  logWithDefinition(logger, metadata, error, msg);
}
