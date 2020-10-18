import { curry } from "https://x.nest.land/ramda@0.27.0/source/index.js";

import { factorizeType } from "https://deno.land/x/functional@v1.0.0/library/factories.js";

/**
 * The `Request` represent a HTTP request.
 * It has two attributes: the first is an object for the response "header" and the second is a typed array named "raw".
 * The `Request` type is mostly interoperable with `Resource`, `File` and `Response`.
 *
 * The `Resource` type implements the following algebras:
 * - [x] Group
 * - [x] Bifunctor
 * - [x] Monad
 *
 * ### Example
 *
 * ```js
 * const request = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]))
 *   .concat(Resource(new Uint8Array([ 70, 71, 72, 73, 74 ]), 3));
 *
 * assert(Request.is(request));
 * ```
 *
 * #### Utilities
 *
 * The `Request` namespace comes with 4 methods for convenience to create an instance of `Request` with a common verb.
 * The methods are curried when necessary. `Object -> Unint8Array -> Response`
 *
 * ```js
 * const container = compose(
 *   lift(Request.post({ ["Content-Type"]: "application/json" })),
 *   readFile
 * )(File.fromPath(`${Deno.cwd()}/hoge`));
 *
 * assert((await container.run()).extract().headers.method === "POST");
 * ```
 *
 * | Method name            | Has 2 arguments |
 * |------------------------|-----------------|
 * | `delete` | `DELETE`    | false           |
 * | `get` | `GET`          | false           |
 * | `post` | `POST`        | true            |
 * | `put` | `PUT`          | true            |
 *
 * ✢ *The capitalized version of the methods were added because `delete` is a TypeScript reserved word.*
 */

export const Request = factorizeType("Request", [ "headers", "raw" ]);

Request.isOrThrow = container => {
  if (Request.is(container)) return container;
  else throw new Error(`Expected a Request but got a "${container[$$type] || typeof container}"`);
};

Request.DELETE = Request.delete = url => Request(
  {
    cache: "default",
    headers: {},
    method: "DELETE",
    mode: "cors",
    url
  },
  new Uint8Array([])
);

Request.GET = Request.get = url => Request(
  {
    cache: "default",
    headers: {},
    method: "GET",
    mode: "cors",
    url
  },
  new Uint8Array([])
);

Request.POST = Request.post = curry(
  (url, buffer) => Request(
    {
      cache: "default",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST",
      mode: "cors",
      url
    },
    buffer.raw
  )
);

Request.PUT = Request.put = curry(
  (url, buffer) => Request(
    {
      cache: "default",
      headers: {
        "Content-Type": "application/json"
      },
      method: "PUT",
      mode: "cors",
      url
    },
    buffer.raw
  )
);

Request.prototype.ap = Request.prototype["fantasy-land/ap"] = function (container) {

  return Request(this.headers, container.raw(this.raw));
};

Request.prototype.bimap = Request.prototype["fantasy-land/bimap"] = function (unaryFunctionA, unaryFunctionB) {

  return Request(unaryFunctionA(this.headers), unaryFunctionB(this.raw));
};

Request.prototype.chain = Request.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.raw);
};

Request.prototype.concat = Request.prototype["fantasy-land/concat"] = function (container) {

  return Request(this.headers, new Uint8Array([ ...this.raw, ...container.raw ]));
};

Request.empty = Request.prototype.empty = Request.prototype["fantasy-land/empty"] = () =>
  Request({}, new Uint8Array([]));

Request.prototype.equals = Request.prototype["fantasy-land/equals"] = function (container) {

  return this.headers.status === container.headers.status
    && this.headers.url === container.headers.url
    && this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => accumulator && accumulator[index] == value ? accumulator : false,
      container.raw
    ));
};

Request.isOrThrow = container => {
  if (Request.is(container)) return container;
  else throw new Error(`Expected a Request but got a "${container[$$type] || typeof container}"`);
};

Request.prototype.lte = Request.prototype["fantasy-land/lte"] = function (container) {

  return this.headers.status === container.headers.status
    && this.headers.url === container.headers.url
    && this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => !accumulator && accumulator[index] > value ? accumulator : true,
      container.raw
    ));
};

Request.prototype.invert = Request.prototype["fantasy-land/invert"] = function () {

  return Request(this.headers, this.raw.reverse());
};

Request.prototype.map = Request.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Request(this.headers, unaryFunction(this.raw));
};

Request.of = Request.prototype.of = Request.prototype["fantasy-land/of"] = raw => Request({}, raw);

export default Request;
