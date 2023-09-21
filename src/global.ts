const { MORGEN_API_KEY, MORGEN_ACCESS_TOKEN } = process.env;

/**
 * The JWT access token used to make morgen requests. This is configured
 * locally via the env var `MORGEN_ACCESS_TOKEN`. On the server, `global.TOKEN`
 * is populated at runtime.
 */
global.TOKEN = `"${MORGEN_ACCESS_TOKEN}"`;
/**
 * The API key used to make morgen requests. This is configured locally via the
 * env var `MORGEN_API_TOKEN`. On the server, this will not be set.
 */
global.API_KEY = MORGEN_API_KEY;

/**
 * Make a request to Morgen APIs, using the configured MORGEN_API_KEY or
 * MORGEN_ACCESS_TOKEN.
 */
export async function fetchMorgen(
  url: string,
  opts?: Partial<RequestInit> & object
) {
  const { headers, ..._opts } = opts || {};
  const Authorization = global.API_KEY
    ? `ApiKey ${global.API_KEY}`
    : `Bearer ${JSON.parse(global.TOKEN)}`;
  const resp = await fetch(url, {
    headers: {
      Authorization,
      Accept: "application/json",
      ["Content-Type"]: "application/json",
      ...headers,
    },
    ..._opts,
  });
  // Work-around for local fetch returning Response, with .json()
  if (typeof resp.json === "function") {
    if (resp.status >= 400) {
      throw new Error(resp.statusText + ": " + resp.url);
    }
    return await resp.json();
  } else {
    return JSON.parse(resp as unknown as string) as any;
  }
}

// TODO: Improve this to match remote deployment
export const log = console.log;
