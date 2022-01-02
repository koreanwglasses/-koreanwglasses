import { createContext, useState } from "react";
import { AppState } from "../../resources/app";
import { RoomLobby } from "./room-lobby";
import { RoomSelection } from "./room-selection";
import SwipeableView from "react-swipeable-views";
import { Unpacked } from "@koreanwglasses/restate";
import { UserDetails } from "./user-details";

export const MainContext = createContext<{
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  state: Unpacked<AppState>;
} | null>(null);

export const Main = ({ state }: { state: Unpacked<AppState> }) => {
  const [index, setIndex] = useState(
    state.room ? 2 : state.user.username ? 1 : 0
  );

  return (
    <MainContext.Provider value={{ setIndex, state }}>
      <SwipeableView disabled index={index} animateHeight>
        <UserDetails />
        <RoomSelection />
        <RoomLobby />
      </SwipeableView>
    </MainContext.Provider>
  );
};
