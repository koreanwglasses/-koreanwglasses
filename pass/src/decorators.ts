import { getMetadata } from "./metadata";
import { Policy, Access } from "./policy";

function enumerate(target: any, key: any) {
  getMetadata(target, key).enumerate = true;
}

/** @internal */
export function policy_1(policy: Policy | Access) {
  return function (target: any, key?: string) {
    if (key) enumerate(target, key);
    getMetadata(target, key).policy =
      typeof policy === "function" ? policy : () => policy;
  };
}

/** @internal */
export function action_1(target: any, key: string) {
  enumerate(target, key);
  getMetadata(target, key).isAction = true;
}
