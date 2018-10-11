import { MetadataInCompilation } from "../types";

export function dummyMetadata() {
  const metadata: MetadataInCompilation = {
    currentFilename: "test",
    fileMap: new Map(),
    nodeMap: new Map(),
  };
  return metadata;
}
