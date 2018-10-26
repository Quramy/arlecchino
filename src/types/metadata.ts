export type MetadataMapRecord = {
  filename: string,
  position: {
    start: number,
    end: number,
  },
};

export type NodeMap = Map<any, MetadataMapRecord>;

export type Metadata = {
  baseDir: string,
  fileMap: Map<string, string>,
  nodeMap: NodeMap,
};
