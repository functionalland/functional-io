import { BufferPrototype } from "./Buffer.d.ts";
import { ResourcePrototype } from "./Resource.d.ts";
import { URLPrototype } from "./URL.d.ts";

export interface FilePrototype extends ResourcePrototype {
    path: string;
    ap<T extends BufferPrototype, M extends URLPrototype>(container: T | M): this;
}

declare function File(path: string, buffer: Uint8Array, rid: number): FilePrototype;
declare function File(path: string, unaryFunction: (buffer: Uint8Array) => Uint8Array, rid: number): FilePrototype;
declare function File(unaryFunction: (path: string) => string, buffer: Uint8Array, rid: number): FilePrototype;
declare namespace File {
  export function empty(): FilePrototype;
  export function fromPath(path: string): FilePrototype;
  export function is(container: any): boolean;
  export function isOrThrow(container: FilePrototype): FilePrototype;
  export function of(raw: Uint8Array): FilePrototype;
  export function of(unaryFunction: (buffer: Uint8Array) => Uint8Array): FilePrototype;
}

export default File;
