import {
  Metadata,
  MetadataMapRecord,
} from "../types/metadata";

export type Range = {
  line: number,
  character: number,
};

export function restore(model: any, metadata: Metadata) {
  const node = metadata.nodeMap.get(model);
  if (!node) return;
  const file = metadata.fileMap.get(node.filename);
  if (!file) return;
  const fragment = file.slice(node.position.start, node.position.end);
  return {
    filename: node.filename,
    fragment,
  };
}
export function getDefinionLinesFromRecord(node: MetadataMapRecord, metadata: Metadata) {
  const file = metadata.fileMap.get(node.filename);
  if (!file) return;
  const lines = toLines(file);
  const startLC = toLineAndCharcter(file, node.position.start);
  const endLC = toLineAndCharcter(file, node.position.end);
  const startLine = startLC.line;
  const endLine = endLC.line + 1;
  return {
    filename: node.filename,
    position: {
      start: startLC,
      end: endLC,
    },
    lines: lines.slice(startLine, endLine)
  };
}

export function getDefinionFromRecord(node: MetadataMapRecord, metadata: Metadata, arround = 0) {
  const file = metadata.fileMap.get(node.filename);
  if (!file) return;
  const lines = toLines(file);
  const startLC = toLineAndCharcter(file, node.position.start);
  const endLC = toLineAndCharcter(file, node.position.end);
  const startLine = Math.max(0, startLC.line - arround);
  const endLine = Math.min(lines.length, endLC.line + arround + 1);
  return {
    filename: node.filename,
    position: {
      start: startLC,
      end: endLC,
    },
    contents: lines.slice(startLine, endLine).join("\n"),
  };
}

export function getDefinitionFromModel(model: any, metadata: Metadata, arround = 0) {
  const node = metadata.nodeMap.get(model);
  if (!node) return;
  return getDefinionFromRecord(node, metadata, arround);
}

export function toLines(contents: string) {
  let c = contents;
  let nextDelim = -1;
  const arr: string[] = [];
  while (true) {
    nextDelim = c.indexOf("\r\n");
    if (nextDelim !== -1) {
      arr.push(c.slice(0, nextDelim));
      c = c.slice(nextDelim + 2);
      continue;
    }
    nextDelim = c.indexOf("\n");
    if (nextDelim !== -1) {
      arr.push(c.slice(0, nextDelim));
      c = c.slice(nextDelim + 1);
      continue;
    }
    if (nextDelim === -1) {
      break;
    }
  }
  return arr;
}

export function toLineAndCharcter(contents: string, pos: number): Range {
  let nextDelim = -1;
  let c = contents;
  let rest = pos;
  let l = 0;
  while (true) {
    nextDelim = c.indexOf("\r\n");
    if (nextDelim !== -1) {
      if (rest - nextDelim - 2 < 0) {
        return {
          line: l,
          character: rest,
        };
      }
      ++l;
      c = c.slice(nextDelim + 2);
      rest = rest - nextDelim - 2;
      continue;
    }
    nextDelim = c.indexOf("\n");
    if (nextDelim !== -1) {
      if (rest - nextDelim - 1 < 0) {
        return {
          line: l,
          character: rest,
        };
      }
      ++l;
      c = c.slice(nextDelim + 1);
      rest = rest - nextDelim - 1;
      continue;
    }
    if (nextDelim === -1) {
      break;
    }
  }
  return {
    line: l,
    character: rest,
  };
}
