import { Cascade } from "@koreanwglasses/cascade";
import {
  policy,
  ALLOW,
  DISABLE,
  DENY,
  packView,
  unpackView,
  action,
  query,
  param,
  mountpath,
  client,
  resolve,
} from "pacs";

@policy(ALLOW)
@mountpath("/api/user")
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
    y: 2,
  };

  constructor(@param("id") readonly id: string) {
    if (id in User._cache) return User._cache[id];
    User._cache[id] = this;

    setInterval(() => {
      this.w.refresh();
    }, 2000);
  }

  @policy(ALLOW)
  get z() {
    return this.id;
  }

  @policy(ALLOW)
  @action
  doSomething(@param("n") n: number, @client client?: any) {
    console.log(client, this._w, n);
  }

  private _w = 0;
  @policy(ALLOW)
  w = new Cascade(() => ++this._w);
}

(async () => {
  const base = { api: { user: User } };

  const { result } = await resolve<User>(null, base, "/api/user/test", {});

  const packed = packView(null, result);

  packed.chain((view) => {
    const unpacked = unpackView(view, "", (path, bodyParams) => {
      console.log(`Action called on ${path}`);
      resolve({ test: "string" }, base, path, bodyParams);
    });

    console.log(unpacked);
    unpacked.doSomething(unpacked.w);
  });
})();
