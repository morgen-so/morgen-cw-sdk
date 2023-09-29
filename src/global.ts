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
 * Function to re-create the server-side fetch function. This doesn't get sent
 * to the server, but it should do the same things when code is run locally.
 *
 * @return body the body of the HTTP response
 */
export async function fetch(url: string, opts?: Partial<RequestInit> & object) {
  const resp = await global.fetch(url, opts);
  if (resp.status >= 400) {
    throw new Error(resp.statusText + ": " + resp.url);
  }
  return await resp.text();
}

/**
 * Function to re-create the server-side fetchJSON function. This doesn't get
 * sent to the server, but it should do the same things when code is run
 * locally.
 *
 * @return result.status     the status code of the HTTP response
 * @return result.statusText the status code text of the HTTP response
 * @return result.body       the parsed body of the HTTP response
 */
export async function fetchJSON(
  url: string,
  opts?: Partial<RequestInit> & object
) {
  const resp = await global.fetch(url, opts);
  if (resp.status >= 400) {
    throw new Error(
      JSON.stringify({
        status: resp.status,
        text: resp.statusText,
        // TODO: Expect errors in JSON?
        body: await resp.text(),
      })
    );
  }
  return {
    status: resp.status,
    statusText: resp.statusText,
    body: await resp.json(),
  };
}

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
  const resp = await fetchJSON(url, {
    headers: {
      Authorization,
      Accept: "application/json",
      ["Content-Type"]: "application/json",
      ...headers,
    },
    ..._opts,
  });
  return resp;
}

// TODO: Improve this to match remote deployment
export const log = console.log;
