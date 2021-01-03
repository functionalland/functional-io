import curry from "https://deno.land/x/ramda@v0.27.2/source/curry.js";
import { factorizeType } from "https://deno.land/x/functional@v1.3.3/library/factories.js";
import Task from "https://deno.land/x/functional@v1.3.3/library/Task.js";

import { $$type } from "https://deno.land/x/functional@v1.3.3/library/Symbols.js";

/**
 * ## File
 *
 * The `File` type extends the `Resource` type. It represents a file with a path.
 * It has three attributes: the first is the path of the file, the second is a typed array named "raw" and the last
 * is the Resource ID (`rid`).
 * A `File` is composable and interoperable with a `Resource` or a `Buffer` -- It also has some interoperability with a
 * `Location` through the `FileSystemCollection`.
 *
 * The `File` type implements the following algebras:
 * - [x] Group
 * - [x] Bifunctor
 * - [x] Comonad
 * - [x] Monad
 *
 * ### Example
 *
 * ```js
 * const file = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3)
 *   .concat(File(`${Deno.cwd()}/piyo`, new Uint8Array([ 70, 71, 72, 73, 74 ]), 3));
 *
 * assert(File.is(file));
 * ```
 */

export const File = factorizeType("File", [ "path", "raw", "rid" ]);

File.prototype.ap = File.prototype["fantasy-land/ap"] = function (container) {

  return container.hasOwnProperty("raw")
    ? File(this.path, container.raw(this.raw), this.rid)
    : File(container.path(this.path), this.raw, this.rid);
};

File.prototype.bimap = File.prototype["fantasy-land/bimap"] = function (unaryFunctionA, unaryFunctionB) {

  return File(this.path, unaryFunctionA(this.raw), unaryFunctionB(this.rid));
};

File.prototype.chain = File.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.raw);
};

File.prototype.concat = File.prototype["fantasy-land/concat"] = function (container) {

  return File(this.path, new Uint8Array([ ...this.raw, ...container.raw ]), this.rid);
};

File.empty = File.prototype.empty = File.prototype["fantasy-land/empty"] = () =>
  File("", new Uint8Array([]), 0);

File.prototype.equals = File.prototype["fantasy-land/equals"] = function (container) {

  return this.path === container.path
    && this.rid === container.rid
    && this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => accumulator && accumulator[index] == value ? accumulator : false,
      container.raw
    ));
};

File.prototype.extend = File.prototype["fantasy-land/extend"] = function (unaryFunction) {

  return File(this.path, unaryFunction(this), this.rid);
};

File.prototype.extract = File.prototype["fantasy-land/extract"] = function () {

  return this.raw;
};

File.fromPath = path => File(path, new Uint8Array([]), 0);

File.prototype.invert = File.prototype["fantasy-land/invert"] = function () {

  return File(this.path, this.raw.reverse(), this.rid);
};

File.isOrThrow = container => {
  if (File.is(container) || Task.is(container)) return container;
  else throw new Error(`Expected a File but got a "${container[$$type] || typeof container}"`);
};

File.prototype.lte = File.prototype["fantasy-land/lte"] = function (container) {

  return this.path <= container.path
    && this.rid <= container.rid
    && this.raw.byteLength <= container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => !accumulator && accumulator[index] > value ? accumulator : true,
      container.raw
    ));
};

File.prototype.map = File.prototype["fantasy-land/map"] = function (unaryFunction) {

  return File(this.path, unaryFunction(this.raw), this.rid);
};

File.of = File.prototype.of = File.prototype["fantasy-land/of"] = raw => File("", raw, 0);

export const factorizeFile = curry(File);

export default File;
