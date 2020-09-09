import { assert } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import {
  emptyDir as _emptyDir,
  ensureDir as _ensureDir,
  ensureSymlink as _ensureSymlink,
  exists as _exists,
  move as _move,
  readJson as _readJson,
  walk as _walk,
  writeJson as _writeJson,
} from "https://deno.land/std@0.67.0/fs/mod.ts";
import { compose, concat, curry, prop } from "https://x.nest.land/ramda@0.27.0/source/index.js";
import Either from "https://deno.land/x/functional@v0.4.2/Either.js"
import Task from "../../functional/library/Task.js"
import { stream } from "../../functional/library/utilities.js"
import { Buffer, Directory, File, FileSystemCollection } from "./types.js";

const $$value = Symbol.for("TypeValue");

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

// copy :: Options -> Buffer a -> Buffer b -> Task e Writer b
export const copy = curry(
  (options, readerBuffer, writerBuffer) => (Buffer.isOrThrow(readerBuffer) && Buffer.isOrThrow(writerBuffer))
    && Task.wrap(_ => Deno.copy(new Deno.Buffer(readerBuffer[$$value]), new Deno.Buffer(writerBuffer[$$value]), options))
      .map(_ => Buffer(readerBuffer[$$value]))
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
    .map(_file => File(file.path, new Uint8Array([]), _file.rid));

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

// exists :: File a|Directory a -> Task null File a|Directory a
export const exists = container => {
  if (!Directory.is(container) && !File.is(container)) {
    throw new Error(`Expected a Directory or a File but got a "${typeof container}"`);
  }

  return Task.wrap(_ => _exists(container.path))
    .map(
      fileExists => {
        if (!fileExists) return Either.Left(null);

        return Directory.is(container)
          ? Directory(container.path)
          : File(container.path, container.raw, container.rid);
      }
    )
};

// // lstat :: Directory a -> Task null Directory a
// export const lstat = container => (Directory.isOrThrow(container) || File.isOrThrow(container))
//   && Task.wrap(_ => Deno.lstat(container.path))
//     .map(
//       fileExists => fileExists
//         ? Either.Right(
//           Directory.is(container) ? Directory(container.path) : File(container.path, container.raw, container.rid)
//         )
//         : Either.Left(null)
//     );

// mkdir :: Options -> Directory a -> Task e Directory a
export const mkdir = curry(
  (options, directory) => (Directory.isOrThrow(directory))
    && Task.wrap(_ => Deno.mkdir(directory.path, options))
      .map(_ => Directory(directory.path))
);

// move :: Directory a -> String -> Task e Directory b
export const move = curry(
  (directory, destinationPath) => Directory.isOrThrow(directory)
    && Task.wrap(_ => _move(directory.path, destinationPath))
    .map(_ => Directory(destinationPath))
);

// open :: Options -> File a -> Task e File a
export const open = curry(
  (options, file) => (File.isOrThrow(file))
    && Task.wrap(_ => Deno.open(file.path, options))
      .map(_file => File.fromFile(_file))
);

// readJson :: String -> Task e Object
export const readJson = filePath => Task.wrap(_ => _readJson(filePath))
  .map(JSONObject => ({ ...JSONObject }));

// writeJson :: Options -> String -> Object -> Task e Object
export const writeJson = curry(
  (options, filePath, JSONObject) => Task.wrap(_ => _writeJson(filePath, JSONObject, options))
    .map(_ => ({ ...JSONObject }))
);

// walk :: Directory a -> (File|Directory -> *) -> Task e FileSystemCollection
export const walk = curry(
  (directory, unaryFunction) =>
    Directory.isOrThrow(directory)
    && Task(_ =>
      stream(
        (accumulator, entry) =>
          compose(
            concat(accumulator),
            unaryFunction,
            x => console.debug(x) || x,
            entry =>
              entry.isFile && File.fromPath(entry.path)
              || entry.isDirectory && Directory(entry.path)
          )(entry),
        FileSystemCollection.empty(),
        walk(directory.path)
      )
    )
      .map(fileSystemCollection => Either.Right(fileSystemCollection))
);

Deno.test(
  "emptyDir",
  () => {
    const containerA = emptyDir(Directory("/path/to/project"))
      .then(directory => directory.map(path => path.replace(/(?!\/)[A-Za-z0-9_:\s]+$/, "hoge")));

    const containerB = containerA.then(directory => directory.map(path => path.replace("hoge", "fuga")));

    assert(Task.is(containerA));
    assert(Task.is(containerB));
  }
);

Deno.test(
  "ensureDir",
  () => {
    const containerA = ensureDir(Directory("/path/to/project"))
      .then(directory => directory.map(path => path.replace(/(?!\/)[A-Za-z0-9_:\s]+$/, "hoge")));

    const containerB = containerA.then(directory => directory.map(path => path.replace("hoge", "fuga")));

    assert(Task.is(containerA));
    assert(Task.is(containerB));
  }
);

Deno.test(
  "ensureSymlink",
  () => {
    const containerA = ensureSymlink(Directory("/path/to/project"))
      .then(directory => directory.map(path => path.replace(/(?!\/)[A-Za-z0-9_:\s]+$/, "hoge")));

    const containerB = containerA.then(directory => directory.map(path => path.replace("hoge", "fuga")));

    assert(Task.is(containerA));
    assert(Task.is(containerB));
  }
);

// Deno.test(
//   "exists",
//   () => {
//     const containerA = exists(Directory("/path/to/project"))
//       .then(directory => directory.map(path => path.replace(/(?!\/)[A-Za-z0-9_:\s]+$/, "hoge")));
//
//     const containerB = containerA.then(directory => directory.map(path => path.replace("hoge", "fuga")));
//
//     assert(Task.is(containerA));
//     assert(Task.is(containerB));
//   }
// );

// Deno.test(
//   "exists",
//   () => {
//     const containerA = exists(Directory("/path/to/project"))
//       .then(directory => directory.map(path => path.replace(/(?!\/)[A-Za-z0-9_:\s]+$/, "hoge")));
//
//     const containerB = containerA.then(directory => directory.map(path => path.replace("hoge", "fuga")));
//
//     assert(Task.is(containerA));
//     assert(Task.is(containerB));
//     const promiseA = containerA.run();
//     const promiseB = containerB.run();
//     assert(promiseA instanceof Promise);
//     assert(promiseB instanceof Promise);
//
//     return Promise.all([
//       promiseA.then(x => {
//         assert(Either.Right.is(x), x.toString());
//         assertEquals(x[$$value].path, "/path/to/hoge");
//       }),
//       promiseB.then(x => {
//         assert(Either.Right.is(x), x.toString());
//         assertEquals(x[$$value].path, "/path/to/fuga");
//       })
//     ]);
//   }
// );

Deno.test(
  "Walk",
  async () => {
    const containerA = walk(
      Directory("/path/to/project"),
      file => file.chain(
        file =>
          file.constructor(file.path.replace(/(?!\/)[A-Za-z0-9_:\s]+$/, "hoge"), file.raw)
      )
    );
    const containerB = containerA
      .map(x => console.debug("MAP:", x) || x);

    assert(Task.is(containerA));
    assert(Task.is(containerB));
    // const promiseA = containerA.run();
    // const promiseB = containerB.run();
    // assert(promiseA instanceof Promise);
    // assert(promiseB instanceof Promise);
    //
    // return Promise.all(
    //   promiseA.then(x => {
    //     assert(FileSystemCollection.is(x), x.toString());
    //   }),
    //   promiseB.then(x => {
    //     assert(FileSystemCollection.is(x), x.toString());
    //   })
    // );
  }
);

Deno.test(
  "readJson",
  () => {
    const containerA = readJson("/path/to/project/piyo.json")
      .then(prop("hoge"));

    const containerB = containerA.then(hoge => hoge.toUpperCase());

    assert(Task.is(containerA));
    assert(Task.is(containerB));
  }
);

Deno.test(
  "readJson",
  () => {
    const containerA = writeJson({}, "/path/to/project/piyo.json", { hoge: "fuga" })
      .then(prop("hoge"));

    const containerB = containerA.then(hoge => hoge.toUpperCase());

    assert(Task.is(containerA));
    assert(Task.is(containerB));
  }
);

// Deno.test(
//   "----",
//   () => {
//     const IOContainer = x => IO.of(_ => console.debug("> !!!!!!!") || Promise.resolve(x * 2));
//
// // Keep this
//     const a = IOContainer(42).chain(x => IOContainer(x).map(x => x.then(y => y + 2)));
//     console.debug("A", a);
//     const d = a.map(x => x.then(y => y - 10));
//     const e = a.map(x => x.then(y => y - 13));
//     console.debug("D", d);
//     const b = d.run();
//     const f = e.run();
//     console.debug("B", b);
//     b.then(x => console.debug("BBBB", x))
//     f.then(x => console.debug("FFFF", x))
//
//     setTimeout(() => null, 1000);
//   }
// )
