import {
  __,
  always,
  ap,
  compose,
  flip,
  gte,
  ifElse,
  map,
  prop,
  reduce,
  slice,
  subtract,
} from "https://x.nest.land/ramda@0.27.0/source/index.js";

import Pair from "https://deno.land/x/functional@v1.2.1/library/Pair.js";

const CHARACTER_CODE_CL = "\r".charCodeAt(0);
const CHARACTER_CODE_RF = "\n".charCodeAt(0);

const $$decoder = new TextDecoder();
const $$encoder = new TextEncoder();

export const decodeRaw = $$decoder.decode.bind($$decoder);
export const encodeText = $$encoder.encode.bind($$encoder);

// findCLRFIndex :: Uint8Array -> Number
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

export const discardFirstLine = ap(flip(slice(__, Infinity)), findCLRFIndex);

export const discardNCharacter = slice(__, Infinity);

export const getFirstLine = ap(flip(slice(0)), findCLRFIndex);

export const joinCLRF = reduce(
  (accumulator, _buffer) => new Uint8Array([ ...accumulator, 13, 10, ..._buffer ]),
  new Uint8Array([])
);

// splitCLRF :: Uint8Array -> Uint8Array[]
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

// trimCRLF :: Uint8Array -> Uint8Array
export const trimCRLF = ap(flip(slice(0)), compose(ifElse(flip(gte)(0), subtract(__, 2), always(Infinity)), findCLRFIndex));

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

export const factorizeUint8Array = x => new Uint8Array(x);
