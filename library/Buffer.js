import { factorizeType } from "https://deno.land/x/functional@v1.0.0/library/factories.js";
import { $$type } from "https://deno.land/x/functional@v1.0.0/library/Symbols.js";
import Task from "https://deno.land/x/functional@v1.0.0/library/Task.js";

export const Buffer = factorizeType("Buffer", [ "raw" ]);

/**
 * The `Buffer` is the most basic type; it only has one attribute which is a typed array named "raw".
 * Any type that share the raw attribute is composable with `Buffer` (and each other) and interoperable.
 *
 * The `Buffer` type implements the following algebras:
 * - [x] Group
 * - [x] Comonad
 * - [x] Monad
 *
 * ### Example
 *
 * ```js
 * const buffer = Buffer.fromString("Hoge").concat(Buffer.fromString("Fuga"));
 *
 * assert(Buffer.is(buffer));
 * ```
 */

Buffer.prototype.ap = Buffer.prototype["fantasy-land/ap"] = function (container) {

  return Buffer.of(container.raw(this.raw));
};

Buffer.empty = Buffer.prototype.empty = Buffer.prototype["fantasy-land/empty"] = () =>
  Buffer(new Uint8Array([]));

Buffer.fromString = text => Buffer(new TextEncoder().encode(text));

Buffer.isOrThrow = container => {
  if (Buffer.is(container) || container.hasOwnProperty("raw") || Task.is(container)) return container;
  else throw new Error(`Expected a Buffer but got a "${container[$$type] || typeof container}"`);
};

Buffer.prototype.chain = Buffer.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.raw);
};

Buffer.prototype.concat = Buffer.prototype["fantasy-land/concat"] = function (container) {

  return Buffer(new Uint8Array([ ...this.raw, ...container.raw ]));
};

Buffer.empty = Buffer.prototype.empty = Buffer.prototype["fantasy-land/empty"] = function () {

  return Buffer(new Uint8Array([]));
};

Buffer.prototype.equals = Buffer.prototype["fantasy-land/equals"] = function (container) {

  return this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => accumulator && accumulator[index] == value ? accumulator : false,
      container.raw
    ));
};

Buffer.prototype.extend = Buffer.prototype["fantasy-land/extend"] = function (unaryFunction) {

  return Buffer(unaryFunction(this));
};

Buffer.prototype.extract = Buffer.prototype["fantasy-land/extract"] = function () {

  return this.raw;
};

Buffer.prototype.lte = Buffer.prototype["fantasy-land/equals"] = function (container) {

  return this.raw.byteLength <= container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => !accumulator && accumulator[index] > value ? accumulator : true,
      container.raw
    ));
};

Buffer.prototype.invert = Buffer.prototype["fantasy-land/invert"] = function () {

  return Buffer(this.raw.reverse());
};

Buffer.prototype.map = Buffer.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Buffer(unaryFunction(this.raw));
};

Buffer.of = Buffer.prototype.of = Buffer.prototype["fantasy-land/of"] = buffer => Buffer(buffer);

export default Buffer;
