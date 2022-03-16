import { Cascade, Resolvable } from "@koreanwglasses/cascade";
import { getEnumerated, getMetadata, getPolicy, joinRights } from ".";
import * as metadata from "./metadata";
import { CLIENT_PARAM } from "./consts";
import { join } from "./lib/join";

type Match = {
  isMatch: boolean;
  remainder: string[];
  pathParams: Record<string, string>;
};

const matchRoute = (route: string[], path: string[]): Match => {
  if (route.length === 0)
    return { isMatch: true, remainder: path, pathParams: {} };
  if (path.length === 0)
    return { isMatch: false, remainder: path, pathParams: {} };

  if (route[0].startsWith(":")) {
    const key = route[0].slice(1);
    const value = path[0];
    const {
      isMatch: match,
      remainder,
      pathParams: params,
    } = matchRoute(route.slice(1), path.slice(1));
    return {
      isMatch: match,
      remainder,
      pathParams: { [key]: value, ...params },
    };
  }

  if (route[0] === path[0]) {
    return matchRoute(route.slice(1), path.slice(1));
  }

  return { isMatch: false, remainder: path, pathParams: {} };
};

// Returns 1 if route0 is more specific than route1
const compareSpecificity = (route0: string[], route1: string[]) => {
  let a = 0;
  let b = 0;
  for (let i = 0; i < route0.length || i < route1.length; i++) {
    a = 3 * a + i < route0.length ? (route0[i].startsWith(":") ? 1 : 2) : 0;
    b = 3 * b + i < route1.length ? (route1[i].startsWith(":") ? 1 : 2) : 0;
  }
  return a - b;
};

// Puts args into an array
const prepArgs = (
  paramMap: Partial<Record<string | typeof CLIENT_PARAM, number>>,

  params: Record<string, string>
) => {
  const args: any[] = [];
  Object.entries(params).forEach(([key, value]) => {
    if (paramMap[key] === undefined)
      throw new Error(`Unknown or unused parameter "${key}"`);

    const i = paramMap[key]!;
    while (args.length < i) args.push(undefined);
    args[i] = value;
  });
  return args;
};

export class Server {
  async resolve(
    client: any,
    base: any,
    path: string[],
    bodyParams: Record<string, any>
  ): Promise<{ handled: boolean; result?: Resolvable<any> }> {
    const match = getEnumerated(base)
      .map((key) => ({
        route:
          getMetadata(base, key).route ??
          (getMetadata(base[key]).route &&
            join(key.toString(), getMetadata(base[key]).route!)) ??
          key.toString(),
        key,
      }))
      .map(({ route, key }) => ({
        // Split and remove empty segments
        route: route.split("/").filter((seg) => seg.length > 0),
        key,
      }))
      .map(({ route, key }) => ({
        route,
        key,
        match: matchRoute(route, path),
      }))
      .sort(
        // Sort to find most specific match
        (a, b) => -compareSpecificity(a.route, b.route)
      )
      .find(
        ({ match }) =>
          // Find first match
          match.isMatch
      );

    if (!match) return { handled: false };

    const {
      key,
      match: { pathParams, remainder },
    } = match;

    // Check policy
    const { read, execute } = joinRights(
      ...(await Cascade.all([
        getPolicy(base, key)(client, base, key),
        getPolicy(base[key])(client, base[key]),
      ]).toPromise())
    );

    if (!read) throw new Error("Missing access");

    if (getMetadata(base[key]).isConstructorQuery) {
      const cons = base[key] as new (...args: any[]) => unknown;
      if (typeof cons !== "function") throw new Error("Not a function");

      // Prepare arguments to query function based on metadata/decorators
      const paramMap = getMetadata(base[key]).params ?? {};
      const args = prepArgs(paramMap, pathParams);

      // Construct
      const result = new cons(...args);
      if (remainder.length > 0) {
        // Continue to resolve if query is not terminal (i.e. in the middle of the path)
        return await this.resolve(client, result, remainder, bodyParams);
      }

      return { handled: true, result };
    }

    if (getMetadata(base, key).isQuery) {
      const query = base[key] as (...args: any[]) => unknown;
      if (typeof query !== "function") throw new Error("Not a function");

      let params = pathParams;
      if (remainder.length === 0) {
        // Include params from body if last part of path
        params = { ...params, ...bodyParams };
      }

      // Prepare arguments to query function based on metadata/decorators
      const paramMap = getMetadata(base, key).params ?? {};
      const args = prepArgs(paramMap, params);

      // Compute query
      let result = Cascade.resolve(query.apply(base, args));
      if (remainder.length > 0) {
        // Continue to resolve if query is not terminal (i.e. in the middle of the path)
        result = result.chain(async (queryResult) => {
          const { handled, result } = await this.resolve(
            client,
            queryResult,
            remainder,
            bodyParams
          );

          if (!handled) {
            // If resolution fails, throw an error
            throw new Error("Not found");
          }

          return result;
        });
      }

      return { handled: true, result };
    }

    // If path terminates at an action, execute action and return first result
    if (getMetadata(base, key).isAction) {
      if (remainder.length > 0) {
        // An action should not appear in the middle of a path
        throw new Error("Invalid path");
      }
      if (!execute) throw new Error("Missing access");

      const action = base[key] as (...args: any[]) => unknown;
      if (typeof action !== "function") throw new Error("Not a function");

      const paramMap = getMetadata(base, key).params ?? {};
      // Ignore path params
      const args = prepArgs(paramMap, bodyParams);

      const result = await Cascade.resolve(
        action.apply(base, args)
      ).toPromise();

      return {
        handled: true,
        result,
      };
    }

    if (remainder.length === 0) {
      // If path terminates at data, return data
      return { handled: true, result: base[key] };
    } else {
      // If path does not terminate, recurse
      return await this.resolve(client, base[key], remainder, bodyParams);
    }
  }
}
