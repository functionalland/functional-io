import { assert } from "https://deno.land/std@0.79.0/testing/asserts.ts";
import { serve } from "https://deno.land/std@0.79.0/http/server.ts";
import { fetch } from "./browser_safe.js";

import Either from "https://deno.land/x/functional@v1.3.3/library/Either.js";
import Task from "https://deno.land/x/functional@v1.3.3/library/Task.js";
import Request from "./Request.js";

const startAsyncIterator = async (state, server, callback) => {
  for await (const request of server) {
    if (!state.active) break;
    callback(request);
  }
}

const startSimpleServer = (port, callback) => {
  const state = { active: true };
  const server = serve({ port });

  startAsyncIterator(state, server, callback);

  return server;
};

Deno.test(
  "Integration: fetch -- Success",
  async () => {
    const server = startSimpleServer(
      8000,
      request => request.respond({ body: new Uint8Array([ 65, 66, 67, 68, 69 ]) })
    );

    const containerA = fetch(Request.GET("http://localhost:8000"));

    assert(Task.is(containerA));

    const promise = containerA.run();

    const containerB = await promise;

    assert(Either.Right.is(containerB));

    assert(containerB.extract().raw.length === 5);

    server.close();
  }
);

Deno.test(
  "Integration: fetch -- With body",
  async () => {
    const server = startSimpleServer(
      8000,
      async request => {
        const body = new Uint8Array(request.contentLength);
        await request.body.read(body);
        request.respond({ body })
      }
    );

    const containerA = fetch(
      Request(
        {
          cache: "default",
          headers: {
            "Content-Type": "text/plain"
          },
          method: "POST",
          mode: "cors",
          url: "http://localhost:8000"
        },
        new Uint8Array([ 65, 66, 67, 68, 69 ])
      )
    );

    assert(Task.is(containerA));

    const promise = containerA.run();

    const containerB = await promise;

    assert(Either.Right.is(containerB));

    assert(containerB.extract().raw.length === 5);

    server.close();
  }
);

Deno.test(
  "Integration: fetch -- Success (large)",
  async () => {
    const server = startSimpleServer(
      8000,
      request => request.respond({ body: new Uint8Array(10000).fill(0) })
    );

    const containerA = fetch(Request.GET("http://localhost:8000"));

    assert(Task.is(containerA));

    const promise = containerA.run();

    const containerB = await promise;

    assert(Either.Right.is(containerB));

    assert(containerB.extract().raw.length === 10000);

    server.close();
  }
);

Deno.test(
  "Integration: fetch -- Failure",
  async () => {
    const server = startSimpleServer(
      8000,
      request => request.respond({ status: 404 })
    );

    const containerA = fetch(Request.GET("http://localhost:8000"));

    assert(Task.is(containerA));

    const promise = containerA.run();

    const containerB = await promise;

    assert(Either.Right.is(containerB));

    server.close();
  }
);
