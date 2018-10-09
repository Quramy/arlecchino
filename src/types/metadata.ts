export type MetadataMapRecord = {
  filename: string,
  postion: {
    start: number,
    end: number,
  },
};

export type NodeMap = Map<any, MetadataMapRecord>;

export type Metadata = {
  filename: string,
  fileMap: Map<string, string>,
  nodeMap: NodeMap,
};
