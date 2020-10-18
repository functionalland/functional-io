import { factorizeType } from "https://deno.land/x/functional@v1.0.0/library/factories.js";

import { $$value } from "https://deno.land/x/functional@v1.0.0/library/Symbols.js";

/**
 * The `FileSystemCollection` is represents a collection of `Location`, namely of `Directory` and `File`. This of it
 * as an Array for those types.
 *
 * The `FileSystemCollection` type implements the following algebras:
 * - [x] Group
 * - [x] Comonad
 * - [x] Monad
 * - [x] Traversable
 *
 * ### Example
 *
 * ```js
 * const containerA = Maybe.Just(42).map(x => x + 2);
 * const containerB = Maybe.Nothing.map(x => x + 2);
 *
 * assert(Maybe.Just.is(containerA));
 * assert(containerA.extract() === 44);
 * assert(Maybe.Nothing.is(containerB));
 * ```
 */

export const FileSystemCollection = factorizeType("FileSystemCollection", [ $$value ]);

FileSystemCollection.prototype.ap = FileSystemCollection.prototype["fantasy-land/ap"] = function (container) {

  return FileSystemCollection(container[$$value](this[$$value]));
};

FileSystemCollection.prototype.concat = FileSystemCollection.prototype["fantasy-land/concat"] = function (container) {

  return FileSystemCollection([ ...this[$$value], ...container[$$value] ]);
};

FileSystemCollection.empty = FileSystemCollection.prototype.empty = FileSystemCollection.prototype["fantasy-land/empty"] = () =>
  FileSystemCollection([]);

FileSystemCollection.prototype.filter = FileSystemCollection.prototype["fantasy-land/filter"] = function (predicate) {

  return FileSystemCollection(this[$$value].filter(predicate));
};

FileSystemCollection.prototype.invert = FileSystemCollection.prototype["fantasy-land/invert"] = function () {

  return FileSystemCollection(this[$$value].reverse());
};

FileSystemCollection.prototype.map = FileSystemCollection.prototype["fantasy-land/map"] = function (unaryFunction) {

  return FileSystemCollection(this[$$value].map(unaryFunction));
};

FileSystemCollection.prototype.reduce = FileSystemCollection.prototype["fantasy-land/reduce"] = function (
  binaryFunction,
  accumulator
) {

  return FileSystemCollection(this[$$value].reduce((a, v) => binaryFunction(a, v), accumulator));
};

FileSystemCollection.prototype.sequence = function (of) {

  return this.traverse(of(new Uint8Array([])), x => x);
};

FileSystemCollection.prototype.traverse = FileSystemCollection.prototype["fantasy-land/traverse"] = function (
  of,
  unaryFunction
) {

  return this.reduce(
    (accumulator, value) =>
      unaryFunction(value)
        .ap(accumulator.map(accumulator => value => new Uint8Array([ ...accumulator, ...value ]))),
    of()
  );
};

export default FileSystemCollection;
