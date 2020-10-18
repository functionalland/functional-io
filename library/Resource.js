import { factorizeType } from "https://deno.land/x/functional@v1.0.0/library/factories.js";
import Task from "https://deno.land/x/functional@v1.0.0/library/Task.js";

import { $$type } from "https://deno.land/x/functional@v1.0.0/library/Symbols.js";

/**
 * The `Resource` type extends the `Buffer` type. It represents a system resource with a handle, eg: STDOUT, STDIN or a
 * file. It has two attributes: the first is a typed array named "raw" and the second is the Resource ID (`rid`).
 * Any type that share the `Resource` attributes is composable and interoperable.
 *
 * The `Resource` type implements the following algebras:
 * - [x] Group
 * - [x] Bifunctor
 * - [x] Comonad
 * - [x] Monad
 *
 * ### Example
 *
 * ```js
 * const resource = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3)
 *   .concat(Resource(new Uint8Array([ 70, 71, 72, 73, 74 ]), 3));
 *
 * assert(Resource.is(resource));
 * ```
 */

export const Resource = factorizeType("Resource", [ "raw", "rid" ]);

Resource.prototype.ap = Resource.prototype["fantasy-land/ap"] = function (container) {

  return Resource(container.raw(this.raw), this.rid);
};

Resource.prototype.bimap = Resource.prototype["fantasy-land/bimap"] = function (unaryFunctionA, unaryFunctionB) {

  return Resource(unaryFunctionA(this.raw), unaryFunctionB(this.rid));
};

Resource.prototype.chain = Resource.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.raw);
};

Resource.prototype.concat = Resource.prototype["fantasy-land/concat"] = function (container) {

  return Resource(
    new Uint8Array([ ...this.raw, ...container.raw ]),
    this.rid
  );
};

Resource.empty = Resource.prototype.empty = Resource.prototype["fantasy-land/empty"] = () =>
  Resource(new Uint8Array([]), 0);

Resource.prototype.equals = Resource.prototype["fantasy-land/equals"] = function (container) {

  return this.rid === container.rid
    && this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => accumulator && accumulator[index] == value ? accumulator : false,
      container.raw
    ));
};

Resource.prototype.extend = Resource.prototype["fantasy-land/extend"] = function (unaryFunction) {

  return Resource(unaryFunction(this), this.rid);
};

Resource.prototype.extract = Resource.prototype["fantasy-land/extract"] = function () {

  return this.raw;
};

Resource.isOrThrow = container => {
  if (
    Resource.is(container)
    || container.hasOwnProperty("rid") && container.hasOwnProperty("raw")
    || Task.is(container)
  ) return container;
  else throw new Error(`Expected a Resource but got a "${container[$$type] || typeof container}"`);
};

Resource.prototype.lte = Resource.prototype["fantasy-land/lte"] = function (container) {

  return this.rid === container.rid
    && this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => !accumulator && accumulator[index] > value ? accumulator : true,
      container.raw
    ));
};

Resource.prototype.invert = Resource.prototype["fantasy-land/invert"] = function () {

  return Resource(this.raw.reverse(), this.rid);
};

Resource.prototype.map = Resource.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Resource(unaryFunction(this.raw), this.rid);
};

Resource.of = Resource.prototype.of = Resource.prototype["fantasy-land/of"] = raw => Resource(raw, 0);

export default Resource;
