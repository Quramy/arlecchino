import path from "path";
import { Logger } from ".";
import { CompileError } from "../compile/errors";
import { Metadata } from "../types/metadata";
import { DefinitionAccessor } from "./types";

export function logWithDefinition<T extends Metadata>(logger: Logger, metadata: T, defAccessor: DefinitionAccessor<T>, msg: string) {
  const def = defAccessor.definition(metadata);

  if (!def) {
    logger.error(msg);
    return;
  }

  const errorpositionRange = logger.chalk.gray(`${path.relative(metadata.baseDir, def.filename)}:${def.positionRange.start.line + 1}:${def.positionRange.end.character + 1}`);
  logger.error(errorpositionRange, msg);
  const startLine = def.positionRange.start.line + 1;
  const lastLine = def.positionRange.end.line + 1;
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
      head = new Array(def.positionRange.start.character + 2).join(" ");
      body = new Array(line.length - def.positionRange.start.character + 1).join("~");
    } else {
      head = "";
      body = new Array(line.length + 2).join("~");
    }
    if (l === lastLine) {
      body = body.slice(0, def.positionRange.end.character - head.length + 2);
    }
    return logger.chalk.bgWhite(leftPad("")) + head + logger.chalk.red(body);
  };
  def.lines.forEach((l, i) => {
    const lineNum = logger.chalk.bgWhite(leftPad(`${i + def.positionRange.start.line + 1}`));
    logger.error(lineNum, l);
    logger.error(indicate(l, i + startLine));
  });
}
