export interface BufferPrototype {
  raw: Uint8Array;
  ap<T extends BufferPrototype>(container: T): this;
  chain<T extends BufferPrototype>(unaryFunction: (buffer: Uint8Array) => T): this;
  concat<T extends BufferPrototype>(container: T): this;
  empty(): this;
  equals<T extends BufferPrototype>(container: T): boolean
  extend<T extends BufferPrototype>(unaryFunction: (container: T) => Uint8Array): this;
  extract(): Uint8Array;
  lte<T extends BufferPrototype>(container: T): boolean;
  invert<T extends BufferPrototype>(): this;
  map<T extends BufferPrototype>(unaryFunction: (buffer: Uint8Array) => Uint8Array): this;
  of<T extends BufferPrototype>(buffer: Uint8Array): this;
}

declare function Buffer<T extends BufferPrototype>(buffer: Uint8Array): T;
declare function Buffer<T extends BufferPrototype>(unaryFunction: (buffer: Uint8Array) => Uint8Array): T;
declare namespace Buffer {
  export function empty<T extends BufferPrototype>(): T;
  export function fromString<T extends BufferPrototype>(text: string): T;
  export function is(container: any): boolean;
  export function isOrThrow<T extends BufferPrototype>(container: any): T;
  export function of<T extends BufferPrototype>(buffer: Uint8Array): T;
  export function of<T extends BufferPrototype>(unaryFunction: (buffer: Uint8Array) => Uint8Array): T;
}

export default Buffer;
