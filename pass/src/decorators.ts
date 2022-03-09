import { getParams } from ".";
import { CLIENT_PARAM, PACS_METADATA } from "./consts";
import { getMetadata } from "./metadata";
import { Policy, Access } from "./policy";

function enumerate(target: any, key?: any) {
  getMetadata(target, key).enumerate = true;
}

export function policy(policy: Policy | Access) {
  return function (target: any, key?: string) {
    enumerate(target, key);
    getMetadata(target, key).policy = policy;
  };
}

export function action(target: any, key: string) {
  enumerate(target, key);
  getMetadata(target, key).isAction = true;
}

export function query(route?: string) {
  return function (target: any, key?: string) {
    if (key === undefined) {
      // Special handling for routes defined on a constructor

      class Wrapper extends target {
        constructor(...args: any[]) {
          super(...args);

          // Compute path
          let path = getMetadata(target).route;
          Object.entries(getMetadata(target).params ?? {}).forEach(
            ([key, i]) => {
              if (i !== undefined) path = path?.replace(`:${key}`, args[i]);
            }
          );

          // Save path for future reference
          getMetadata(this).path = path;
        }
      }

      getMetadata(target).isConstructor = true;
      getMetadata(target).route = route;

      return Wrapper as typeof target;
    }

    enumerate(target, key);
    getMetadata(target, key).isQuery = true;
    getMetadata(target, key).route = route;
  };
}

export function param(name: string) {
  return function (target: any, key: string, i: number) {
    enumerate(target, key);
    getParams(target, key)[name] = i;
  };
}

export function client(target: any, key: string, i: number) {
  enumerate(target, key);
  getParams(target, key)[CLIENT_PARAM] = i;
}
