import curry from "https://deno.land/x/ramda@v0.27.2/source/curry.js";

import { factorizeSumType } from "https://deno.land/x/functional@v1.3.2/library/factories.js";

/**
 * ## Response
 *
 * The `Response` represent a HTTP response.
 * It has two attributes: the first is an object for the response "header" and the second is a typed array named "raw".
 * The `Response` type is mostly interoperable with `Resource`, `File` and `Request`.
 *
 * The `Resource` type implements the following algebras:
 * - [x] Alternative
 * - [x] Group
 * - [x] Bifunctor
 * - [x] Monad
 *
 * ### Example
 *
 * ```js
 * const response = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]))
 *   .concat(Resource(new Uint8Array([ 70, 71, 72, 73, 74 ]), 3));
 *
 * assert(Response.is(response));
 * ```
 *
 * #### Utilities
 *
 * The `Response` namespace comes with 38 methods for convenience to create an instance of `Response` with a common
 * status.
 * The methods are curried: `Object -> Uint8Array -> Response`
 *
 * ```js
 * const container = compose(
 *   lift(Response.OK({ ["Content-Type"]: "application/json" })),
 *   readFile
 * )(File.fromPath(`${Deno.cwd()}/hoge`));
 *
 * assert((await container.run()).extract().headers.status === 200);
 * ```
 *
 * | Method name           | Status |
 * |-----------------------|--------|
 * | `OK`                  | 200    |
 * | `Created`             | 201    |
 * | `Accepted`            | 202    |
 * | `NoContent`           | 204    |
 * | `MultipleChoice`      | 300    |
 * | `MovePermanently`     | 301    |
 * | `Found`               | 302    |
 * | `NotModified`         | 304    |
 * | `TemporaryRedirect`   | 307    |
 * | `PermanentRedirect`   | 308    |
 * | `BadRequest`          | 400    |
 * | `Unauthorized`        | 401    |
 * | `Forbidden`           | 403    |
 * | `NotFound`            | 404    |
 * | `MethodNotAllowed`    | 405    |
 * | `NotAcceptable`       | 406    |
 * | `RequestTimeout`      | 408    |
 * | `Conflict`            | 409    |
 * | `Gone`                | 410    |
 * | `ImATeapot`           | 418    |
 * | `InternalServerError` | 500    |
 * | `NotImplemented`      | 501    |
 * | `BadGateway`          | 502    |
 * | `ServiceUnavailable`  | 503    |
 * | `GatewayTimeout`      | 504    |
 * | `PermissionDenied`    | 550    |
 */

export const Response = factorizeSumType(
  "Response",
  {
    Failure: [ "headers", "raw" ],
    Success: [ "headers", "raw" ]
  }
);

Response.OK = curry((headers, raw) => Response.Success({ ...headers, status: 200 }, raw));
Response.Created = curry((headers, raw) => Response.Success({ ...headers, status: 201 }, raw));
Response.Accepted = curry((headers, raw) => Response.Success({ ...headers, status: 202 }, raw));
Response.NoContent = curry((headers, raw) => Response.Success({ ...headers, status: 204 }, raw));
Response.MultipleChoice = curry((headers, error) => Response.Failure({ ...headers, status: 300 }, error));
Response.MovePermanently = curry((headers, error) => Response.Failure({ ...headers, status: 301 }, error));
Response.Found = curry((headers, error) => Response.Failure({ ...headers, status: 302 }, error));
Response.NotModified = curry((headers, error) => Response.Failure({ ...headers, status: 304 }, error));
Response.TemporaryRedirect = curry((headers, error) => Response.Failure({ ...headers, status: 307 }, error));
Response.PermanentRedirect = curry((headers, error) => Response.Failure({ ...headers, status: 308 }, error));
Response.BadRequest = curry((headers, error) => Response.Failure({ ...headers, status: 400 }, error));
Response.Unauthorized = curry((headers, error) => Response.Failure({ ...headers, status: 401 }, error));
Response.Forbidden = curry((headers, error) => Response.Failure({ ...headers, status: 403 }, error));
Response.NotFound = curry((headers, error) => Response.Failure({ ...headers, status: 404 }, error));
Response.MethodNotAllowed = curry((headers, error) => Response.Failure({ ...headers, status: 405 }, error));
Response.NotAcceptable = curry((headers, error) => Response.Failure({ ...headers, status: 406 }, error));
Response.RequestTimeout = curry((headers, error) => Response.Failure({ ...headers, status: 408 }, error));
Response.Conflict = curry((headers, error) => Response.Failure({ ...headers, status: 409 }, error));
Response.Gone = curry((headers, error) => Response.Failure({ ...headers, status: 410 }, error));
Response.ImATeapot = curry((headers, error) => Response.Failure({ ...headers, status: 418 }, error));
Response.InternalServerError = curry((headers, error) => Response.Failure({ ...headers, status: 500 }, error));
Response.NotImplemented = curry((headers, error) => Response.Failure({ ...headers, status: 501 }, error));
Response.BadGateway = curry((headers, error) => Response.Failure({ ...headers, status: 502 }, error));
Response.ServiceUnavailable = curry((headers, error) => Response.Failure({ ...headers, status: 503 }, error));
Response.GatewayTimeout = curry((headers, error) => Response.Failure({ ...headers, status: 504 }, error));
Response.PermissionDenied = curry((headers, error) => Response.Failure({ ...headers, status: 550 }, error));

Response.prototype.alt = Response.prototype["fantasy-land/alt"] = function (container) {

  return this.fold({
    Failure: _ => container,
    Success: _ => this
  });
};

Response.prototype.ap = Response.prototype["fantasy-land/ap"] = function (container) {

  return this.fold({
    Failure: _ => this,
    Success: _ =>
      Response.Success(
        this.headers,
        container.raw(this.raw)
      )
  });
};

Response.prototype.bimap = Response.prototype["fantasy-land/bimap"] = function (unaryFunctionA, unaryFunctionB) {

  return this.fold({
    Failure: _ => this,
    Success: _ =>
      Response.Success(
        unaryFunctionA(this.headers),
        unaryFunctionB(this.raw)
      )
  });
};

Response.prototype.chain = Response.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return this.fold({
    Failure: _ => this,
    Success: _ => unaryFunction(this.raw)
  });
};

Response.prototype.concat = Response.prototype["fantasy-land/concat"] = function (container) {

  return this.fold({
    Failure: _ => this,
    Success: _ =>
      Response.Success(
        this.headers,
        new Uint8Array([ ...this.raw, ...container.raw ])
      )
  });
};

Response.empty = Response.prototype.empty = Response.prototype["fantasy-land/empty"] = () =>
  Response.Success({}, new Uint8Array([]));

Response.prototype.equals = Response.prototype["fantasy-land/equals"] = function (container) {

  return this.headers.status === container.headers.status
    && this.headers.url === container.headers.url
    && this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => accumulator && accumulator[index] == value ? accumulator : false,
      container.raw
    ));
};

Response.isOrThrow = container => {
  if (Response.is(container)) return container;
  else throw new Error(`Expected a Response but got a "${container[$$type] || typeof container}"`);
};

Response.prototype.lte = Response.prototype["fantasy-land/lte"] = function (container) {

  return this.headers.status === container.headers.status
    && this.headers.url === container.headers.url
    && this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => !accumulator && accumulator[index] > value ? accumulator : true,
      container.raw
    ));
};

Response.prototype.invert = Response.prototype["fantasy-land/invert"] = function () {

  return this.fold({
    Failure: _ => this,
    Success: _ => Response.Success(this.headers, this.raw.reverse())
  });
};

Response.prototype.map = Response.prototype["fantasy-land/map"] = function (unaryFunction) {

  return this.fold({
    Failure: _ => this,
    Success: _ =>
      Response.Success(
        this.headers,
        unaryFunction(this.raw)
      )
  });
};

Response.of = Response.prototype.of = Response.prototype["fantasy-land/of"] = raw => Response.Success({}, raw);

Response.zero = Response.prototype.zero = Response.prototype["fantasy-land/zero"] = () =>
  Response.Failure({}, new Uint8Array([]));

export default Response;
