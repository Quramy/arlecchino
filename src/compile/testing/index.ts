import { MetadataInCompilation } from "../types";

export function dummyMetadata() {
  const metadata: MetadataInCompilation = {
    currentFilename: "test",
    caughedErrors: [],
    catchCompileError: false,
    fileMap: new Map(),
    nodeMap: new Map(),
  };
  return metadata;
}
