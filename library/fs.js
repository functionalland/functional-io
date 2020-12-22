import {
  emptyDir as _emptyDir,
  ensureDir as _ensureDir,
  ensureSymlink as _ensureSymlink,
  exists as _exists,
  move as _move
} from "https://deno.land/std@0.79.0/fs/mod.ts";
import { compose, curry } from "https://deno.land/x/ramda@v0.27.2/mod.ts";
import Either from "https://deno.land/x/functional@v1.3.2/library/Either.js"
import Task from "https://deno.land/x/functional@v1.3.2/library/Task.js"
import Buffer from "./Buffer.js";
import Directory from "./Directory.js";
import File from "./File.js";
import Resource from "./Resource.js";
import URL from "./URL.js";
import { coerceAsReader, coerceAsWriter, factorizeUint8Array } from "./utilities.js";

/**
 * ## File System
 *
 * **⚠️ Note** `Deno.cwd` is used in the following example; if you use `Deno.cwd` to compose your paths, your functions
 * are no longer pure.
 */

/**
 * ### `chdir` [📕](https://doc.deno.land/builtin/stable#Deno.chdir)
 * `Directory -> Task e Directory`
 *
 * Change the current working directory to the specified path.
 *
 * ```js
 * import { chdir } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = chdir(Directory(".."));
 *
 * assert(Task.is(container));
 * ```
 */
export const chdir = directory => Directory.isOrThrow(directory)
  && Task.wrap(_ => Deno.chdir(directory.path) || Promise.resolve(undefined))
    .map(_ => Directory(directory.path));

/**
 * ### `chmod` [📕](https://doc.deno.land/builtin/stable#Deno.chmod)
 * `Number -> File -> Task e File`
 *
 * Changes the permission of a specific file/directory of specified path. Ignores the process's umask.
 *
 * ```js
 * import { chmod } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = chmod(0o000, File.fromPath(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const chmod = curry(
  (mode, file) => File.isOrThrow(file) && Task.wrap(_ => Deno.chmod(file.path, mode))
      .map(_ => File(file.path, file.raw, file.rid))
);

/**
 * ### `chown` [📕](https://doc.deno.land/builtin/stable#Deno.chown)
 * `Number -> Number -> File -> Task e File`
 *
 * Change owner of a regular file or directory. This functionality is not available on Windows.
 *
 * ```js
 * import { chown } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = chown(null, null, File.fromPath(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const chown = curry(
  (uid, gid, file) => File.isOrThrow(file)
    && Task.wrap(_ => Deno.chown(file.path, uid, gid))
      .map(_ => File(file.path, file.raw, file.rid))
);

/**
 * ### `close` [📕](https://doc.deno.land/builtin/stable#Deno.close)
 * `Resource -> Task e Resource`
 *
 * Close the given resource which has been previously opened, such as via opening or creating a file.
 * Closing a file when you are finished with it is important to avoid leaking resources.
 *
 * ```js
 * import { close } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = close(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));
 *
 * assert(Task.is(container));
 * ```
 */
export const close = resource => Resource.isOrThrow(resource)
  && Task.wrap(_ => Deno.close(resource.rid) || Promise.resolve(undefined))
    .map(_ => resource.constructor.from({ ...resource }));

/**
 * ### `copy` [📕](https://doc.deno.land/builtin/stable#Deno.copy)
 * `Object -> Buffer a -> Buffer b -> Task e Buffer b`
 *
 * Copies from a source to a destination until either EOF (null) is read from the source, or an error occurs.
 *
 * ```js
 * import { copy } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = copy({}, Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])), Buffer(new Uint8Array([])));
 *
 * assert(Task.is(container));
 * ```
 */
export const copy = curry(
  (options, readerBuffer, writerBuffer) => (Buffer.isOrThrow(readerBuffer) && Buffer.isOrThrow(writerBuffer))
    && Task.of(writerBuffer.constructor.from({ ...writerBuffer, raw: readerBuffer.raw }))
);

/**
 * ### `copyFile` [📕](https://doc.deno.land/builtin/stable#Deno.copyFile)
 * `File a -> File b -> Task e File b`
 *
 * Copies the contents and permissions of one file to another specified file, by default creating a new file if needed,
 * else overwriting. Fails if target path is a directory or is unwritable.
 *
 * ```js
 * import { copyFile } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = copyFile(File.fromPath(`${Deno.cwd()}/hoge`), File.fromPath(`${Deno.cwd()}/piyo`));
 *
 * assert(Task.is(container));
 * ```
 */
export const copyFile = curry(
  (fileA, fileB) => (File.isOrThrow(fileA) && File.isOrThrow(fileB))
    // NOTE: I don't know if the file should be read after being copied so that the return File has the right content.
    && Task.wrap(_ => Deno.copyFile(fileA.path, fileB.path))
      .map(_ => File(fileB.path, fileA.raw, fileB.rid))
);

/**
 * ### `create` [📕](https://doc.deno.land/builtin/stable#Deno.create)
 * `File -> Task e File`
 *
 * Creates a file if none exists or truncates an existing file.
 *
 * ```js
 * import { create } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = create(File.fromPath(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const create = file => File.isOrThrow(file)
  && Task.wrap(_ => Deno.create(file.path))
    .map(_file => File(file.path, new Uint8Array(file.raw.length), _file.rid));

/**
 * ### `cwd` [📕](https://doc.deno.land/builtin/stable#Deno.cwd)
 *
 * Return a Directory representation of the current working directory.
 * `() -> Task e Directory`
 *
 * ```js
 * import { cwd } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = cwd();
 *
 * assert(Task.is(container));
 * ```
 */
export const cwd = () => Task.wrap(_ => Promise.resolve(Deno.cwd()))
    .map(cwd => Directory(cwd));

/**
 * ### `emptyDir` [📕](https://deno.land/std@0.79.0/fs#emptydir)
 * `Directory -> Task e Directory`
 *
 * Ensures that a directory is empty. Deletes directory contents if the directory is not empty.
 * If the directory does not exist, it is created. The directory itself is not deleted.
 *
 * ```js
 * import { emptyDir } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = emptyDir(Directory(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 ```
 */
export const emptyDir = directory => Directory.isOrThrow(directory)
  && Task.wrap(_ => _emptyDir(directory.path))
  .map(_ => Directory(directory.path));

/**
 * ### `ensureDir` [📕](https://deno.land/std@0.79.0/fs#ensuredir)
 * `Directory -> Task e Directory`
 *
 * Ensures that the directory exists. If the directory structure does not exist, it is created. Like `mkdir -p`.
 *
 * ```js
 * import { ensureDir } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = emptyDir(Directory(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const ensureDir = directory => Directory.isOrThrow(directory)
  && Task.wrap(_ => _ensureDir(directory.path))
  .map(_ => Directory(directory.path));

// ensureSymlink :: Directory a -> Task e Directory a
export const ensureSymlink = directory => Directory.isOrThrow(directory)
  && Task.wrap(_ => _ensureSymlink(directory.path))
  .map(_ => Directory(directory.path));

/**
 * ### `exists` [📕](https://deno.land/std@0.79.0/fs#exists)
 * `URL -> Task e|null URL
 *
 * Test whether the given path exists by checking with the file system.
 * If the file or directory doesn't exist, it will resolve to `Either.Left(null)`.
 *
 * ```js
 * import { exists } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = exists(Directory(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const exists = url => URL.isOrThrow(url)
  && Task.wrap(_ => _exists(url.path))
    .map(fileExists => !fileExists ? Either.Left(null) : url.constructor.from({ ...url }));

/**
 * ### `mkdir` [📕](https://deno.land/std@0.79.0/fs#mkdir)
 * `Object -> Directory -> Task e Directory`
 *
 * Creates a new directory with the specified path.
 *
 * ```js
 * import { mkdir } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = mkdir({}, Directory(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const mkdir = curry(
  (options, directory) => (Directory.isOrThrow(directory))
    && Task.wrap(_ => Deno.mkdir(directory.path, options))
      .map(_ => Directory(directory.path))
);

/**
 * ### `move` [📕](https://deno.land/std@0.79.0/fs#move)
 * `Object -> String -> URL -> Task e URL`
 *
 * Moves a file or directory.
 *
 * ```js
 * import { move } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = move({}, `${Deno.cwd()}/piyo`, Directory(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const move = curry(
  (options, destinationPath, url) => URL.isOrThrow(url)
    && Task.wrap(_ => _move(url.path, destinationPath))
    .map(_ => url.constructor.from({ ...url, path: destinationPath }))
);

/**
 * ### `open` [📕](https://doc.deno.land/builtin/stable#Deno.open)
 * `Object -> File -> Task e File`
 *
 * Open a file and resolve to an instance of File. The file does not need to previously exist if using the create or
 * createNew open options. It is the callers responsibility to close the file when finished with it.
 *
 * ```js
 * import { open } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = open({ read: true, write: true }, File.fromPath(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const open = curry(
  (options, file) => File.isOrThrow(file)
    && Task.wrap(_ => Deno.open(file.path, options))
      .map(_file => File(file.path, new Uint8Array([]), _file.rid))
);

/**
 * ### `read` [📕](https://doc.deno.land/builtin/stable#Deno.read)
 * `Resource Task e Resource`
 *
 * Read from a Resource given it has a non-zero raw buffer.
 *
 * ```js
 * import { read } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = read(File(`${Deno.cwd()}/hoge`, new Uint8Array(5), 3));
 *
 * assert(Task.is(container));
 * ```
 */
export const read = resource => {
  const _buffer = new Uint8Array(resource.raw.length);

  return Resource.isOrThrow(resource)
    && Task.wrap(_ => Deno.read(resource.rid, _buffer))
      .map(_ => resource.constructor.from({ ...resource, raw: _buffer }))
};

/**
 * ### `readLine`
 * `Resource -> Task e Resource`
 *
 * Read from a Resource to the CLRF.
 *
 * ```js
 * import { readLine } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = readLine(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));
 *
 * assert(Task.is(container));
 * ```
 */
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

/**
 * ### `readNBytes`
 * `Number -> Resource -> Task e Resource`
 *
 * Read N bytes from a Resource.
 *
 * ```js
 * import { readNBytes } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = readNBytes(5, File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));
 *
 * assert(Task.is(container));
 * ```
 */
export const readNBytes = curry(
  compose(
    read,
    (n, resource) => resource.constructor.from({ ...resource, raw: factorizeUint8Array(n) })
  )
);

/**
 * ### `readOneByte`
 * `Resource -> Task e Resource`
 *
 * Read 1 byte from a Resource.
 *
 * ```js
 * import { readOneByte } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = readOneByte(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));
 *
 * assert(Task.is(container));
 * ```
 */
export const readOneByte = readNBytes(1);

/**
 * ### `readAll` [📕](https://doc.deno.land/builtin/stable#Deno.readAll)
 * `Resource -> Task e Resource`
 *
 * Read from a Resource.
 *
 * ```js
 * import { readAll } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = readAll(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));
 *
 * assert(Task.is(container));
 * ```
 */
export const readAll = resource => Resource.isOrThrow(resource)
  && Task.wrap(_ => Deno.readAll(coerceAsReader(resource)))
    .map(_buffer => resource.constructor.from({ ...resource, raw: _buffer }));

/**
 * ### `readFile` [📕](https://doc.deno.land/builtin/stable#Deno.readFile)
 * `File -> Task e File`
 *
 * Read from a File.
 *
 * ```js
 * import { readFile } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = readFile(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));
 *
 * assert(Task.is(container));
 * ```
 */
export const readFile = file => File.isOrThrow(file)
  && Task.wrap(_ => Deno.readFile(file.path))
    .map(_buffer => File(file.path, _buffer, file.rid));

/**
 * ### `remove` [📕](https://doc.deno.land/builtin/stable#Deno.remove)
 * `Object -> URL -> Task e URL`
 *
 * Removes the named file or directory.
 *
 * ```js
 * import { remove } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = remove({ recursive: true }, Directory.fromPath(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const remove = curry(
  (options, url) => URL.isOrThrow(url)
    && Task.wrap(_ => Deno.remove(url.path, options))
      .map(_ => url.constructor.from({ ...url }))
);

/**
 * ### `rename` [📕](https://doc.deno.land/builtin/stable#Deno.rename)
 * `String -> URL -> Task e URL`
 *
 * Renames a file or directory.
 *
 * ```js
 * import { rename } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = rename(`${Deno.cwd()}/piyo`, Directory(`${Deno.cwd()}/hoge`));
 *
 * assert(Task.is(container));
 * ```
 */
export const rename = curry(
  (destinationPath, url) => URL.isOrThrow(url)
    && Task.wrap(_ => Deno.rename(url.path, destinationPath))
      .map(_ => url.constructor.from({ ...url, path: destinationPath }))
);

/**
 * ### `write` [📕](https://doc.deno.land/builtin/stable#Deno.write)
 * `Resource -> Task e Resource`
 *
 * Write to a Resource given it has a non-zero raw buffer.
 *
 * ```js
 * import { write } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = write(File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3));
 *
 * assert(Task.is(container));
 * ```
 */
export const write = resource => Resource.isOrThrow(resource)
  && Task.wrap(_ => Deno.write(resource.rid, resource.raw))
    .map(_ => resource.constructor.from({ ...resource }));

/**
 * ### `writeAll` [📕](https://doc.deno.land/builtin/stable#Deno.writeAll)
 * `Buffer -> Task e Resource`
 *
 * Write all to a Resource from a Buffer.
 *
 * ```js
 * import { writeAll } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = writeAll(
 *   Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])),
 *   File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3)
 * );
 *
 * assert(Task.is(container));
 * ```
 */
export const writeAll = curry(
  (buffer, resource) => Resource.isOrThrow(resource) && Buffer.isOrThrow(buffer)
    && Task.wrap(_ =>
      Deno.writeAll(coerceAsWriter(resource), buffer.raw))
      .map(_ => resource.constructor.from({ ...resource, raw: buffer.raw }))
);

/**
 * ### `writeFile` [📕](https://doc.deno.land/builtin/stable#Deno.writeFile)
 * `Object -> File -> Task e File`
 *
 * Write a File to the file system.
 *
 * ```js
 * import { writeFile } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";
 *
 * const container = writeFile({}, File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));
 *
 * assert(Task.is(container));
 * ```
 */
export const writeFile = curry(
  (options, file) => Resource.isOrThrow(file)
    && Task.wrap(_ => Deno.writeFile(file.path, file.raw, options))
      .map(_ => file.constructor.from({ ...file }))
);

