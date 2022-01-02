import { useRestate } from "@koreanwglasses/restate-react";
import { KeyboardArrowLeft } from "@mui/icons-material";
import { Typography, TextField, Button } from "@mui/material";
import { useContext } from "react";
import { Flex, RFlex } from "../ui/flex";
import { FlexForm } from "../ui/flex-form";
import { MainContext } from "./main";

export const RoomSelection = () => {
  const { state, setIndex } = useContext(MainContext)!;
  const restate = useRestate();
  return (
    <Flex sx={{ p: 2 }} gap={1}>
      <Typography>Welcome, {state.user.username}</Typography>
      <Typography>Have a room code? Join a room!</Typography>
      <FlexForm
        onSubmit={({ joinCode }) =>
          restate.resolve("/api/room/join", joinCode).get()
        }
        checkSync={() => state.user.roomId}
        onSuccess={() => setIndex(2)}
      >
        <RFlex gap={1}>
          <TextField
            label="Room Code"
            name="joinCode"
            variant="standard"
            defaultValue={state.room?.joinCode ?? ""}
          />
          <Button variant="outlined" type="submit">
            Join
          </Button>
        </RFlex>
      </FlexForm>
      <Typography>Or create a new one!</Typography>
      <FlexForm
        onSubmit={() => restate.resolve("/api/room/create").get()}
        checkSync={() => state.user.roomId}
        onSuccess={() => setIndex(2)}
      >
        <Button variant="outlined" type="submit">
          New Room
        </Button>
      </FlexForm>
      <Button onClick={() => setIndex(0)}>
        <KeyboardArrowLeft />
        Back
      </Button>
    </Flex>
  );
};
