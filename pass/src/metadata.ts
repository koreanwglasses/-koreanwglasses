import { SPC_METADATA_KEY } from "./consts";
import { DEFAULT_POLICY, Policy } from "./policy";

export type Key = string | number | symbol;

export interface Metadata {
  policy?: Policy;
  isAction?: boolean;
  props?: Record<Key, Metadata>;
}

export function getMetadata(obj: any, key?: Key): Metadata {
  if (key === undefined) {
    try {
      return (obj[SPC_METADATA_KEY] ??= {});
    } catch {
      return Object.freeze({});
    }
  }
  return ((getMetadata(obj).props ??= {})[key] ??= {});
}

export const getPolicy = (obj: any, key?: Key): Policy => {
  return getMetadata(obj, key).policy ?? DEFAULT_POLICY;
};

/** @internal */
export const policy_0 = (policy: Policy, obj: any, key?: Key) => {
  getMetadata(obj, key).policy = policy;
};

export const isAction = (obj: any, key?: Key) =>
  getMetadata(obj, key).isAction ?? false;

/** @internal */
export const action_0 = <T extends (...args: any[]) => any>(func: T): T => {
  function wrapper(this: any, ...params: Parameters<T>) {
    return func.call(this, params);
  }
  getMetadata(wrapper).isAction = true;
  return wrapper as T;
};
