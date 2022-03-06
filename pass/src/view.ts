import { Cascade, Resolvable } from "@koreanwglasses/cascade";
import * as metadata from "./metadata";
import { ALLOW, joinRights } from "./policy";

export type View<T> = T extends Promise<infer S>
  ? View<S>
  : T extends Cascade<infer S>
  ? View<S>
  : T extends null | undefined | string | boolean | number | Symbol
  ? T
  : T extends (...args: infer S) => Resolvable<infer R>
  ? (...args: S) => Cascade<View<R>> | null
  : { [K in keyof T]?: View<T[K]> };

export type PackedPrimitive<T> = { isPrimitive: true; value: T };
export type PackedAction = { isAction: true; canExecute: boolean };
export type PackedObject<T> = {
  isObject: true;
  obj: { [K in keyof T]?: PackedView<T[K]> };
};

export type PackedView<T> = T extends Promise<infer S>
  ? PackedView<S>
  : T extends Cascade<infer S>
  ? PackedView<S>
  : T extends null | undefined | string | boolean | number | Symbol
  ? PackedPrimitive<T>
  : T extends (...args: any) => any
  ? PackedAction
  : PackedObject<T>;

export function packView<T>(
  client: any,
  obj: T
): Cascade<PackedView<T> | undefined>;
export function packView<T, K extends keyof T>(
  client: any,
  obj: T,
  key: K
): Cascade<PackedView<T[K]> | undefined>;
export function packView<T, K extends keyof T>(
  client: any,
  obj: T,
  key?: K
): Cascade<PackedView<T> | PackedView<T[K]> | undefined> {
  if (key === undefined) {
    return Cascade.resolve(obj).chain((obj) => {
      const wrapper = { obj };
      metadata.getMetadata(wrapper, "obj").policy = () => ALLOW;
      return packView(client, wrapper, "obj");
    });
  }

  return Cascade.resolve(obj[key]).chain((resource) =>
    Cascade.all([
      metadata.getPolicy(obj, key)(client, resource, key),
      metadata.getPolicy(resource)(client, resource),
    ]).chain((rights) => {
      const { read, execute } = joinRights(...rights);

      if (!read) return undefined;

      const isAction =
        metadata.isAction(obj, key) || metadata.isAction(resource);

      if (isAction)
        return {
          isAction,
          canExecute: execute,
        } as PackedView<T[K]>;

      if (
        resource &&
        (typeof resource === "object" || typeof resource === "function")
      ) {
        const keys = Object.keys(resource);
        return Cascade.all(
          keys.map((key) => packView(client, resource, key as keyof T[K]))
        )
          .chain((packedValues) =>
            keys.map((key, i) => [key, packedValues[i]] as const)
          )
          .chain(
            (entries) =>
              ({
                isObject: true,
                obj: Object.fromEntries(entries),
              } as PackedView<T[K]>)
          );
      }

      return { isPrimitive: true, value: resource } as PackedView<T[K]>;
    })
  );
}
