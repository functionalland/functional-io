import { factorizeType } from "https://deno.land/x/functional@v1.3.2/library/factories.js";
import Task from "https://deno.land/x/functional@v1.3.2/library/Task.js";

import { $$type } from "https://deno.land/x/functional@v1.3.2/library/Symbols.js";

/**
 * ## Directory
 *
 * The `Directory` type represents a directory on the file system. It is the only type with the same shape as `URL`.
 * It has only one attributes: the path of the directory.
 * A `Directory` is interoperable with a `URL` or a `File`.
 * It also has interoperability with a `File` through the `FileSystemCollection` type.
 *
 * The `Directory` type implements the following algebras:
 * - [x] Ord
 * - [x] Comonad
 * - [x] Monad
 *
 * ### Example
 *
 * ```js
 * assert(Directory(`${Deno.cwd()}/hoge`).lte(Directory(`${Deno.cwd()}/piyo`)));
 * ```
 */

export const Directory = factorizeType("Directory", [ "path" ]);

Directory.prototype.ap = Directory.prototype["fantasy-land/ap"] = function (container) {

  return Directory.of(container.path(this.path));
};

Directory.prototype.chain = Directory.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.path);
};

Directory.prototype.equals = Directory.prototype["fantasy-land/equals"] = function (container) {

  return this.path === container.path;
}

Directory.prototype.extend = Directory.prototype["fantasy-land/extend"] = function (unaryFunction) {

  return Directory(unaryFunction(this));
};

Directory.prototype.extract = Directory.prototype["fantasy-land/extract"] = function () {

  return this.path;
};

Directory.fromPath = path => Directory(path);

Directory.isOrThrow = container => {
  if (Directory.is(container) || Task.is(container)) return container;
  else throw new Error(`Expected a Directory but got a "${container[$$type] || typeof container}"`);
};

Directory.prototype.lte = Directory.prototype["fantasy-land/equals"] = function (container) {

  return this.path <= container.path;
};

Directory.prototype.map = Directory.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Directory(unaryFunction(this.path));
};

Directory.of = Directory.prototype.of = Directory.prototype["fantasy-land/of"] = path => Directory(path);

export default Directory;
