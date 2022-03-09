import { Cascade } from "@koreanwglasses/cascade";
import {
  policy,
  ALLOW,
  DISABLE,
  DENY,
  packView,
  unpackView,
  action,
  Server,
  query,
  param,
} from "pass";

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
  @policy((client, target: Test) =>
    target.field.chain((field) => (field < 7 ? ALLOW : DISABLE))
  )
  inc() {}
}

const t = new Test();

// const packed = packView(null, t);
// // packed.chain((x) => console.log("packed", JSON.stringify(x)));

// const unpacked = packed.chain(unpackView);
// unpacked.chain((x) => console.log("unpacked", x));

@policy(ALLOW)
@query("/:id")
class User {
  static _cache = {};

  backend = new Cascade(() => {}, {
    onDetach: () => {
      delete User._cache[this.id];
      this.backend.close();
    },
  });

  @policy(ALLOW)
  x = {
    // Returns empty object in view because of default deny
    y: 2,
  };

  constructor(@param("id") readonly id: string) {
    if (id in User._cache) return User._cache[id];
    User._cache[id] = this;
  }

  @policy(ALLOW)
  get z() {
    return this.id;
  }

  @policy(ALLOW)
  @action
  doSomething() {}
}

(async () => {
  const server = new Server();
  const { result } = await server.resolve(null, { ".": User }, ["test"], {});

  const view = await packView(
    null,
    await Cascade.resolve(result).toPromise()
  ).toPromise();

  console.log(JSON.stringify(view));
})();
