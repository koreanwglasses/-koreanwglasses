import { KeyboardArrowRight } from "@mui/icons-material";
import { Typography, TextField, Button } from "@mui/material";
import { useContext } from "react";
import { Flex } from "../ui/flex";
import { FlexForm } from "../ui/flex-form";
import { MainContext } from "./main";

export const UserDetails = () => {
  const { state, setIndex } = useContext(MainContext)!;
  return (
    <FlexForm
      onSubmit={({ username }) => state.user?.setUsername(username)}
      checkSync={({ username }) => state.user.username === username}
      onSuccess={() => setIndex(1)}
    >
      <Flex gap={1}>
        <Typography>Enter a name</Typography>
        <TextField
          variant="standard"
          name="username"
          defaultValue={state.user?.username ?? ""}
        />
        <Button type="submit">
          Next <KeyboardArrowRight />
        </Button>
      </Flex>
    </FlexForm>
  );
};
