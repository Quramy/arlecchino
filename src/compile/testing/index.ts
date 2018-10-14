import { MetadataInCompilation } from "../types";

export function dummyMetadata() {
  const metadata: MetadataInCompilation = {
    currentFilename: "test",
    caughtErrors: [],
    catchCompileError: false,
    fileMap: new Map(),
    nodeMap: new Map(),
  };
  return metadata;
}
