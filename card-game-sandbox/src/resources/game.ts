import { Client, view, action } from "@koreanwglasses/restate";
import mongoose from "mongoose";
import { nanoid } from "nanoid";
import { PlayingCard } from "../components/game/playing-cards/playing-card";
import { model, MongoRestate } from "./lib/mongo-helper";

export type GameCard = {
  name: PlayingCard | null;
  tempId: string;
  visibility: "public" | "private";
  ownerId: string | null;
  stackIndex: number;
};

type GameData = {
  cards: GameCard[];
};

const schema = new mongoose.Schema<GameData>({
  cards: [
    {
      name: String,
      tempId: String,
      visibility: String,
      ownerId: String,
      stackIndex: Number,
    },
  ],
});

function PLAYERS_ONLY() {}

@model("Game", schema)
export class Game extends MongoRestate<GameData> {
  declare static _model: mongoose.Model<GameData>;

  ///////////
  // VIEWS //
  ///////////

  @view
  cards(client: Client) {
    return this._store.cards.pipe((cards) =>
      cards
        .map(({ name, tempId, visibility, ownerId, stackIndex }) => ({
          name:
            visibility === "public" || client.session.userId === ownerId
              ? name
              : null,
          tempId,
          visibility,
          ownerId,
          stackIndex,
        }))
        .sort((a, b) => a.stackIndex - b.stackIndex)
    );
  }

  /////////////
  // ACTIONS //
  /////////////

  @action
  static async _init() {
    const game = new Game._model({
      cards: deck(),
    });
    await game.save();
    return new Game(String(game._id));
  }
}

////////////////////
// STATIC HELPERS //
////////////////////

function deck() {
  const cards = [..."23456789TJQKA"]
    .map((rank) =>
      [..."CHSD"].map((suit, i) => ({
        name: rank + suit,
        tempId: nanoid(4),
        visibility: "private",
        ownerId: null,
        stackIndex: i,
      }))
    )
    .flat() as GameCard[];

  return cards;
}

function shuffle(cards: GameCard[]) {
  for (let i = 0; i < cards.length; i++) {
    const swap = (i: number, j: number) => {
      [cards[i], cards[j]] = [cards[j], cards[i]];
    };

    const j = Math.floor(i + Math.random() * (cards.length - i));
    cards[j].stackIndex = i;
    swap(i, j);
  }

  return cards;
}
