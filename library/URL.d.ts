export interface URLPrototype {
    path: string;
    ap<T = Partial<URLPrototype>>(container: T): this;
    chain<T extends URLPrototype>(unaryFunction: (path: string) => T): this;
    equals<T extends URLPrototype>(container: T): boolean
    extend<T extends URLPrototype>(unaryFunction: (container: T) => string): this;
    extract(): string;
    lte<T extends URLPrototype>(container: T): boolean;
    map<T extends URLPrototype>(unaryFunction: (path: string) => string): this;
    of<T extends URLPrototype>(path: string): this;
}

declare function URL(path: string): URLPrototype;
declare function URL(unaryFunction: (path: string) => string): URLPrototype;
declare namespace URL {
  export function fromPath(path: string): URLPrototype;
  export function isOrThrow(container: URLPrototype): URLPrototype;
  export function of(raw: Uint8Array): URLPrototype;
}

export default URL;