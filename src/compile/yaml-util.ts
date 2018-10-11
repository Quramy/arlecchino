import {
  YAMLNode,
  YamlMap as YAMLMap,
  YAMLMapping,
  YAMLSequence,
} from "yaml-ast-parser";
import { MetadataInCompilation, YAMLNumberValueNode } from "./types";
import { NotAllowedValueTypeError, NoRequiredValueError, NotAllowedKeyError } from "./errors";

export type MappingDefinition<S, T, K extends keyof T> = {
  [P in keyof S]: [K, (node: YAMLNode) => T[K]];
};

export function mapWithMappingsNode<T, S>(node: YAMLNode, map: MappingDefinition<T, S, keyof S>, additional?: Partial<S>): S {
  const def = map as any;
  if (!node.mappings) {
    throw new NotAllowedValueTypeError(node, "mapping");
  }
  const ret = { } as any;
  node.mappings.forEach((n: YAMLMapping) => {
    const key = n.key.value;
    const wrap = def[key];
    if (!wrap) {
      throw new NotAllowedKeyError(n.key, key, Object.keys(def));
    }
    const [name, fn] = wrap;
    ret[name] = fn(n.value);
  });
  if (!additional) return ret as S;
  return Object.assign(ret, additional) as S;
}

export function hasKey(node: YAMLNode, k: string): node is YAMLMap {
  if (!node.mappings) return false;
  return (node.mappings as any[]).map((v: { key: YAMLNode }) => v.key.value as string).some(key => key === k);
}

export function normalizeOneOrMany(node: YAMLNode): YAMLNode[] {
  if ((node as YAMLSequence).items) return (node as YAMLSequence).items as YAMLNode[];
  return [node];
}

export function withValidateNonNullValueType(node: YAMLNode) {
  if (node && node.value) {
    return node;
  }
  throw new NoRequiredValueError(node);
}

export function withValidateNumberType(node: YAMLNode) {
  if ("valueObject" in node && typeof node.valueObject === "number") {
    return node as YAMLNumberValueNode;
  }
  throw new NotAllowedValueTypeError(node, "number");
}

export function setMetadata<T>(obj: T, metadata: MetadataInCompilation, node: YAMLNode): T {
  metadata.nodeMap.set(obj, {
    filename: metadata.currentFilename,
    postion: {
      start: node.startPosition,
      end: node.endPosition,
    },
  });
  return obj;
}
