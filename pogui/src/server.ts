import express from "express";
import socketio from "socket.io";
import { resolve } from "./resolve";

const app = express();

app.post("*", async (req, res, next) => {
  const { handled, result } = await resolve(null, {}, req.path, req.body);
  if (!handled) return next();
});

const io = new socketio.Server();
io.on("connect", (socket) => {
  socket.on("request", async (path, body) => {
    const { handled, result } = await resolve(null, {}, path, body);

    // Cascade.resolve(result).chain();
  });
});
