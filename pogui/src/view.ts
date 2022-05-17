import * as metadata from "./metadata";
import { ALLOW, getPolicy, joinRights } from "./policy";

export type View<T> = T extends Promise<infer S>
  ? View<S>
  : T extends Cascade<infer S>
  ? View<S>
  : T extends null | undefined | string | boolean | number | Symbol
  ? T
  : T extends (...args: infer S) => Resolvable<infer R>
  ? (...args: S) => Cascade<View<R>> | null
  : { [K in keyof T]?: View<T[K]> };

interface Packed {
  isState?: boolean;
  isAction?: boolean;
  isResource?: boolean;
}

interface PackedState<T> extends Packed {
  isState: true;
  isAction?: false;
  isResource?: false;

  data: T;
}

interface PackedAction extends Packed {
  isAction: true;
  isState?: false;
  isResource?: false;

  params?: Record<number, string>;
  canExecute: boolean;
}

interface PackedResource<T> extends Packed {
  isResource: true;
  isState?: false;
  isAction?: false;

  path?: string;
  properties: { [K in keyof T]?: PackedView<T[K]> };
}

export type PackedView<T> = T extends Promise<infer S>
  ? PackedView<S>
  : T extends Cascade<infer S>
  ? PackedView<S>
  : T extends null | undefined | string | boolean | number | Symbol
  ? PackedState<T>
  : T extends (...args: any) => any
  ? PackedAction
  : PackedResource<T>;

export function packView<T>(
  client: any,
  target: T
): Cascade<PackedView<T> | undefined>;
export function packView<T, K extends keyof T>(
  client: any,
  parent: T,
  key: K
): Cascade<PackedView<T[K]> | undefined>;
export function packView<T, K extends keyof T>(
  client: any,
  parent: T,
  key?: K
): Cascade<PackedView<T> | PackedView<T[K]> | undefined> {
  if (key === undefined) {
    return Cascade.resolve(parent).chain((target) => {
      const wrapper = { target };
      metadata.getMetadata(wrapper, "target").policy = () => ALLOW;
      return packView(client, wrapper, "target");
    });
  }

  return Cascade.resolve(parent[key]).chain((target) =>
    Cascade.all([
      getPolicy(parent, key)(client, parent, key),
      getPolicy(target)(client, target),
    ]).chain((rights) => {
      const { read, execute } = joinRights(...rights);

      if (!read) return undefined;

      const isAction =
        metadata.isAction(parent, key) || metadata.isAction(target);

      if (isAction) {
        const params = metadata.getParams(parent, key);

        return {
          isAction,
          params: Object.fromEntries(
            Object.entries(params)
              .filter(([key]) => typeof key === "string")
              .map(([key, value]) => [value, key])
          ),
          canExecute: execute,
        } as PackedAction as PackedView<T[K]>;
      }

      if (
        target &&
        (typeof target === "object" || typeof target === "function")
      ) {
        const keys = metadata.getEnumerated(target);
        const path = metadata.getMetadata(target).path;
        return Cascade.all(
          keys.map((key) => packView(client, target, key as keyof T[K]))
        )
          .chain((packedValues) =>
            keys.map((key, i) => [key, packedValues[i]] as const)
          )
          .chain(
            (entries) =>
              ({
                isResource: true,
                path,
                properties: Object.fromEntries(entries),
              } as PackedResource<T[K]> as PackedView<T[K]>)
          );
      }

      return { isState: true, data: target } as PackedState<T[K]> as PackedView<
        T[K]
      >;
    })
  );
}

export const unpackView = <T>(
  packed: PackedView<T>,
  path = "",
  remote?: (path: string, bodyParams: Record<string, any>) => Resolvable<any>
): View<T> => {
  if (packed.isState) return packed.data as View<T>;
  if (packed.isAction) {
    if (packed.canExecute) {
      return ((...args) => {
        const paramMap = packed.params ?? {};
        const bodyParams: Record<string, any> = {};

        args.forEach((arg, i) => {
          if (!(i in paramMap))
            throw new Error(`Unknown parameter at position ${i}`);
          bodyParams[paramMap[i]] = arg;
        });

        return remote?.(path, bodyParams);
      }) as View<T>;
    } else {
      return null as View<T>;
    }
  }
  if (packed.isResource) {
    return Object.fromEntries(
      Object.entries(packed.properties)
        .filter(([, value]) => value !== undefined)
        .map(
          ([key, value]) =>
            [
              key,
              unpackView(
                value as any,
                [packed.path ?? path, key].join("/"),
                remote
              ),
            ] as const
        )
    ) as View<T>;
  }
  throw new Error("Unexpected condition");
};
