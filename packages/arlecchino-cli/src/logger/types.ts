import { Metadata } from "../types/metadata";
import { NodePosition } from "./trace-functions";

export interface DefinitionAccessor<T extends Metadata> {
  definition(metadata: T): {
    filename: string,
    positionRange: {
      start: NodePosition,
      end: NodePosition,
    },
    lines: string[],
  } | undefined;
}
