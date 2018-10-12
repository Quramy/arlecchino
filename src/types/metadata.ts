export type MetadataMapRecord = {
  filename: string,
  position: {
    start: number,
    end: number,
  },
};

export type NodeMap = Map<any, MetadataMapRecord>;

export type Metadata = {
  // currentFilename: string,
  fileMap: Map<string, string>,
  nodeMap: NodeMap,
};
