import { nanoid } from "nanoid";
import { Access } from ".";
import { CLIENT_PARAM, PACS_METADATA } from "./consts";
import { DEFAULT_POLICY, Policy } from "./policy";

export type Key = string | number | symbol;

export interface Metadata {
  id?: string;
  policy?: Policy | Access;
  isAction?: boolean;
  enumerate?: boolean;

  route?: string;

  isQuery?: boolean;
  params?: Partial<Record<string | typeof CLIENT_PARAM, number>>;

  props?: Record<Key, Metadata>;
}

export function getMetadata(obj: any, key?: Key): Metadata {
  if (key === undefined) {
    try {
      return (obj[PACS_METADATA] ??= {});
    } catch {
      return Object.freeze({});
    }
  }
  return ((getMetadata(obj).props ??= {})[key] ??= {});
}

export const getId = (obj: any) => (getMetadata(obj).id ??= nanoid());

export const getEnumerated = <T>(obj: T): (keyof T)[] => [
  ...new Set([
    ...(Object.keys(obj) as (keyof T)[]),
    ...Object.entries(getMetadata(obj).props ?? {})
      .filter(([key, value]) => value.enumerate)
      .map(([key, value]) => key as keyof T),
  ]),
];

export const getPolicy = (obj: any, key?: Key): Policy => {
  const policy = getMetadata(obj, key).policy ?? DEFAULT_POLICY;
  if (typeof policy === "function") return policy;
  return () => policy;
};

export const getParams = (obj: any, key: Key) =>
  (getMetadata(obj, key).params ??= {});

export const isAction = (obj: any, key?: Key) =>
  getMetadata(obj, key).isAction ?? false;
