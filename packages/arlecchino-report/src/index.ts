import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import { ScenarioReportState } from "arlecchino-report-interface";


export type WriteIndexFileOptions = {
  dist: string,
  prefixList: string[],
};

export type WriteReportOptions = {
  prefix: string,
};

export function writeIndexFile({ prefixList }: WriteIndexFileOptions) {
  // TODO
}

export function writeReport({ prefix }: WriteReportOptions) {
  const dir = path.join(prefix, "report")
  mkdirp.sync(dir);
  const content = `<!doctype html>
    <html>
      <body>Success</body>
    </html>
  `;
  fs.writeFileSync(path.join(dir, "index.html"), content, "utf8");
}
