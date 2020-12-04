import {
  emptyDir as _emptyDir,
  ensureDir as _ensureDir,
  ensureSymlink as _ensureSymlink,
  exists as _exists,
  move as _move
} from "https://deno.land/std@0.79.0/fs/mod.ts";
import { compose, curry } from "https://x.nest.land/ramda@0.27.0/source/index.js";
import Either from "https://deno.land/x/functional@v1.2.1/library/Either.js"
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js"
import Buffer from "./Buffer.js";
import Directory from "./Directory.js";
import File from "./File.js";
import Resource from "./Resource.js";
import { coerceAsReader, coerceAsWriter, factorizeUint8Array } from "./utilities.js";

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

// close :: Resource a -> Task e Resource a
export const close = resource => Resource.isOrThrow(resource)
  && Task.wrap(_ => Deno.close(resource.rid) || Promise.resolve(undefined))
    .map(_ => resource.constructor.from({ ...resource }));

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

// exists :: URL a -> Task null URL a
export const exists = url => {
  if (!Directory.is(url) && !File.is(url)) {
    throw new Error(`Expected a Directory or a File but got a "${typeof url}"`);
  }

  return Task.wrap(_ => _exists(url.path))
    .map(
      fileExists => {
        if (!fileExists) return Either.Left(null);

        return url.constructor.from({ ...url });
      }
    )
};

// mkdir :: Options -> Directory a -> Task e Directory a
export const mkdir = curry(
  (options, directory) => (Directory.isOrThrow(directory))
    && Task.wrap(_ => Deno.mkdir(directory.path, options))
      .map(_ => Directory(directory.path))
);

// move :: Options -> String -> URL a -> Task e URL b
export const move = curry(
  (options, destinationPath, url) => url.hasOwnProperty("path")
    && Task.wrap(_ => _move(url.path, destinationPath))
    .map(_ => url.constructor.from({ ...url, path: destinationPath }))
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

// readLine :: Resource a -> Task e Resource a
export const readLine = resource => Task.wrap(async _ => {
  let _accumulatorBuffer = new Uint8Array(1024);
  let index = 0;
  let _buffer = new Uint8Array(1);
  let reachedCL = false;

  while (await Deno.read(resource.rid, _buffer)) {
    _accumulatorBuffer[index++] = _buffer[0];
    if (reachedCL && _buffer[0] === 10) break;
    reachedCL = _buffer[0] === 13;
    _buffer = new Uint8Array(1);
  }

  return resource.constructor.from({ ...resource, raw: _accumulatorBuffer.slice(0, index) });
});

// readNBytes :: Number -> Resource a -> Task e Resource a
export const readNBytes = curry(
  compose(
    read,
    (n, resource) => resource.constructor.from({ ...resource, raw: factorizeUint8Array(n) })
  )
);

// readOneByte :: Resource a -> Task e Resource a
export const readOneByte = readNBytes(1);

// readAll :: Resource a -> Task e Resource a
export const readAll = resource => Resource.isOrThrow(resource)
  && Task.wrap(_ => Deno.readAll(coerceAsReader(resource)))
    .map(_buffer => resource.constructor.from({ ...resource, raw: _buffer }));

// readFile :: File a -> Task e File a
export const readFile = file => File.isOrThrow(file)
  && Task.wrap(_ => Deno.readFile(file.path))
    .map(_buffer => File(file.path, _buffer, file.rid));

// remove :: Options -> URL a -> Task e URL a
export const remove = curry(
  (options, url) => url.hasOwnProperty("path")
    && Task.wrap(_ => Deno.remove(url.path, options))
      .map(_ => url.constructor.from({ ...url }))
);

// rename :: String -> URL a -> Task e URL b
export const rename = curry(
  (destinationPath, url) => url.hasOwnProperty("path")
    && Task.wrap(_ => Deno.rename(url.path, destinationPath))
      .map(_ => url.constructor.from({ ...url, path: destinationPath }))
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

