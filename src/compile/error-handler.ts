import { MetadataInCompilation as Metadata, CompileErrorsHandler } from "./types";
import { CompileError } from "./errors";
import { Logger } from "../logger";

export function createLoggingCompileErrorsHandler(logger: Logger): CompileErrorsHandler {
  return (errors: CompileError[], metadata: Metadata) => {
    logger.error(`Found ${errors.length} errors.`);
    errors.forEach(e => logError(logger, metadata, e));
  };
}

function logError(logger: Logger, metadata: Metadata, error: CompileError) {
  logger.error("");
  const msg = error.shortMessage();
  const def = error.definition(metadata);

  if (!def) {
    logger.error(msg);
    return;
  }

  const errorPosition = logger.chalk.gray(`${def.filename}:${def.position.start.line + 1}:${def.position.end.character + 1}`);
  logger.error(errorPosition, msg);
  const startLine = def.position.start.line + 1;
  const lastLine = def.position.end.line + 1;
  const digit = (lastLine + "").length;
  const leftPad = (x: string) => {
    const d = `${x}`.length;
    let result = `${x}`;
    for (let i = 0; i < digit - d; ++i) {
      result = " " + result;
    }
    return result;
  };
  const indicate = (line: string, l: number) => {
    let head: string;
    let body: string;
    if (l === startLine) {
      head = new Array(def.position.start.character + 2).join(" ");
      body = new Array(line.length - def.position.start.character + 1).join("~");
    } else {
      head = "";
      body = new Array(line.length + 2).join("~");
    }
    if (l === lastLine) {
      body = body.slice(0, def.position.end.character - head.length + 2);
    }
    return logger.chalk.bgWhite(leftPad("")) + head + logger.chalk.red(body);
  };
  def.lines.forEach((l, i) => {
    const lineNum = logger.chalk.bgWhite(leftPad(`${i + def.position.start.line + 1}`));
    logger.error(lineNum, l);
    logger.error(indicate(l, i + startLine));
  });
}
