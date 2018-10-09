import {
  Metadata,
} from "../types/metadata";

export function restore(model: any, metadata: Metadata) {
  const node = metadata.nodeMap.get(model);
  if (!node) return;
  const file = metadata.fileMap.get(node.filename);
  if (!file) return;
  const fragment = file.slice(node.postion.start, node.postion.end);
  return {
    filename: node.filename,
    fragment,
  };
}
