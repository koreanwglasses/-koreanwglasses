import { Cascade } from "@koreanwglasses/cascade";
import { Client, view, WithViews } from "@koreanwglasses/restate";
import { Game } from "./game";
import { Room } from "./room";
import { User } from "./user";

export type AppState = {
  user: User;
  room: WithViews<Room, "players"> | null;
  game: WithViews<Game, "cards"> | null;
};

export class App {
  @view
  static state(client: Client) {
    return Cascade.resolve(User._getCurrentUser(client))
      .pipeAll((user) => [user, user._store.roomId] as const)
      .pipeAll(([user, roomId]) => {
        const room = typeof roomId === "string" ? new Room(roomId) : null;
        return [user, room, room?._store.gameId] as const;
      })
      .pipe(([user, room, gameId]) => {
        const game = typeof gameId === "string" ? new Game(gameId) : null;

        return {
          user,
          room,
          game,
        } as AppState;
      });
  }
}
