import { factorizeType } from "https://deno.land/x/functional@v1.3.2/library/factories.js";
import Task from "https://deno.land/x/functional@v1.3.2/library/Task.js";

import { $$type } from "https://deno.land/x/functional@v1.3.2/library/Symbols.js";

/**
 * ## URL
 *
 * The `URL` type represents an URL; either of a location on the file system or on a remote server.
 * It has only one attributes: the path of the URL.
 * A `URL` is interoperable with a `File` or a `Directory`.
 * It also has interoperability with a `File` or a `Directory` through the `FileSystemCollection` type.
 *
 * The `URL` type implements the following algebras:
 * - [x] Ord
 * - [x] Comonad
 * - [x] Monad
 *
 * ### Example
 *
 * ```js
 * assert(URL(`${Deno.cwd()}/hoge`).lte(URL(`${Deno.cwd()}/piyo`)));
 * ```
 */

export const URL = factorizeType("URL", [ "path" ]);

URL.prototype.ap = URL.prototype["fantasy-land/ap"] = function (container) {

  return URL.of(container.path(this.path));
};

URL.prototype.chain = URL.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.path);
};

URL.prototype.equals = URL.prototype["fantasy-land/equals"] = function (container) {

  return this.path === container.path;
}

URL.prototype.extend = URL.prototype["fantasy-land/extend"] = function (unaryFunction) {

  return URL(unaryFunction(this));
};

URL.prototype.extract = URL.prototype["fantasy-land/extract"] = function () {

  return this.path;
};

URL.fromPath = path => URL(path);

URL.isOrThrow = container => {
  if (URL.is(container) || container.hasOwnProperty("path") || Task.is(container)) return container;
  else throw new Error(`Expected a URL but got a "${container[$$type] || typeof container}"`);
};

URL.prototype.lte = URL.prototype["fantasy-land/equals"] = function (container) {

  return this.path <= container.path;
};

URL.prototype.map = URL.prototype["fantasy-land/map"] = function (unaryFunction) {

  return URL(unaryFunction(this.path));
};

URL.of = URL.prototype.of = URL.prototype["fantasy-land/of"] = path => URL(path);

export default URL;
