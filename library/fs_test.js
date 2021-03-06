import {
  __,
  ap,
  compose,
  concat,
  converge,
  chain,
  curry,
  flip,
  head,
  join,
  lift,
  map,
  match,
  path,
  prop,
  replace,
  trim,
  useWith
} from "https://deno.land/x/ramda@v0.27.2/mod.ts";
import { assert, assertEquals } from "https://deno.land/std@0.79.0/testing/asserts.ts";
import {
  emptyDir as _emptyDir,
  ensureDir as _ensureDir
} from "https://deno.land/std@0.79.0/fs/mod.ts";
import Either from "https://deno.land/x/functional@v1.3.3/library/Either.js"
import Task from "https://deno.land/x/functional@v1.3.3/library/Task.js";
import { log, safeExtract } from "https://deno.land/x/functional@v1.3.3/library/utilities.js";
import Buffer from "./Buffer.js";
import Directory from "./Directory.js";
import File, { factorizeFile } from "./File.js";
import Request from "./Request.js";
import { fetch } from "./browser_safe.js";
import {
  chdir,
  chmod,
  chown,
  close,
  copy,
  copyFile,
  create,
  cwd,
  emptyDir,
  ensureDir,
  exists,
  mkdir,
  move,
  open,
  read,
  readAll,
  readFile,
  readNBytes,
  remove,
  rename,
  write,
  writeAll,
  writeFile
} from "./fs.js"

import { $$value } from "https://deno.land/x/functional@v1.3.3/library/Symbols.js";

Deno.test(
  "Integration: chdir",
  async () => {
    const directoryPathA = await Deno.cwd();

    const containerA = chdir(Directory(".."));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(Directory(".."))`
    );

    const directoryPathB = await Deno.cwd();

    assert(directoryPathA !== directoryPathB);

    Deno.chdir(directoryPathA);
  }
);

Deno.test(
  "Integration: chmod (File)",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await _emptyDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");

    const fileStatA = await Deno.lstat(`${Deno.cwd()}/dump/hoge`);
    const containerA = chmod(0o000, File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([]), 0));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    const fileStatB = await Deno.lstat(`${Deno.cwd()}/dump/hoge`);

    assert(fileStatA.mode !== fileStatB.mode);

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", , 0))`
    );

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
  }
);

Deno.test(
  "Integration: chown",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await _emptyDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");

    const fileStatA = await Deno.lstat(`${Deno.cwd()}/dump/hoge`);

    const containerA = chown(null, null, File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([]), 0));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    const fileStatB = await Deno.lstat(`${Deno.cwd()}/dump/hoge`);

    assert(fileStatA.uid === fileStatB.uid);
    assert(fileStatA.gid === fileStatB.gid);

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", , 0))`
    );

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
  }
);

Deno.test(
  "Integration: close",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");
    const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { read: true, write: true });

    const containerA = close(File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([]), _file.rid));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", , ${_file.rid}))`
    );

    try {
      await Deno.write(_file.rid, new Uint8Array([ 65, 66, 67, 68, 69 ]))
      assert(false, "Resource was not closed properly.");
    } catch (error) {}
    finally {
      await Deno.remove(`${Deno.cwd()}/dump/hoge`);
    }
  }
);

Deno.test(
  "Integration: copy",
  async () => {
    const bufferContainerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const bufferContainerB = Buffer(new Uint8Array([]));

    assert(Buffer.is(bufferContainerA));
    assert(Buffer.is(bufferContainerB));

    const containerA = copy({}, bufferContainerA, bufferContainerB);
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(Buffer(65,66,67,68,69))`
    );

    // Proof that the function is pure
    assertEquals(
      bufferContainerA.toString(),
      `Buffer(65,66,67,68,69)`
    );
    assertEquals(
      bufferContainerB.toString(),
      `Buffer()`
    );
  }
);

Deno.test(
  "Integration: copyFile",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await _emptyDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");
    const _file = await Deno.create(`${Deno.cwd()}/dump/piyo`);

    const containerA = copyFile(
      File.fromPath(`${Deno.cwd()}/dump/hoge`),
      File.fromPath(`${Deno.cwd()}/dump/piyo`)
    );
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/piyo", , 0))`
    );

    const _buffer = await Deno.readAll(_file);
    Deno.close(_file.rid);

    assertEquals(
      _buffer,
      new Uint8Array([ 65, 66, 67, 68, 69 ])
    );

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
    await Deno.remove(`${Deno.cwd()}/dump/piyo`);
  }
);

Deno.test(
  "Integration: create",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await _emptyDir(`${Deno.cwd()}/dump`);

    const containerA = create(File.fromPath(`${Deno.cwd()}/dump/hoge`));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", , ${containerB[$$value].rid}))`
    );

    Deno.close(containerB[$$value].rid);
    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
  }
);

Deno.test(
  "Integration: cwd",
  async () => {
    const containerA = cwd();
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(Directory("${Deno.cwd()}"))`
    );
  }
)

Deno.test(
  "Integration: emptyDir",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");

    const containerA = emptyDir(Directory(`${Deno.cwd()}/dump`));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(Directory("${Deno.cwd()}/dump"))`
    );

    try {
      await Deno.lstat(`${Deno.cwd()}/dump/hoge`);
      assert(false, "Resource was not removed properly.");
    } catch (error) {}
  }
);

Deno.test(
  "Integration: ensureDir",
  async () => {
    await Deno.remove(`${Deno.cwd()}/dump`);

    const containerA = ensureDir(Directory(`${Deno.cwd()}/dump`));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(Directory("${Deno.cwd()}/dump"))`
    );

    const { isDirectory } = await Deno.lstat(`${Deno.cwd()}/dump`);
    assert(isDirectory);
  }
);

Deno.test(
  "Integration: exists (Right)",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await _emptyDir(`${Deno.cwd()}/dump`);
    const _file = await Deno.create(`${Deno.cwd()}/dump/hoge`);

    const containerA = exists(File.fromPath(`${Deno.cwd()}/dump/hoge`));
    const promiseA = containerA.run();

    assert(Task.is(containerA));
    assert(promiseA instanceof Promise);

    const containerB = await promiseA;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", , ${containerB[$$value].rid}))`
    );

    Deno.close(_file.rid);
    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
  }
);

Deno.test(
  "Integration: exists (Left)",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await _emptyDir(`${Deno.cwd()}/dump`);

    const containerA = exists(File.fromPath(`${Deno.cwd()}/dump/hoge`));
    const promiseA = containerA.run();

    assert(Task.is(containerA));
    assert(promiseA instanceof Promise);

    const containerB = await promiseA;

    assert(Either.Left.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Left(null)`
    );
  }
);

Deno.test(
  "Integration: mkdir",
  async () => {
    await Deno.remove(`${Deno.cwd()}/dump`);

    const containerA = mkdir({}, Directory(`${Deno.cwd()}/dump`));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(Directory("${Deno.cwd()}/dump"))`
    );

    const { isDirectory } = await Deno.lstat(`${Deno.cwd()}/dump`);
    assert(isDirectory);
  }
);

Deno.test(
  "Integration: move",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await _emptyDir(`${Deno.cwd()}/dump`);
    const _file = await Deno.create(`${Deno.cwd()}/dump/hoge`);

    const containerA = move({}, `${Deno.cwd()}/dump/piyo`, File.fromPath(`${Deno.cwd()}/dump/hoge`));
    const promiseA = containerA.run();

    assert(Task.is(containerA));
    assert(promiseA instanceof Promise);

    const containerB = await promiseA;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/piyo", , ${containerB[$$value].rid}))`
    );

    const { isFile } = await Deno.lstat(`${Deno.cwd()}/dump/piyo`);
    assert(isFile);

    Deno.close(_file.rid);
    await Deno.remove(`${Deno.cwd()}/dump/piyo`);
  }
);

Deno.test(
  "Integration: open",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");
    const containerA = open({ read: true, write: true }, File.fromPath(`${Deno.cwd()}/dump/hoge`));

    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", , ${containerB[$$value].rid}))`
    );

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
    Deno.close(containerB[$$value].rid);
  }
);

Deno.test(
  "Integration: read",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");
    const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { read: true, write: true });

    const containerA = read(File(`${Deno.cwd()}/dump/hoge`, new Uint8Array(5), _file.rid));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", 65,66,67,68,69, ${_file.rid}))`
    );

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
    Deno.close(_file.rid);
  }
);

Deno.test(
  "Integration: readAll",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");
    const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { read: true, write: true });

    const containerA = readAll(File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([]), _file.rid));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", 65,66,67,68,69, ${_file.rid}))`
    );

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
    Deno.close(_file.rid);
  }
);

Deno.test(
  "Integration: readNBytes",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");
    const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { read: true, write: true });

    const containerA = readNBytes(5, File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([]), _file.rid));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", 65,66,67,68,69, ${_file.rid}))`
    );

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
    Deno.close(_file.rid);
  }
);

Deno.test(
  "Integration: readFile",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await Deno.writeTextFile(`${Deno.cwd()}/dump/hoge`, "ABCDE");
    const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { read: true, write: true });

    const containerA = readFile(File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([]), _file.rid));
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", 65,66,67,68,69, ${_file.rid}))`
    );

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
    Deno.close(_file.rid);
  }
);

Deno.test(
  "Integration: remove",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await _emptyDir(`${Deno.cwd()}/dump`);
    const _file = await Deno.create(`${Deno.cwd()}/dump/hoge`);

    const containerA = remove({}, File.fromPath(`${Deno.cwd()}/dump/hoge`));
    const promiseA = containerA.run();

    assert(Task.is(containerA));
    assert(promiseA instanceof Promise);

    const containerB = await promiseA;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", , ${containerB[$$value].rid}))`
    );

    Deno.close(_file.rid);

    try {
      await Deno.lstat(`${Deno.cwd()}/dump/hoge`);
      assert(false, "Resource was not removed properly.");
    } catch (error) {}
  }
);

Deno.test(
  "Integration: rename",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    await _emptyDir(`${Deno.cwd()}/dump`);
    const _file = await Deno.create(`${Deno.cwd()}/dump/hoge`);

    const containerA = rename(`${Deno.cwd()}/dump/piyo`, File.fromPath(`${Deno.cwd()}/dump/hoge`));
    const promiseA = containerA.run();

    assert(Task.is(containerA));
    assert(promiseA instanceof Promise);

    const containerB = await promiseA;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/piyo", , ${containerB[$$value].rid}))`
    );

    const { isFile } = await Deno.lstat(`${Deno.cwd()}/dump/piyo`);
    assert(isFile);

    Deno.close(_file.rid);
    await Deno.remove(`${Deno.cwd()}/dump/piyo`);
  }
);

Deno.test(
  "Integration: write",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { create: true, read: true, write: true });

    const containerA = write(
      File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), _file.rid)
    );
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", 65,66,67,68,69, ${_file.rid}))`
    );

    Deno.close(_file.rid);

    {
      const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { create: true, read: true, write: true });

      const _buffer = await Deno.readAll(_file);

      assertEquals(
        _buffer,
        new Uint8Array([ 65, 66, 67, 68, 69 ])
      );

      Deno.close(_file.rid);
    }

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
  }
);

Deno.test(
  "Integration: writeAll",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { create: true, read: true, write: true });

    const containerA = writeAll(
      Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])),
      File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([]), _file.rid)
    );
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", 65,66,67,68,69, ${_file.rid}))`
    );

    Deno.close(_file.rid);

    {
      const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { create: true, read: true, write: true });

      const _buffer = await Deno.readAll(_file);

      assertEquals(
        _buffer,
        new Uint8Array([ 65, 66, 67, 68, 69 ])
      );

      Deno.close(_file.rid);
    }

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
  }
);

Deno.test(
  "Integration: writeFile",
  async () => {
    await _ensureDir(`${Deno.cwd()}/dump`);
    const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { create: true, read: true, write: true });

    const containerA = writeFile(
      {},
      File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), _file.rid)
    );
    const promise = containerA.run();

    assert(Task.is(containerA));
    assert(promise instanceof Promise);

    const containerB = await promise;

    assert(Either.Right.is(containerB));
    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", 65,66,67,68,69, ${_file.rid}))`
    );

    Deno.close(_file.rid);

    {
      const _file = await Deno.open(`${Deno.cwd()}/dump/hoge`, { create: true, read: true, write: true });

      const _buffer = await Deno.readAll(_file);

      assertEquals(
        _buffer,
        new Uint8Array([ 65, 66, 67, 68, 69 ])
      );

      Deno.close(_file.rid);
    }

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
  }
);



Deno.test(
  "Scenario 1",
  async () => {
    const writeNewFile = curry(
      (destinationFile, buffer) =>
        File.isOrThrow(destinationFile)
        && compose(
        chain(close),
        chain(writeAll(buffer)),
        create
        )(destinationFile)
    );

    assert(
      Task.is(writeNewFile(File.fromPath(`${Deno.cwd()}/dump/hoge`), Buffer.fromString("Hello Deno")))
    );

    const container = await writeNewFile(
      File.fromPath(`${Deno.cwd()}/dump/hoge`),
      Buffer.fromString("Hello Deno")
    )
      .run();

    assert(Either.Right.is(container));
    assertEquals(
      container.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/hoge", 72,101,108,108,111,32,68,101,110,111, ${container[$$value].rid}))`
    );

    await Deno.remove(`${Deno.cwd()}/dump/hoge`);
  }
);

Deno.test(
  "Scenario 2",
  async () => {
    await Deno.copyFile(`${Deno.cwd()}/library/fs.js`, `${Deno.cwd()}/dump/fs.js`);

    const serializeBuffer = buffer => new TextDecoder().decode(buffer);
    const deserializeBuffer = text => new TextEncoder().encode(text);

    const extractFunctionHeaders = compose(
      chain(
        chain(
          writeFile({})
        )
      ),
      converge(
        lift(copy({})),
        [
          compose(
            map(
              map(
                compose(
                  deserializeBuffer,
                  join("\n\n"),
                  map(
                    compose(
                      header => `\`${header}\``,
                      replace(/\/\/\s*/, ""),
                      trim
                    )
                  ),
                  match(/(?:\/\/\s*)([A-Za-z]+\s*::.*?)(?:\n)/g),
                  serializeBuffer
                )
              )
            ),
            readFile,
            File.fromPath,
          ),
          compose(
            Task.of,
            File.fromPath,
            replace(/\.(js|ts)$/, ".md")
          )
        ]
      )
    );

    assert(Task.is(extractFunctionHeaders(`${Deno.cwd()}/dump/fs.js`)));

    const container = await extractFunctionHeaders(`${Deno.cwd()}/dump/fs.js`).run();

    assert(Either.Right.is(container));

    const { isFile } = await Deno.lstat(`${Deno.cwd()}/dump/fs.md`);
    assert(isFile);

    await Deno.remove(`${Deno.cwd()}/dump/fs.js`);
    await Deno.remove(`${Deno.cwd()}/dump/fs.md`);
  }
);

Deno.test(
  "Scenario 3",
  async () => {
    const copyFile = lift(flip(concat));

    const containerA = copyFile(
      Task.of(File(`${Deno.cwd()}/dump/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3)),
      Task.of(File(`${Deno.cwd()}/dump/piyo`, new Uint8Array([]), 4))
    );

    assert(Task.is(containerA));

    const containerB = await containerA.run();

    assertEquals(
      containerB.toString(),
      `Either.Right(File("${Deno.cwd()}/dump/piyo", 65,66,67,68,69, 4))`
    );
  }
);

import Response from "./Response.js";

Deno.test(
  "Scenario 4",
  async () => {
    const container = compose(
      lift(Response.OK({ ["Content-Type"]: "application/json" })),
      _ => Task.of(new Uint8Array([ 65, 66, 67, 68, 69 ]))
    )(File.fromPath(`${Deno.cwd()}/hoge`));

    assert((await container.run()).extract().headers.status === 200);
  }
);

Deno.test(
  "Scenario 5",
  async () => {
    const fetchBacon = compose(
      chain(writeFile({})),
      ap(
        useWith(
          lift(factorizeFile(__, __, 0)),
          [
            compose(
              Task.of,
              name => `${Deno.cwd()}/${name}.html`,
              prop(1),
              match(/\?type=([A-Za-z\-]+)/),
              path([ "headers", "url" ])
            ),
            map(prop("raw"))
          ]
        ),
        fetch
      )
    );

    const container = await fetchBacon(
      Request.get("https://baconipsum.com/api/?type=all-meat&paras=3&start-with-lorem=1&format=html")
    ).run();

    const file = safeExtract("Failed to write file.", container);

    assert(File.is(file));

    await Deno.remove(`${Deno.cwd()}/all-meat.html`);
  }
);
