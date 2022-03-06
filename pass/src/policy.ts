import { Resolvable } from "@koreanwglasses/cascade";

export type Rights = { read?: boolean; execute?: boolean };

export const INHERIT = {};
export const ALLOW = { read: true, execute: true };
export const DISABLE = { read: true, execute: false };
export const DENY = { read: false, execute: false };

export type Policy = (
  client: any,
  target: any,
  key?: any
) => Resolvable<Rights>;

export const DEFAULT_POLICY = () => INHERIT;

export const joinRights = (...rights: Rights[]) => {
  const { read, execute } = rights.reduce((a, b) => ({
    read: a.read ?? b.read,
    execute: a.execute ?? b.execute,
  }));
  return { read: read ?? false, execute: execute ?? false };
};
