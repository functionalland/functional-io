import { BufferPrototype } from "./Buffer.d.ts";

type ResponseHeaders = Record<string, any>;

declare interface ResponsePrototype extends BufferPrototype {
  headers: ResponseHeaders;
}

export interface ResponseSuccessPrototype extends ResponsePrototype {
  alt<T extends ResponsePrototype, Y>(container: T): this;
  bimap(
      unaryFunctionA: (headers: ResponseHeaders) => ResponseHeaders,
      unaryFunctionB: (buffer: Uint8Array) => Uint8Array,
  ): this;
  zero(): typeof Response.Failure;
}

export interface ResponseFailurePrototype extends ResponsePrototype {
  alt<T extends ResponsePrototype>(container: T): T;
  bimap(
    unaryFunctionA: (headers: ResponseHeaders) => ResponseHeaders,
    unaryFunctionB: (buffer: Uint8Array) => Uint8Array,
  ): this;
  zero(): typeof Response.Failure;
}

declare namespace Response {
  export function Success<T extends ResponseSuccessPrototype, Z>(headers: ResponseHeaders, buffer: Uint8Array): T;
  export function Success<T extends ResponseSuccessPrototype, Z>(
    headers: ResponseHeaders,
    unaryFunction: (buffer: Uint8Array) => Uint8Array
  ): T;
  export namespace Success {
    export function is<Z>(container: Z): boolean;
    export function of<T extends ResponseSuccessPrototype, Z>(raw: Uint8Array): T;
    export function of<T extends ResponseSuccessPrototype, Z>(unaryFunction: (buffer: Uint8Array) => Uint8Array): T;
  }
  export function Failure<T extends ResponseFailurePrototype, Z>(headers: ResponseHeaders, error: Uint8Array): T;
  export function Failure<T extends ResponseFailurePrototype, Z>(
    headers: ResponseHeaders,
    unaryFunction: (buffer: Uint8Array) => Uint8Array
  ): T;
  export namespace Failure {
    export function is<Z>(container: Z): boolean;
    export function of<T extends ResponseFailurePrototype, Z>(raw: Uint8Array): T;
    export function of<T extends ResponseFailurePrototype, Z>(unaryFunction: (buffer: Uint8Array) => Uint8Array): T;
  }
  export function empty(): typeof Success;
  export function isOrThrow<T extends ResponseSuccessPrototype, F extends ResponseFailurePrototype, Z, K, Y>(
    container: Y
  ): T | F;
  export function zero(): typeof Failure;
}

export default Response;
