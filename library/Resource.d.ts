import { BufferPrototype } from "./Buffer.d.ts";

export interface ResourcePrototype extends BufferPrototype {
  rid: number;
  bimap<T extends ResourcePrototype>(
      unaryFunctionA: (buffer: Uint8Array) => Uint8Array,
      unaryFunctionB: (rid: number) => number
  ): this;
}

declare function Resource<T extends ResourcePrototype>(buffer: Uint8Array, rid: number): T;
declare function Resource<T extends ResourcePrototype>(
  unaryFunction: (buffer: Uint8Array) => Uint8Array,
  rid: number
): T;
declare namespace Resource {
  export function empty<T extends ResourcePrototype>(): T;
  export function is(container: any): boolean;
  export function isOrThrow<T extends ResourcePrototype>(container: any): T;
  export function of<T extends ResourcePrototype>(raw: Uint8Array): T;
  export function of<T extends ResourcePrototype>(unaryFunction: (buffer: Uint8Array) => Uint8Array): T;
}

export default Resource;
