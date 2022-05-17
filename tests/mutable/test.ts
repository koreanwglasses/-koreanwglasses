import { mutable, Mutable } from "mutable";

const m = mutable(0);
const n = Mutable.bindAsync([m], async (m) => m * 2);
const l = Mutable.bindAsync([m, n], (m, n) => `${m}-${n}`);

l.watch((...args) => console.log(args));

setInterval(() => {
  m.set(m.get() + 1);
}, 1000);
