import apply from "https://deno.land/x/ramda@v0.27.2/source/apply.js";
import lift from "https://deno.land/x/ramda@v0.27.2/source/lift.js";

import Task from "https://deno.land/x/functional@v1.3.2/library/Task.js";
import { decodeRaw } from "https://deno.land/x/functional@v1.3.2/library/utilities.js";

import Request from "./Request.js";
import Response from "./Response.js";

/**
 * ## Browser safe
 */

const coerceReadableStreamToUint8Array = async readableStream => {
  let _array = new Uint8Array([]);

  return readableStream.read().then(function processBody({ done, value }) {
    if (!done) {
      _array = new Uint8Array([ ..._array, ...value ]);

      return readableStream.read().then(processBody);
    } else return _array;
  });
}

/**
 * ### `pureFetch`
 * `Request -> Task e Response`
 *
 * Fetches a resource on a local/remote server.
 *
 * ```js
 * import { fetch } from "https://deno.land/x/functional_io@v1.1.0/library/browser-safe.js";
 *
 * const containerA = fetch(Request.GET("http://localhost:8000"));
 *
 * assert(Task.is(containerA));
 *
 * const containerB = await container.run().extract();
 *
 * assert(Response.Success.is(containerB));
 * ```
 */
const pureFetch = request => Request.isOrThrow(request)
  && Task.wrap(_ =>
    fetch(
      request.headers.url,
      {
        ...request.headers,
        body: (
          request.headers["Content-Type"] === "application/javascript"
          || /^application\/[a-z-\.]*\+*json$/.test(request.headers["Content-Type"])
          || /^text\//.test(request.headers["Content-Type"])
        )
          ? decodeRaw(request.raw)
          : request.raw
      }
    )
  )
    .chain(
      ({ body, headers, status }) =>
      apply(
        lift(status < 300 ? Response.Success : Response.Failure),
        [
          Task.of({ ...headers, status }),
          Task.wrap(_ => coerceReadableStreamToUint8Array(body.getReader()))
        ]
      )
    );

export { pureFetch as fetch };