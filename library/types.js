import { factorizeType } from "https://deno.land/x/functional@v0.4.2/SumType.js";
import Task from "../../functional/library/Task.js"

const $$value = Symbol.for("TypeValue");

export const Buffer = factorizeType("Buffer", [ "raw" ]);

Buffer.isOrThrow = container => {
  if (Buffer.is(container) || container.hasOwnProperty("raw") || Task.is(container)) return container;
  else throw new Error(`Expected a Buffer but got a "${typeof container}"`);
}

Buffer.fromString = text => Buffer(new TextEncoder().encode(text));

Buffer.of = buffer => Buffer(buffer);

// map :: File a ~> (a -> b) -> File b
Buffer.prototype.map = Buffer.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Buffer(unaryFunction(this.raw));
};

// read :: Buffer a ~> Buffer a -> Task e Buffer a
Buffer.prototype.read = function (buffer) {

  return Task.wrap(_ => new Deno.Buffer(...this.raw).read(buffer))
    .map(
      byteCount => byteCount > 0
        ? Buffer(new Uint8Array([ ...buffer ]))
        : Buffer(new Uint8Array([]))
    );
};

// write :: Buffer a ~> Buffer a -> Task e Buffer a
Buffer.prototype.write = function (buffer) {

  return Task.wrap(_ => new Deno.Buffer(...this.raw).write(buffer))
    .map(
      byteCount => byteCount > 0
        ? Buffer(new Uint8Array([ ...this.raw, ...buffer ]))
        : Buffer(new Uint8Array([]))
    );
};

export const Directory = factorizeType("Directory", [ "path" ]);

Directory.isOrThrow = container => {
  if (Directory.is(container) || Task.is(container)) return container;
  else throw new Error(`Expected a Directory but got a "${typeof container}"`);
}

// equals :: Directory a ~> Directory b -> Boolean
Directory.prototype.equals = Directory.prototype["fantasy-land/equals"] = function (container) {

  return this.path === container.path;
}
// chain :: Directory a ~> (a -> Directory b) -> Directory b
Directory.prototype.chain = Directory.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.path);
};
// map :: Directory a ~> (a -> b) -> Directory b
Directory.prototype.map = Directory.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Directory(unaryFunction(this.path));
};

export const File = factorizeType("File", [ "path", "raw", "rid" ]);

File.fromPath = path => File(path, new Uint8Array([]), 0);

File.isOrThrow = container => {
  if (File.is(container) || Task.is(container)) return container;
  else throw new Error(`Expected a File but got a "${typeof container}"`);
}

// empty :: File => () -> File a
File.empty = File.prototype.empty = File.prototype["fantasy-land/empty"] = () =>
  File("", new Uint8Array([]), 0);

// chain :: File a ~> (a -> File b) -> File b
File.prototype.chain = File.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.path, this.raw);
};

// map :: File a ~> (a -> b) -> File b
File.prototype.map = File.prototype["fantasy-land/map"] = function (unaryFunction) {

  return File(unaryFunction(this.path), this.raw);
};

// read :: File a ~> Buffer a -> Task e Buffer a
File.prototype.read = function (buffer) {
  if (this.rid <= 1) throw new Error(`Can't read from resource with ID "${this.rid}" as it's not a File.`);

  return Deno.read(this.rid, buffer);
};

// write :: File a ~> Buffer a -> Task e File a
File.prototype.write = function (buffer) {
  if (this.rid <= 1) throw new Error(`Can't write to resource with ID "${this.rid}" as it's not a File.`);

  return Deno.write(this.rid, buffer);
};

export const FileSystemCollection = factorizeType("FileSystemCollection", [ $$value ]);

FileSystemCollection.of = FileSystemCollection["fantasy-land/of"] = value =>
  (value instanceof Array) ? FileSystemCollection(value) : FileSystemCollection([ value ]);

// empty :: FileSystemCollection m => () -> m
FileSystemCollection.empty = FileSystemCollection["fantasy-land/empty"] = _ => FileSystemCollection.of([]);

// concat :: FileSystemCollection [a] ~> FileSystemCollection [a] -> FileSystemCollection [a]
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

// map :: FileSystemCollection [a] ~> (a -> b) -> FileSystemCollection [b]
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

// empty :: Resource => () -> Resource a
Resource.empty = Resource.prototype.empty = Resource.prototype["fantasy-land/empty"] = () =>
  Resource("", new Uint8Array([]), 0);

// chain :: Resource a ~> (a -> Resource b) -> Resource b
Resource.prototype.chain = Resource.prototype["fantasy-land/chain"] = function (unaryFunction) {

  return unaryFunction(this.path, this.raw);
};

// map :: Resource a ~> (a -> b) -> Resource b
Resource.prototype.map = Resource.prototype["fantasy-land/map"] = function (unaryFunction) {

  return Resource(unaryFunction(this.path), this.raw);
};

// read :: Resource a ~> Buffer a -> Task e Buffer a
Resource.prototype.read = function (buffer) {
  if (this.rid <= 1) throw new Error(`Can't read from resource with ID "${this.rid}" as it's not a Resource.`);

  return Deno.read(this.rid, buffer);
};

// write :: Resource a ~> Buffer a -> Task e Resource a
Resource.prototype.write = function (buffer) {
  if (this.rid <= 1) throw new Error(`Can't write to resource with ID "${this.rid}" as it's not a Resource.`);

  return Deno.write(this.rid, buffer);
};