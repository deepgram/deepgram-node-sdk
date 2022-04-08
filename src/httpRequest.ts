import { ReadStream } from "fs";
import fetch from "cross-fetch";
import { userAgent } from "./userAgent";

const _requestOptions = (
  api_key: string,
  apiUrl: string,
  path: string,
  method: string,
  payload?: string | Buffer | ReadStream,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override_options?: any
): RequestInfo => {
  const additionalHeaders: { [name: string]: string | number } = {};
  if (payload && !(payload instanceof ReadStream)) {
    additionalHeaders["Content-Length"] = Buffer.byteLength(payload);
  }

  const options = {
    host: apiUrl,
    path,
    method,
    headers: {
      "User-Agent": userAgent(),
      "Content-Type": "application/json",
      Authorization: `token ${api_key}`,
      ...additionalHeaders,
    },
  };

  let headers = options.headers;
  if (override_options && override_options.headers) {
    headers = { ...headers, ...override_options.headers };
  }

  return { ...options, ...override_options, ...{ headers } };
};

export async function _request<T>(
  method: string,
  api_key: string,
  apiUrl: string,
  path: string,
  payload?: string | Buffer | ReadStream,
  // eslint-disable-next-line @typescript-eslint/ban-types
  options?: Object
): Promise<T> {

  const requestOptions = _requestOptions(
    api_key,
    apiUrl,
    path,
    method,
    payload,
    options
  );

  try {
    const httpResponse = await fetch(requestOptions);

    if (httpResponse.ok) {
      const response = await httpResponse.json();
      return response;
    } else {
      return Promise.reject(`DG: ${httpResponse.statusText}`);
    }

  } catch (err) {
    return Promise.reject(`DG: ${err}`);
  }
}
