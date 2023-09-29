import type { ApiRequestOptions } from "./ApiRequestOptions";
import type { OpenAPIConfig } from "./OpenAPI";
import { CancelablePromise } from "./CancelablePromise";
import { fetchJSON, log } from "../../global";

/**
 * Request method
 * @param config The OpenAPI configuration object
 * @param options The request options from the service
 * @returns Promise<T>
 * @throws ApiError
 */
export function request<T>(
  config: OpenAPIConfig,
  options: ApiRequestOptions
): CancelablePromise<T> {
  return new CancelablePromise(
    async (
      resolve: (successBody: T) => unknown,
      reject: (e: Error) => void
    ) => {
      const { url, ...rest } = options || { headers: {} };
      let queryString = "";

      Object.keys(options?.query || {}).forEach((k) => {
        if (!options.query[k]) return;
        queryString = queryString + "&" + k + "=" + options.query[k];
      });

      const headers = rest.headers || {};
      try {
        const resp = await fetchJSON(config.BASE + url + "?" + queryString, {
          ...rest,
          headers: {
            ...headers,
            ...config.HEADERS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(options.body),
        });
        resolve(resp.body);
      } catch (e) {
        reject(e);
      }
    }
  );
}
