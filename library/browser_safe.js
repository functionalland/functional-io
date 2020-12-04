import { apply, lift } from "https://x.nest.land/ramda@0.27.0/source/index.js";

import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

import Request from "./Request.js";
import Response from "./Response.js";

const coerceReadableStreamToUint8Array = async readableStream => {
  let _array = new Uint8Array([]);

  return readableStream.read().then(function processBody({ done, value }) {
    if (!done) {
      _array = new Uint8Array([ ..._array, ...value ]);

      return readableStream.read().then(processBody);
    } else return _array;
  });
}

// fetch :: Request -> Task e Response
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
          ? new TextDecoder().decode(request.raw)
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