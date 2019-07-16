import { MetadataInCompilation } from "../types";
import { ImportFileNotFoundError } from "../errors";
import { DefaultCompilationContext } from "../compilation-context";

type TestingMetadataOptions = {
  fileCache?: { name: string, content: string }[],
};

class TestingMetadata extends DefaultCompilationContext implements MetadataInCompilation {

  constructor(opt: TestingMetadataOptions = { }) {
    super({
      baseDir: "",
      entryFilename: "test",
      content: "",
    });
    this.catchCompileError = false;
    if (opt.fileCache) {
      opt.fileCache.forEach(cache => this.fileMap.set(cache.name, cache.content));
    }
  }

  readFile(name: string) {
    if (this.fileMap.has(name)) {
      return {
        absPath: "/dir/" + name,
        content: this.fileMap.get(name),
      };
    } else {
      return {
        absPath: "/dir/" + name,
      };
    }
  }
}

export function dummyMetadata(opt: TestingMetadataOptions = { }) {
  const metadata = new TestingMetadata(opt);
  return metadata;
}
