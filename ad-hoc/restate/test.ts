import { Cascade } from "@koreanwglasses/cascade";
import { client, evaluate, include, policy, PUBLIC } from "restate/core";

// @policy(PUBLIC)
export class Test {
  private _field = 0;
  private _allow = false;

  constructor() {
    // setInterval(() => {
    //   this._allow = !this._allow;
    //   this.allow.invalidate();
    // }, 5000);
  }

  field = new Cascade(() => this._field);

  allow = new Cascade(() => this._allow);

  cons = [0, 1]

  @include
  setField(@client client?: any) {
    console.log("Client", client);
  }

  private static _instance?: Test;

  @include
  static get instance(): Test {
    return (this._instance ??= new Test());
  }

  @include
  static test = 100;
}
