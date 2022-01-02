import { ReportProblem } from "@mui/icons-material";
import { CircularProgress, Collapse, Tooltip } from "@mui/material";
import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Flex, RFlex } from "./flex";

export const FlexFormContext = createContext<{
  submit?(): Promise<void>;
  disabled?: boolean;
}>({});

export const FlexForm = ({
  children,
  onSubmit,
  checkSync,
  onSuccess,
}: React.PropsWithChildren<{
  onSubmit?:
    | ((data: Record<string, any>) => void | Promise<void>)
    | false
    | null;
  syncExpected?: any;
  checkSync?: (data: Record<string, any>) => any;
  onSuccess?: () => void | Promise<void>;
}>) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const form = useRef<HTMLFormElement>(null);
  const getData = useCallback(
    () =>
      Object.fromEntries(
        new FormData(form.current as HTMLFormElement).entries()
      ),
    []
  );

  // Submit callback
  const _lock = useRef(false);
  const submit = async () => {
    if (!onSubmit) return;

    const data = getData();

    form
      .current!.querySelectorAll(":focus")
      .forEach((elem) => (elem as Partial<HTMLInputElement>).blur?.());

    setIsSubmitting(true);
    localData.current = data;

    try {
      await onSubmit(data);
    } catch (e) {
      setLastError(e as Error);
      setIsSubmitting(false);
      _lock.current = false;
    }
  };

  const localData = useRef<Record<string, any>>({});
  useEffect(() => {
    if (checkSync?.(localData.current) && isSubmitting) {
      setLastError(null);
      setIsSubmitting(false);
      _lock.current = false;

      onSuccess?.();
    }
  }, [checkSync]);

  return (
    <Flex
      component="form"
      position="relative"
      ref={form}
      onSubmit={async (e) => {
        e.preventDefault();
        submit();
      }}
    >
      <RFlex>
        <Collapse orientation="horizontal" in={!!lastError}>
          <Tooltip
            title={lastError?.message.split("\n")[0] ?? ""}
            componentsProps={{
              tooltip: { sx: { bgcolor: "rgba(200, 0, 0)" } },
            }}
          >
            <ReportProblem
              fontSize="inherit"
              sx={{
                mr: 0.5,
                transform: "translateY(25%)",
                color: (theme) => theme.palette.error.main,
              }}
            />
          </Tooltip>
        </Collapse>
        <Flex
          sx={{
            opacity: isSubmitting ? 0.5 : 1,
            pointerEvents: isSubmitting ? "none" : "auto",
            transition: "opacity 0.3s",
          }}
        >
          <FlexFormContext.Provider
            value={{
              submit,
              disabled: !onSubmit,
            }}
          >
            {children}
          </FlexFormContext.Provider>
        </Flex>
      </RFlex>
      <Flex
        position="absolute"
        width={1}
        height={1}
        sx={{
          opacity: isSubmitting ? 1 : 0,
          transition: "opacity 0.3s",
          display: isSubmitting ? undefined : "hidden",
          pointerEvents: "none",
        }}
      >
        <CircularProgress />
      </Flex>
    </Flex>
  );
};
