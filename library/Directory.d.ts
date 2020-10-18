import { URLPrototype } from "./URL.d.ts";

export interface DirectoryPrototype extends URLPrototype {}

declare function Directory(path: string): DirectoryPrototype;
declare function Directory(unaryFunction: (path: string) => string): DirectoryPrototype;
declare namespace Directory {
    export function fromPath(path: string): DirectoryPrototype;
    export function isOrThrow(container: DirectoryPrototype): DirectoryPrototype;
    export function of(raw: Uint8Array): DirectoryPrototype;
}

export default Directory;
