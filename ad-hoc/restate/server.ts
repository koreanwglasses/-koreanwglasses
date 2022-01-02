import { RestateServer } from "restate/server";
import { Server as IO } from "socket.io";
import session from "express-session";
import express from "express";
import { Test } from "./test";

const io = new IO();
const packed = new RestateServer({
  server: io,
  makeClient: (req) => req.session?.id,
});

const app = express();

const _session = session({
  secret: "secret",
  resave: true,
  saveUninitialized: true,
});
app.use(_session);

app.use("/api/test", packed.serve(new Test()));

app.all("*", (req, res, next) => {
  console.log("Unhandled request for", req.url);
  next();
});

const server = app.listen(7225, () => {
  console.log("Listening on http://localhost:7225");
});

io.attach(server);
