import { Unpacked } from "@koreanwglasses/restate";
import {
  KeyboardArrowLeft,
  PlayArrow,
  Star,
  ContentCopy,
} from "@mui/icons-material";
import {
  CircularProgress,
  Typography,
  Button,
  Divider,
  Tooltip,
  ButtonBase,
} from "@mui/material";
import copy from "copy-to-clipboard";
import { useContext } from "react";
import { AppState } from "../../resources/app";
import { EditableText } from "../ui/editable-text";
import { Flex, RFlex } from "../ui/flex";
import { FlexForm } from "../ui/flex-form";
import { Refresh } from "../ui/refresh";
import { MainContext } from "./main";

export const RoomLobby = () => {
  const { setIndex, state } = useContext(MainContext)!;
  return (
    <Flex sx={{ p: 2, height: 600 }} gap={1}>
      <FlexForm
        onSubmit={({ name }) => state.room?.setName(name)}
        checkSync={({ name }) => state.room?.name === name}
      >
        <Typography variant="h6">
          <EditableText value={state.room?.name} name="name" />
        </Typography>
      </FlexForm>
      <Divider flexItem variant="middle" sx={{ mb: 1 }}>
        <Typography variant="body2" sx={{ position: "relative", top: 10 }}>
          JOIN CODE
        </Typography>
      </Divider>
      {state.room && <JoinCode room={state.room} />}
      <Divider flexItem variant="middle" sx={{ mt: -1.5, mb: 1 }}>
        <Typography variant="body2" sx={{ position: "relative", top: 10 }}>
          {state.room?.players.length} PLAYERS
        </Typography>
      </Divider>
      {state.room?.players?.map((player, i) => (
        <Player key={i} player={player} />
      ))}
      <Divider flexItem sx={{ mt: 0.5 }} />
      <RFlex gap={1}>
        <Button
          onClick={() => {
            state.user?.leaveRoom();
            setIndex(1);
          }}
        >
          <KeyboardArrowLeft />
          Leave
        </Button>
        {state.room?.startGame && (
          <FlexForm
            onSubmit={state.room.startGame}
            checkSync={() => state.game}
          >
            <Button variant="outlined" type="submit">
              Start
              <PlayArrow />
            </Button>
          </FlexForm>
        )}
      </RFlex>
    </Flex>
  );
};

function Player({
  player,
}: {
  player?: NonNullable<Unpacked<AppState>["room"]>["players"][number];
}): JSX.Element {
  return (
    <RFlex gap={1} sx={{ opacity: player?.user?.isConnected ? 1.0 : 0.5 }}>
      {player?.isHost && <Star fontSize="inherit" />}
      <FlexForm
        onSubmit={
          player?.isSelf &&
          (({ username }) => player?.user?.setUsername(username))
        }
        checkSync={({ username }) => player?.user.username === username}
      >
        <EditableText
          value={player?.user?.username ?? "[Your Name]"}
          name="username"
        />
      </FlexForm>
      {!player?.user?.isConnected && (
        <CircularProgress size={12} sx={{ color: "white" }} />
      )}
    </RFlex>
  );
}

function JoinCode({ room }: { room: Unpacked<AppState>["room"] }) {
  return (
    <RFlex>
      <Tooltip title="Click to copy" followCursor>
        <ButtonBase
          sx={{
            bgcolor: "rgba(0,0,0,0.3)",
            borderRadius: 2,
            px: 1,
            py: 0.5,
            color: ({ palette }) => palette.secondary.main,
          }}
          onClick={() => {
            if (room?.joinCode) copy(room?.joinCode);
          }}
        >
          <code>{room?.joinCode}</code>
          <ContentCopy fontSize="inherit" sx={{ ml: 1 }} />
        </ButtonBase>
      </Tooltip>
      {room?.newCode && (
        <Tooltip title="Regenerate Code" followCursor>
          <Refresh action={room.newCode} size="small" sx={{ opacity: 0.5 }} />
        </Tooltip>
      )}
    </RFlex>
  );
}
