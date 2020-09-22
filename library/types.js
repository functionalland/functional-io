import { factorizeType } from "https://deno.land/x/functional@v0.5.4/SumType.js";
import Task from "https://deno.land/x/functional@v0.5.4/Task.js";

import { $$value } from "https://deno.land/x/functional@v0.5.4/Symbols.js";

export const Buffer = factorizeType("Buffer", [ "raw" ]);

Buffer.isOrThrow = container => {
  if (Buffer.is(container) || container.hasOwnProperty("raw") || Task.is(container)) return container;
  else throw new Error(`Expected a Buffer but got a "${typeof container}"`);
}

Buffer.fromString = text => Buffer(new TextEncoder().encode(text));

Buffer.of = Buffer.prototype.of = Buffer.prototype["fantasy-land/of"] = buffer => Buffer(buffer);

Buffer.prototype.ap = Buffer.prototype["fantasy-land/ap"] = function (container) {

  return Buffer.of(container.raw(this.raw));
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

Buffer.prototype.map = Buffer.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Buffer(unaryFunction(this.raw));
};

export const Directory = factorizeType("Directory", [ "path" ]);

Directory.isOrThrow = container => {
  if (Directory.is(container) || Task.is(container)) return container;
  else throw new Error(`Expected a Directory but got a "${typeof container}"`);
}

Directory.prototype.chain = Directory.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.path);
};

Directory.prototype.equals = Directory.prototype["fantasy-land/equals"] = function (container) {

  return this.path === container.path;
}

Directory.prototype.map = Directory.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Directory(unaryFunction(this.path));
};

export const File = factorizeType("File", [ "path", "raw", "rid" ]);

File.fromPath = path => File(path, new Uint8Array([]), 0);

File.isOrThrow = container => {
  if (File.is(container) || Task.is(container)) return container;
  else throw new Error(`Expected a File but got a "${typeof container}"`);
}

File.prototype.ap = File.prototype["fantasy-land/ap"] = function (container) {

  return File(this.path, container.raw(this.raw), this.rid);
};

File.prototype.bimap = File.prototype["fantasy-land/bimap"] = function (unaryFunctionA, unaryFunctionB) {

  return File(this.path, unaryFunctionA(this.raw), unaryFunctionB(this.rid));
};

File.empty = File.prototype.empty = File.prototype["fantasy-land/empty"] = () =>
  File("", new Uint8Array([]), 0);

File.prototype.chain = File.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.raw);
};

File.prototype.concat = File.prototype["fantasy-land/concat"] = function (container) {

  return File(this.path, new Uint8Array([ ...this.raw, ...container.raw ]), this.rid);
};

File.empty = File.prototype.empty = Buffer.prototype["fantasy-land/empty"] = function () {

  return File('', new Uint8Array([]), 0);
};

File.prototype.equals = File.prototype["fantasy-land/equals"] = function (container) {

  return this.path === container.path
    && this.rid === container.rid
    && this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => accumulator && accumulator[index] == value ? accumulator : false,
      container.raw
    ));
};

File.prototype.extend = File.prototype["fantasy-land/extend"] = function (unaryFunction) {

  return File(this.path, unaryFunction(this), this.rid);
};

File.prototype.map = File.prototype["fantasy-land/map"] = function (unaryFunction) {

  return File(this.path, unaryFunction(this.raw), this.rid);
};

export const FileSystemCollection = factorizeType("FileSystemCollection", [ $$value ]);

FileSystemCollection.of = FileSystemCollection["fantasy-land/of"] = value =>
  (value instanceof Array) ? FileSystemCollection(value) : FileSystemCollection([ value ]);

FileSystemCollection.empty = FileSystemCollection["fantasy-land/empty"] = _ => FileSystemCollection.of([]);

FileSystemCollection.prototype.concat = FileSystemCollection["fantasy-land/concat"] = function (container) {

  return FileSystemCollection(
    [
      ...this[$$value],
      ...FileSystemCollection.is(container)
        ? container[$$value]
        : (container instanceof Array)
          ? container
          : [ container ]
    ]
  );
};

FileSystemCollection.prototype.map = FileSystemCollection["fantasy-land/map"] = function (unaryFunction) {

  return FileSystemCollection(this[$$value].map(unaryFunction));
};

export const Resource = factorizeType("Resource", [ "raw", "rid" ]);

Resource.fromPath = path => Resource(path, new Uint8Array([]), 0);

Resource.isOrThrow = container => {
  if (
    Resource.is(container)
    || container.hasOwnProperty("rid") && container.hasOwnProperty("raw")
    || Task.is(container)
  ) return container;
  else throw new Error(`Expected a Resource but got a "${typeof container}"`);
}

Resource.empty = Resource.prototype.empty = Resource.prototype["fantasy-land/empty"] = () =>
  Resource("", new Uint8Array([]), 0);

Resource.prototype.equals = Resource.prototype["fantasy-land/equals"] = function (container) {

  return this.rid === container.rid
    && this.raw.byteLength === container.raw.byteLength
    && !!(this.raw.reduce(
      (accumulator, value, index) => accumulator && accumulator[index] == value ? accumulator : false,
      container.raw
    ));
};

Resource.prototype.chain = Resource.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.raw);
};

Resource.prototype.map = Resource.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Resource(unaryFunction(this.raw), this.rid);
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
