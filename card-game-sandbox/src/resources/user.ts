import { Cascade } from "@koreanwglasses/cascade";
import { Client, action, pack, WithViews } from "@koreanwglasses/restate";
import mongoose from "mongoose";
import { model, MongoRestate } from "./lib/mongo-helper";

type UserData = {
  id: string;
  roomId: string | null;
  lastDisconnect: number | null;
  username: string | null;
};

const schema = new mongoose.Schema<UserData>({
  id: String,
  roomId: String,
  lastDisconnect: Number,
  username: String,
});

const DISCONNECT_TIMEOUT = 1000 * 30;

function ALLOW_SELF() {}

function ROOM_ONLY() {}

@model("User", schema)
export class User extends MongoRestate<UserData> {
  declare static _model: mongoose.Model<UserData>;

  /////////////
  // QUERIES //
  /////////////

  private static _usersInRoomMemo: Record<string, Cascade<User[]>> = {};
  static _getUsersInRoom(roomId: string) {
    return (User._usersInRoomMemo[roomId] ??= new Cascade(
      async () =>
        (
          await User._model
            .find({
              roomId,
            })
            .distinct("_id")
            .exec()
        ).map((id) => new User(String(id))),
      { onClose: () => delete User._usersInRoomMemo[roomId] }
    ));
  }

  static async _getCurrentUser(client: Client) {
    if (!client.session.userId) {
      const user = await User._init();
      client.session.userId = user._id;
      return user;
    }

    return new User(client.session.userId);
  }

  ///////////
  // VIEWS //
  ///////////

  /**
   * These queries are composed of base queries and should not be invalidated
   * directly
   */

  @pack
  get id() {
    return this._store.id;
  }

  @pack
  get username() {
    return this._store.username;
  }

  @pack
  get roomId() {
    return this._store.roomId;
  }

  @pack
  get isConnected() {
    return this._store.lastDisconnect.pipe((lastDisconnect) => !lastDisconnect);
  }

  /////////////
  // ACTIONS //
  /////////////

  @action
  static async _init() {
    const user = new User._model();
    await user.save();

    return new User(String(user._id));
  }

  @action
  async _setRoom(roomId: string | null) {
    const prevRoomId = await this._store.roomId.get();
    await this._store.roomId.set(roomId);

    if (roomId) User._getUsersInRoom(roomId).invalidate();
    if (prevRoomId) User._getUsersInRoom(prevRoomId).invalidate();
  }

  @action
  async _reconnect() {
    await this._store.lastDisconnect.set(null);
  }

  @action
  async _disconnect(lastDisconnect: number) {
    await this._store.lastDisconnect.set(lastDisconnect);

    // Follow-up and disconnect from room/game if timed out
    setTimeout(async () => {
      const lastDisconnect = await this._store.lastDisconnect.get();
      if (lastDisconnect && lastDisconnect + DISCONNECT_TIMEOUT <= Date.now()) {
        this.leaveRoom();
      }
    }, DISCONNECT_TIMEOUT + lastDisconnect - Date.now());
  }

  @action
  async setUsername(username: string) {
    await this._store.username.set(username);
  }

  @action
  async leaveRoom() {
    await this._store.roomId.set(null);
  }
}
