import RestateClient from "restate/client";
import { Test } from "./test";

const client = RestateClient("http://localhost:7225", { dev: true });

client.resolve<Test>("/api/test").pipe((result) => {
  console.log(result)
  console.log(result.cons)
});