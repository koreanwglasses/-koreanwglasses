import { ModeEdit } from "@mui/icons-material";
import { alpha } from "@mui/system";
import { useContext, useEffect, useRef, useState } from "react";
import { RFlex } from "./flex";
import { FlexFormContext } from "./flex-form";
import { Input, Span } from "./styled";

export const EditableText = ({
  value: value = "",
  name,
}: {
  value?: string;
  name?: string;
}) => {
  const { submit, disabled } = useContext(FlexFormContext);
  const [localValue, setLocalValue] = useState(value);

  const lastValue = useRef(value);
  useEffect(() => {
    if (value !== lastValue.current) {
      setLocalValue(value);
    }
    lastValue.current = value;
  }, [value]);

  return (
    <RFlex
      position="relative"
      sx={
        disabled
          ? {}
          : {
              "&:hover #icon": {
                color: ({ palette }) => alpha(palette.text.primary, 0.3),
              },
              "&:focus-within #icon": {
                color: ({ palette }) => alpha(palette.primary.main, 1),
              },
            }
      }
    >
      <Span sx={{ pointerEvents: "none", opacity: 0 }}>{localValue}</Span>
      <Input
        name={name}
        value={localValue}
        onChange={(e) => setLocalValue(e.currentTarget.value)}
        disabled={disabled}
        sx={{
          font: "inherit",
          color: "inherit",

          textAlign: "center",
          bgcolor: "transparent",
          border: "none",
          borderBottom: 1.5,
          borderBottomColor: ({ palette }) => alpha(palette.text.primary, 0),

          transition: "border 0.3s",

          position: "absolute",
          width: "100%",

          boxSizing: "content-box",

          ":hover": disabled
            ? {}
            : {
                borderBottomColor: ({ palette }) =>
                  alpha(palette.text.primary, 0.3),
              },
          ":focus": disabled
            ? {}
            : {
                outline: "none",
                borderBottomColor: ({ palette }) =>
                  alpha(palette.primary.main, 1),
              },
        }}
        onBlur={submit}
      />
      <ModeEdit
        id="icon"
        fontSize="inherit"
        sx={{
          position: "absolute",
          right: 0,
          color: ({ palette }) => alpha(palette.text.primary, 0.0),
          transform: "translateX(115%)",
          transition: "color 0.3s",
          pointerEvents: "none",
        }}
      />
    </RFlex>
  );
};
