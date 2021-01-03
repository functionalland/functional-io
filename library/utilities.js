import {
  __,
  ap,
  compose,
  flip,
  map,
  prop,
  reduce,
  slice
} from "https://deno.land/x/ramda@v0.27.2/mod.ts";

import Pair from "https://deno.land/x/functional@v1.3.3/library/Pair.js";
import { decodeRaw, encodeText } from "https://deno.land/x/functional@v1.3.3/library/utilities.js";

const CHARACTER_CODE_CL = "\r".charCodeAt(0);
const CHARACTER_CODE_RF = "\n".charCodeAt(0);

/**
 * ## Utilities
 */

/**
 * ### `findCLRFIndex`
 * `Uint8Array -> Number`
 *
 * This function takes a `Uint8Array` and, returns the index of the last character of the first CLRF sequence
 * encountered.
 *
 * ```js
 * import { findCLRFIndex } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";
 *
 * assertEquals(findCLRFIndex(new Uint8Array([ 104, 111, 103, 101, 13, 10 ])), 6);
 * ```
 */
export const findCLRFIndex = compose(
  prop("second"),
  reduce(
    ({ first: index, second: cursor }, characterCode) =>
      index === -1 && Pair(index, cursor)
      || (
        characterCode === CHARACTER_CODE_CL && cursor === -1
          ? Pair(index + 1, index)
          : characterCode === CHARACTER_CODE_RF && cursor !== -1
          ? Pair(-1, index + 1)
          : Pair(index + 1, -1)
      ),
    Pair(0, -1)
  )
);

/**
 * ### `discardFirstLine`
 * `Uint8Array -> Uint8Array`
 *
 * This function takes a `Uint8Array` and, returns the typed array minus the first line separated by CLRF.
 *
 * ```js
 * import { discardFirstLine } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";
 *
 * assertEquals(
 *   discardFirstLine(new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])),
 *   new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
 * );
 * ```
 */
export const discardFirstLine = ap(flip(slice(__, Infinity)), findCLRFIndex);

/**
 * ### `discardNCharacter`
 * `Number -> Uint8Array -> Uint8Array`
 *
 * This function takes a Number, a `Uint8Array` and, returns the typed array minus the specified amount of character
 * starting from the left side.
 *
 * ```js
 * import { discardNCharacter } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";
 *
 * assertEquals(
 *   discardNCharacter(1, new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
 *   new Uint8Array([ 111, 103, 101, 13, 10 ])
 * );
 * ```
 */
export const discardNCharacter = slice(__, Infinity);

/**
 * ### `getFirstLine`
 * `Uint8Array -> Uint8Array`
 *
 * This function takes a `Uint8Array` and, returns the first line separated by a CLRF inclusively.
 *
 * ```js
 * import { getFirstLine } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";
 *
 * assertEquals(
 *   getFirstLine(new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])),
 *   new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
 * );
 * ```
 */
export const getFirstLine = ap(flip(slice(0)), findCLRFIndex);

/**
 * ### `joinCLRF`
 * `Uint8Array[] -> Uint8Array`
 *
 * This function takes a list of `Uint8Array` and, returns a `Uint8Array` of the list joined with CLRF sequence; the
 * function is analogous to `Array#join`.
 *
 * ```js
 * import { joinCLRF } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";
 *
 * assertEquals(
 *   joinCLRF(
 *     [
 *       new Uint8Array([ 104, 111, 103, 101 ]),
 *       new Uint8Array([ 104, 111, 103, 101 ])
 *     ]
 *   ),
 *   new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])
 * );
 * ```
 */
export const joinCLRF = reduce(
  (accumulator, _buffer) => accumulator.byteLength > 0
    ? new Uint8Array([ ...accumulator, ..._buffer, CHARACTER_CODE_CL, CHARACTER_CODE_RF ])
    : new Uint8Array([ ..._buffer, CHARACTER_CODE_CL, CHARACTER_CODE_RF ]),
  new Uint8Array([])
);

/**
 * ### `splitCLRF`
 * `Uint8Array -> Uint8Array[]`
 *
 * This function takes a `Uint8Array` and, returns a list of `Uint8Array` of subarray split at the CLRF sequence; the
 * function is analogous to `String#split`.
 *
 * ```js
 * import { splitCLRF } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";
 *
 * assertEquals(
 *   splitCLRF(new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])),
 *   [
 *     new Uint8Array([ 104, 111, 103, 101, 13, 10 ]),
 *     new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
 *   ]
 * );
 * ```
 */
export const splitCLRF = characterCodeList => {
  const accumulator = [];
  let remainingCharacterCodeList = characterCodeList;

  while (true) {
    if (remainingCharacterCodeList.length === 0) break;
    const index = findCLRFIndex(remainingCharacterCodeList);
    accumulator.push(
      remainingCharacterCodeList.slice(0, index === -1 ? remainingCharacterCodeList.length : index)
    );
    if (index === -1) break;
    remainingCharacterCodeList = remainingCharacterCodeList.slice(index, remainingCharacterCodeList.length);
  }

  return accumulator;
};

// mapBuffer :: Buffer -> (String -> String) -> Buffer
export const mapBuffer = unaryFunction => map(compose(encodeText, unaryFunction, decodeRaw));

/**
 * ### `trimCRLF`
 * `Uint8Array -> Uint8Array`
 *
 * This function takes a `Uint8Array` and, returns a typed array minus CRLF at the beginning and at the end;
 * the function is analogous to `String#trim`.
 *
 * ```js
 * import { trimCRLF } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";
 *
 * assertEquals(
 *   trimCRLF(new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
 *   new Uint8Array([ 104, 111, 103, 101 ])
 * );
 * ```
 */
export const trimCRLF = characterCodeList => {
  let remainingCharacterCodeList = characterCodeList;

  while (true) {
    if (remainingCharacterCodeList[0] === CHARACTER_CODE_CL && remainingCharacterCodeList[1] === CHARACTER_CODE_RF)
      remainingCharacterCodeList = remainingCharacterCodeList.slice(2, Infinity);
    else break;
  }

  while (true) {
    if (
      remainingCharacterCodeList[remainingCharacterCodeList.length - 2] === CHARACTER_CODE_CL
      && remainingCharacterCodeList[remainingCharacterCodeList.length - 1] === CHARACTER_CODE_RF
    ) remainingCharacterCodeList = remainingCharacterCodeList.slice(0, remainingCharacterCodeList.length - 2);
    else break;
  }

  return remainingCharacterCodeList;
};

export const coerceAsReader = resource => {

  return {
    read(_array) {
      if (resource.hasOwnProperty("rid")) return Deno.read(resource.rid, _array);

      let index = 0;

      for (; index < _array.length; index++) {
        if (resource.raw.length > index) {
          _array[index] = resource.raw[index];
          resource.raw[index] = 0;
        }
      }

      return Promise.resolve(index);
    },
    ...resource
  };
};

export const coerceAsWriter = resource => {

  return {
    write(_array) {
      if (resource.hasOwnProperty("rid")) return Deno.write(resource.rid, _array);

      resource.raw = new Uint8Array([ ...resource.raw, ..._array ]);

      return Promise.resolve(_array.length);
    },
    ...resource
  };
};

/**
 * ### `factorizeUint8Array`
 * `Number|Array|Uint8Array -> Uint8Array
 *
 * This function factorize a Uint8Array given an argument.
 */
export const factorizeUint8Array = x => new Uint8Array(x);
