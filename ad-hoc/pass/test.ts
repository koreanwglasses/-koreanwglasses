import { Cascade } from "@koreanwglasses/cascade";
import { policy, ALLOW, DENY, packView, unpackView, action } from "pass";

export class Test {
  private _field = 0;

  constructor() {
    setInterval(() => {
      this._field++;
      this.field.refresh();
    }, 2000);
  }

  @policy((client, target) => (target._field < 5 ? ALLOW : DENY))
  field = new Cascade(() => this._field);

  @action
  @policy(ALLOW)
  inc() {}
}

const t = new Test();

const packed = packView(null, t);
packed.chain((x) => console.log("packed", JSON.stringify(x)));

const unpacked = packed.chain(unpackView);
unpacked.chain((x) => console.log("unpacked", x));
