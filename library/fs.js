import {
  emptyDir as _emptyDir,
  ensureDir as _ensureDir,
  ensureSymlink as _ensureSymlink,
  exists as _exists,
  move as _move
} from "https://deno.land/std@0.70.0/fs/mod.ts";
import { curry } from "https://x.nest.land/ramda@0.27.0/source/index.js";
import Either from "https://deno.land/x/functional@v1.0.0/library/Either.js"
import Task from "https://deno.land/x/functional@v1.0.0/library/Task.js"
import Buffer from "./Buffer.js";
import Directory from "./Directory.js";
import File from "./File.js";
import Resource from "./Resource.js";
import { coerceAsReader, coerceAsWriter } from "./utilities.js";

// chdir :: Directory a -> Task e Directory a
export const chdir = directory => Directory.isOrThrow(directory)
  && Task.wrap(_ => Deno.chdir(directory.path) || Promise.resolve(undefined))
    .map(_ => Directory(directory.path));

// chmod :: Number -> File a -> Task e File a
export const chmod = curry(
  (mode, file) => File.isOrThrow(file) && Task.wrap(_ => Deno.chmod(file.path, mode))
      .map(_ => File(file.path, file.raw, file.rid))
);

// chown :: Number -> Number -> File a -> Task e File a
export const chown = curry(
  (uid, gid, file) => File.isOrThrow(file)
    && Task.wrap(_ => Deno.chown(file.path, uid, gid))
      .map(_ => File(file.path, file.raw, file.rid))
);

// close :: File a -> Task e File a
export const close = file => File.isOrThrow(file)
  && Task.wrap(_ => Deno.close(file.rid) || Promise.resolve(undefined))
    .map(_ => File(file.path, file.raw, file.rid));

// copy :: Options -> Buffer a -> Buffer b -> Task e Buffer a
export const copy = curry(
  (options, readerBuffer, writerBuffer) => (Buffer.isOrThrow(readerBuffer) && Buffer.isOrThrow(writerBuffer))
    && Task.of(writerBuffer.constructor.from({ ...writerBuffer, raw: readerBuffer.raw }))
);

// copyFile :: File a -> File b -> Task e File b
export const copyFile = curry(
  (fileA, fileB) => (File.isOrThrow(fileA) && File.isOrThrow(fileB))
    // NOTE: I don't know if the file should be read after being copied so that the return File has the right content.
    && Task.wrap(_ => Deno.copyFile(fileA.path, fileB.path))
      .map(_ => File(fileB.path, fileA.raw, fileB.rid))
);

// create :: File a -> Task e File a
export const create = file => File.isOrThrow(file)
  && Task.wrap(_ => Deno.create(file.path))
    .map(_file => File(file.path, new Uint8Array(file.raw.length), _file.rid));

// cwd :: () Task e Directory a
export const cwd = () => Task.wrap(_ => Promise.resolve(Deno.cwd()))
    .map(cwd => Directory(cwd));

// emptyDir :: Directory a -> Task e Directory a
export const emptyDir = directory => Directory.isOrThrow(directory)
  && Task.wrap(_ => _emptyDir(directory.path))
  .map(_ => Directory(directory.path));

// ensureDir :: Directory a -> Task e Directory a
export const ensureDir = directory => Directory.isOrThrow(directory)
  && Task.wrap(_ => _ensureDir(directory.path))
  .map(_ => Directory(directory.path));

// ensureSymlink :: Directory a -> Task e Directory a
export const ensureSymlink = directory => Directory.isOrThrow(directory)
  && Task.wrap(_ => _ensureSymlink(directory.path))
  .map(_ => Directory(directory.path));

// exists :: Location a -> Task null Location a
export const exists = location => {
  if (!Directory.is(location) && !File.is(location)) {
    throw new Error(`Expected a Directory or a File but got a "${typeof location}"`);
  }

  return Task.wrap(_ => _exists(location.path))
    .map(
      fileExists => {
        if (!fileExists) return Either.Left(null);

        return location.constructor.from({ ...location });
      }
    )
};

// mkdir :: Options -> Directory a -> Task e Directory a
export const mkdir = curry(
  (options, directory) => (Directory.isOrThrow(directory))
    && Task.wrap(_ => Deno.mkdir(directory.path, options))
      .map(_ => Directory(directory.path))
);

// move :: Options -> String -> Location a -> Task e Location b
export const move = curry(
  (options, destinationPath, location) => location.hasOwnProperty("path")
    && Task.wrap(_ => _move(location.path, destinationPath))
    .map(_ => location.constructor.from({ ...location, path: destinationPath }))
);

// open :: Options -> File a -> Task e File a
export const open = curry(
  (options, file) => File.isOrThrow(file)
    && Task.wrap(_ => Deno.open(file.path, options))
      .map(_file => File(file.path, new Uint8Array([]), _file.rid))
);

// read :: Resource a -> Task e Resource a
export const read = resource => {
  const _buffer = new Uint8Array(resource.raw.length);

  return Resource.isOrThrow(resource)
    && Task.wrap(_ => Deno.read(resource.rid, _buffer))
      .map(_ => resource.constructor.from({ ...resource, raw: _buffer }))
};

// readAll :: Resource a -> Task e Resource a
export const readAll = resource => Resource.isOrThrow(resource)
  && Task.wrap(_ => Deno.readAll(coerceAsReader(resource)))
    .map(_buffer => resource.constructor.from({ ...resource, raw: _buffer }));

// readFile :: File a -> Task e File a
export const readFile = file => File.isOrThrow(file)
  && Task.wrap(_ => Deno.readFile(file.path))
    .map(_buffer => File(file.path, _buffer, file.rid));

// remove :: Options -> Location a -> Task e Location a
export const remove = curry(
  (options, location) => location.hasOwnProperty("path")
    && Task.wrap(_ => Deno.remove(location.path, options))
      .map(_ => location.constructor.from({ ...location }))
);

// rename :: String -> Location a -> Task e Location b
export const rename = curry(
  (destinationPath, location) => location.hasOwnProperty("path")
    && Task.wrap(_ => Deno.rename(location.path, destinationPath))
      .map(_ => location.constructor.from({ ...location, path: destinationPath }))
);

// write :: Resource a -> Task e Resource a
export const write = resource => Resource.isOrThrow(resource)
  && Task.wrap(_ => Deno.write(resource.rid, resource.raw))
    .map(_ => resource.constructor.from({ ...resource }));

// writeAll :: Buffer b -> Resource a -> Task e Resource b
export const writeAll = curry(
  (buffer, resource) => Resource.isOrThrow(resource) && Buffer.isOrThrow(buffer)
    && Task.wrap(_ =>
      Deno.writeAll(coerceAsWriter(resource), buffer.raw))
      .map(_ => resource.constructor.from({ ...resource, raw: buffer.raw }))
);

// writeFile :: File a -> Task e File a
export const writeFile = curry(
  (options, file) => Resource.isOrThrow(file)
    && Task.wrap(_ => Deno.writeFile(file.path, file.raw, options))
      .map(_ => file.constructor.from({ ...file }))
);
