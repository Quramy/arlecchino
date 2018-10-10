import {
  Metadata as BaseMetadata,
} from "../types/metadata";

export type MetadataInCompilation = BaseMetadata & {
  currentFilename: string,
};
