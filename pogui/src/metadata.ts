import { Access } from ".";
import { CLIENT_PARAM, PACS_METADATA } from "./consts";
import { Policy } from "./policy";

export type Key = string | number | symbol;

export interface Metadata {
  path?: string;
  props?: Record<Key, Metadata>;

  enumerate?: boolean;
  policy?: Policy | Access;

  route?: string;
  isConstructorQuery?: boolean;
  isAction?: boolean;
  isQuery?: boolean;
  params?: Partial<Record<string | typeof CLIENT_PARAM, number>>;
}

export function getMetadata(target: any, key?: Key): Metadata {
  if (key === undefined) {
    try {
      return (target[PACS_METADATA] ??= {});
    } catch {
      return Object.freeze({});
    }
  }

  return ((getMetadata(target).props ??= {})[key] ??= {});
}

export const getEnumerated = <T>(target: T): (keyof T)[] => [
  ...new Set([
    ...(Object.keys(target) as (keyof T)[]),
    ...Object.entries(getMetadata(target).props ?? {})
      .filter(([key, value]) => value.enumerate)
      .map(([key, value]) => key as keyof T),
  ]),
];


export const getParams = (target: any, key: Key) =>
  (getMetadata(target, key).params ??= {});

export const isAction = (target: any, key?: Key) =>
  getMetadata(target, key).isAction ?? false;
