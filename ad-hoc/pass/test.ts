import { Cascade } from "@koreanwglasses/cascade";
import { policy, ALLOW, packView, unpackView } from "pass";

export class Test {
  private _field = 0;

  constructor() {
    setInterval(() => {
      this._field++;
      this.field.refresh();
    }, 5000);
  }

  @policy(ALLOW)
  field = new Cascade(() => this._field);
}

const t = new Test();

const packed = packView(null, t);
// packed.chain((x) => console.log(JSON.stringify(x)));

const unpacked = packed.chain(unpackView);
unpacked.chain((x) => console.log(JSON.stringify(x)))
