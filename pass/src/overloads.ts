import { action_1, policy_1 } from "./decorators";
import { action_0, policy_0 } from "./metadata";

export const policy = ((
  ...args: Parameters<typeof policy_0> | Parameters<typeof policy_1>
) => {
  if (args.length === 1) return policy_1(...args);
  else return policy_0(...args);
}) as typeof policy_0 & typeof policy_1;

export const action = ((
  ...args: Parameters<typeof action_0> | Parameters<typeof action_1>
) => {
  if (args.length == 2) return action_1(...args);
  else return action_0(...args);
}) as typeof action_0 & typeof action_1;
