import { BufferPrototype } from "./Buffer.d.ts";

type RequestHeaders = Record<string, any>;

export interface RequestPrototype extends BufferPrototype {
  headers: RequestHeaders;
  bimap<T extends RequestPrototype>(
    unaryFunctionA: (headers: RequestHeaders) => RequestHeaders,
    unaryFunctionB: (buffer: Uint8Array) => Uint8Array,
  ): this;
}

declare function Request<T extends RequestPrototype>(headers: RequestHeaders, buffer: Uint8Array): T;
declare function Request<T extends RequestPrototype>(
  headers: RequestHeaders,
  unaryFunction: (buffer: Uint8Array) => Uint8Array
): T;
declare namespace Request {
  export function DELETE<T extends RequestPrototype>(url: string): T;
  export function GET<T extends RequestPrototype>(url: string): T;
  export function POST<T extends RequestPrototype>(url: string, buffer: Uint8Array): T;
  export function POST<T extends RequestPrototype>(url: string): (buffer: Uint8Array) => T;
  export function PUT<T extends RequestPrototype>(url: string, buffer: Uint8Array): T;
  export function PUT<T extends RequestPrototype>(url: string): (buffer: Uint8Array) => T;
  export function empty<T extends RequestPrototype>(): T;
  export function is(container: any): boolean;
  export function isOrThrow<T extends RequestPrototype>(container: any): T;
  export function of<T extends RequestPrototype>(raw: Uint8Array): T;
  export function of<T extends RequestPrototype>(unaryFunction: (buffer: Uint8Array) => Uint8Array): T;
}

export default Request;
