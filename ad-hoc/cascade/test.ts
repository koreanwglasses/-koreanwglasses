import { Cascade, Resolvable } from "cascade";

let _a = 1;
const a = new Cascade(() => _a++);
a.pipe((v) => console.log("a", v));

setTimeout(() => {
  a.invalidate();
}, 1000);

const b = new Cascade(
  () =>
    new Promise<boolean>((res) =>
      setTimeout(() => {
        res(false);
      }, 500)
    )
);

b.pipe((v) => console.log("b", v));

const c = Cascade.all<[a: Cascade<number>, b: Resolvable<boolean>, c: number]>([
  a,
  b,
  20,
]);
c.pipe((v) => console.log("a,b", v));

setTimeout(() => {
  c.invalidate();
}, 2000);

const d = new Cascade(() => a);
d.pipe((v) => console.log("d", v));
