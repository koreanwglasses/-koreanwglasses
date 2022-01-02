import { Cascade } from "@koreanwglasses/cascade";
import { pack, Client } from "restate/core";

export class Test {
  private _field = 0;
  private _allow = false;

  constructor() {
    setInterval(() => {
      this._field++;
      this.field.invalidate();
    }, 5000);
  }

  field = new Cascade(() => this._field, { autoclose: false });

  allow = new Cascade(() => this._allow, { autoclose: false });

  cons = [0, 1];

  @pack
  get field2() {
    return "hello"
  }

  private static _instance?: Test;

  static get instance(): Test {
    return (this._instance ??= new Test());
  }

  static test = 100;
}
