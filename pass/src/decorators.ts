import { getParams } from ".";
import { CLIENT_PARAM } from "./consts";
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

export function query(target: any, key: string) {
  enumerate(target, key);
  getMetadata(target, key).isQuery = true;
}

export function route(route: string) {
  return function (target: any, key?: string) {
    enumerate(target, key);
    getMetadata(target, key).route = route;

    if (key === undefined) {
      getMetadata(target).isConstructor = true;
    }
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
