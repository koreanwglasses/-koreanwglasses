import { getParams } from ".";
import { CLIENT_PARAM } from "./consts";
import { getMetadata } from "./metadata";
import { Policy, Access } from "./policy";

function enumerate(target: any, key?: any) {
  getMetadata(target, key).enumerate = true;
}

/** @internal */
export function policy_1(policy: Policy | Access) {
  return function (target: any, key?: string) {
    enumerate(target, key);
    getMetadata(target, key).policy = policy;
  };
}

/** @internal */
export function action_1(target: any, key: string) {
  enumerate(target, key);
  getMetadata(target, key).isAction = true;
}

export function query(target: any, key: string) {
  enumerate(target, key);
  getMetadata(target, key).isQuery = true;
}

export function route(route: string) {
  return function (target: any, key: string) {
    enumerate(target, key);
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
