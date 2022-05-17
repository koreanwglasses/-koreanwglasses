import { getMetadata, Key } from "./metadata";

export type Access = { read?: boolean; execute?: boolean };

export const INHERIT = {};
export const ALLOW = { read: true, execute: true };
export const DISABLE = { read: true, execute: false };
export const DENY = { read: false, execute: false };

export type Policy<T = any> = (
  client: any,
  target: T,
  key?: keyof T
) => Resolvable<Access>;

export const joinRights = (...rights: Access[]) => {
  const { read, execute } = rights.reduce((a, b) => ({
    read: a.read ?? b.read,
    execute: a.execute ?? b.execute,
  }));
  return { read: read ?? false, execute: execute ?? false };
};

export const getPolicy = (target: any, key?: Key): Policy => {
  const policy =
    getMetadata(target, key).policy ??
    (target &&
      typeof target === "object" &&
      Object.getPrototypeOf(Object.getPrototypeOf(target)) === null)
      ? () => ALLOW // Exception to default deny on objects will null prototypes
      : () => INHERIT;
  if (typeof policy === "function") return policy;
  return () => policy;
};
