import { useResolve } from "@koreanwglasses/restate-react";
import { Paper, CircularProgress } from "@mui/material";
import { useRouter } from "next/dist/client/router";
import { useEffect } from "react";
import { AppState } from "../resources/app";
import { Flex } from "../components/ui/flex";
import { Layout } from "../components/ui/layout";
import { Main } from "../components/main/main";

const Loader = () => {
  const resolveState = useResolve<AppState>("/api/app/state");

  const router = useRouter();
  useEffect(() => {
    if (resolveState.result?.game) router.push("/game");
  }, [resolveState.result?.game, router]);

  return (
    <Layout>
      <Paper elevation={6}>
        <Flex sx={{ width: 400, minHeight: 200, position: "relative" }}>
          {resolveState.loading && <CircularProgress />}
          {!resolveState.loading && resolveState.result && (
            <Main state={resolveState.result} />
          )}
        </Flex>
      </Paper>
    </Layout>
  );
};

export default Loader;
