import { Cascade } from "cascade";

// const x = [0, 0] as [number, number];
// const _a = new Cascade(() => {
//   return x;
// });
// const a = _a.chain(async ([x]) => new Cascade(() => x));
// const b = _a.chain(async ([, x]) => {
//   if (x === -5) throw "error";
//   return x;
// });
// const c = new Cascade(() => {
//   const all = Cascade.all([a, b] as const);

//   return all.chain(([a, b]) => {
//     return a + b;
//   });
// });
const d = new Cascade(() => {
  const a = new Cascade.Adapter<number>();

  let i = 0;
  const int = setInterval(() => {
    console.log("internal:", i);
    a.setValue(i++);
  }, 1000);

  a.options.onDetach = () => {
    clearInterval(int);
    a.close();
    console.log("closed d")
  };

  return a;
});
d.chain((x) => console.log("chain", x));
(async () => {
  console.log("promise", await d.toPromise())
})();

// a.chain((x) => console.log("a", x));
// b.chain((x) => console.log("b", x));
// c.chain((x) => console.log("c", x)).catch((e) => console.log(e));
// c.catch(() => c.close());

// setInterval(() => {
//   x[0]++;
//   x[0]++;
//   x[1]--;
//   _a.refresh();
// }, 1000);

// setTimeout(() => {
//   a.chain((x) => console.log("a", x));
// }, 7000);

setInterval(() => {
  d.refresh();
}, 5000);

// let j = 0;
// const _a = new Cascade(() => j++);
// const a = new Cascade(() => ({ a: 1, b: _a }))._exp_deep();
// a.chain((x) => console.log(JSON.stringify(x)));
// const b = a.chain((x) => x.b)._exp_throttle(1000).chain(console.log);

// let i = setInterval(() => {
//   _a.refresh();
//   if(j > 102) clearInterval(i)
// }, 100);
