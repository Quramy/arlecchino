import path from "path";

export function scenarioNameToPrefix(baseDir: string, scenarioName: string) {
  return path.join(baseDir, scenarioName.replace(/\s+/g, "_"));
}
