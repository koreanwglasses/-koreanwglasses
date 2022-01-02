import { generateSlug } from "random-word-slugs";
import { User } from "./user";
import { Cascade } from "@koreanwglasses/cascade";
import mongoose from "mongoose";
import { model, MongoRestate } from "./lib/mongo-helper";
import {
  action,
  Client,
  clientIn,
  view,
  pack
} from "@koreanwglasses/restate";
import { Game } from "./game";

type RoomData = {
  hostId: string;
  gameId: string;
  name: string;
  joinCode: string;
};

const schema = new mongoose.Schema({
  hostId: String,
  gameId: String,
  name: String,
  joinCode: String,
});

function MEMBERS_ONLY() {}

function HOST_ONLY() {}

@model("Room", schema)
export class Room extends MongoRestate<RoomData> {
  declare static _model: mongoose.Model<RoomData>;

  ///////////
  // VIEWS //
  ///////////

  @pack
  get joinCode() {
    return this._store.joinCode;
  }

  @pack
  get name() {
    return this._store.name;
  }

  /**
   * These queries are composed of base queries and should not be invalidated
   * directly
   */

  @view
  players(client: Client) {
    return Cascade.all([
      User._getCurrentUser(client),
      User._getUsersInRoom(this._id),
      this._store.hostId,
    ] as const).pipe(([currentUser, users, hostId]) =>
      users.map((user) => ({
        user,
        isSelf: user._id === currentUser._id,
        isHost: user._id === hostId,
      }))
    );
  }

  /////////////
  // ACTIONS //
  /////////////

  @action
  static async _init() {
    const room = new Room._model({ joinCode: await generateRoomCode() });
    await room.save();
    return new Room(String(room._id));
  }

  @action
  async setName(name: string) {
    await this._store.name.set(name);
  }

  @action
  async newCode() {
    await this._store.joinCode.set(await generateRoomCode());
  }

  @action
  static async join(joinCode: string, @clientIn client?: Client) {
    const user = await User._getCurrentUser(client!);
    const [roomId] = await Room._model
      .findOne({ joinCode })
      .distinct("_id")
      .exec();

    await user._setRoom(roomId);
  }

  @action
  static async create(@clientIn client?: Client) {
    const user = await User._getCurrentUser(client!);
    const room = await Room._init();

    await room._store.hostId.set(user._id);
    await user._store.roomId.set(room._id);
  }

  @action
  async startGame() {
    const game = await Game._init();
    await this._store.gameId.set(game._id);
  }
}

/////////////
// HELPERS //
/////////////

async function generateRoomCode() {
  let joinCode: string;
  let maxTries = 5;
  do {
    joinCode = generateSlug();
    if (!(await Room._model.exists({ joinCode }))) return joinCode;

    maxTries--;
    if (maxTries <= 0) throw new Error("Failed to generate a group code");
  } while (true);
}
