import { Cascade } from "cascade";
import { policy, ALLOW, packView } from "pass";

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
packed.chain((x) => console.log(JSON.stringify(x)));
