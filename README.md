# Functional Deno IO

Deno IO methods as valid Task monads perfect to write great point-free software in JavaScript.

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno&labelColor=black)](https://deno.land/x/functional-deno-io@v0.1.0)
[![deno version](https://img.shields.io/badge/deno-^1.3.2-lightgrey?logo=deno)](https://github.com/denoland/deno)
[![GitHub release](https://img.shields.io/github/v/release/sebastienfilion/functional-deno-io)](https://github.com/sebastienfilion/functional-deno-io/releases)
[![GitHub licence](https://img.shields.io/github/license/sebastienfilion/functional-deno-io)](https://github.com/sebastienfilion/functional-deno-io/blob/v0.1.0/LICENSE)

  * [File System](#file-system)
  
# Usage

This example uses the [Ramda library](https://ramdajs.com) - for simplification - but you should be able to use any library that implements
the [Fantasy-land specifications](https://github.com/fantasyland/fantasy-land). 

```js
import { compose, chain, curry } from "https://x.nest.land/ramda@0.27.0/source/index.js";
import Either from "https://deno.land/x/functional@v0.5.2/Either.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";
import { Buffer, File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import { close, writeAll, create } from "https://deno.land/x/functional_io@v0.2.0/fs.js";

const writeNewFile = curry(
  (buffer, destinationFile) =>
    File.isOrThrow(destinationFile)
    && compose(
      chain(close),
      chain(writeAll(buffer)),
      create
    )(destinationFile)
);

// Calling `writeNewFile` results in an instance of `Task` keeping the function pure.
assert(
  Task.is(writeNewFile(File.fromPath(`${Deno.cwd()}/hoge`), Buffer.fromString("Hello Deno")))
);

// Finally, calling `Task#run` will call copy to the new file and return a promise
writeNewFile(File.fromPath(`${Deno.cwd()}/hoge`), Buffer.fromString("Hello Deno")).run()
  .then(container => {
    // The returned value should be an instance of `Either.Right` or `Either.Left`
    assert(Either.Right.is(container));
    // Forcing to coerce the container to string will show that the final value is our File representation.
    assert(container.toString(), `Either.Right(File("${Deno.cwd()}/piyo", ...))`);
  });

// await copyToNewFile(sourceFile, destinationFile).run() === Either.Right(File a)
```

## File System

**⚠️ Note** `Deno.cwd` is used in the following example; if you use `Deno.cwd` to compose your paths, your functions
are no longer pure.  

### `Buffer` type

The `Buffer` type represents a data buffer.

```js
import { Buffer } from "https://deno.land/x/functional_io@v0.2.0/types.js";

const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
```

#### `Buffer#fromString`

The method creates a `Buffer` from a string.

```js
const container = Buffer.fromString("ABCDE");
```

This implementation of Buffer is a valid [`Functor`](https://github.com/fantasyland/fantasy-land#functor).

### `Directory` type

The `Directory` type represents a directory on the file system.  

It's only property is its path.  

A Directory is a valid Location.

```js
import { Directory } from "https://deno.land/x/functional_io@v0.2.0/types.js";

const container = Directory(`${Deno.cwd()}/hoge`);
```

This implementation of Directory is a valid [`Functor`](https://github.com/fantasyland/fantasy-land#functor) and
[`Monad`](https://github.com/fantasyland/fantasy-land#monad).

### `File` type

The `File` type represents a file on the file system.  

It has 3 properties: a path, a buffer and a rid.

A File is a valid Location and Resource.

```js
import { File } from "https://deno.land/x/functional_io@v0.2.0/types.js";

const container = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
```

This implementation of Directory is a valid [`Functor`](https://github.com/fantasyland/fantasy-land#functor) and
[`Monad`](https://github.com/fantasyland/fantasy-land#monad).

### `chdir` [📕](https://doc.deno.land/builtin/stable#Deno.chdir)

Change the current working directory to the specified path.

`chdir :: Directory a -> Task e Directory a`

```js
import { chdir } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Directory } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = chdir(Directory(".."));

assert(Task.is(container));
```

### `chmod` [📕](https://doc.deno.land/builtin/stable#Deno.chmod)

Changes the permission of a specific file/directory of specified path. Ignores the process's umask.  

`chmod :: Number -> File a -> Task e File a`

```js
import { chmod } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = chmod(0o000, File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `chown` [📕](https://doc.deno.land/builtin/stable#Deno.chown)

Change owner of a regular file or directory. This functionality is not available on Windows.

`chown :: Number -> Number -> File a -> Task e File a`

```js
import { chown } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = chown(null, null, File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `close` [📕](https://doc.deno.land/builtin/stable#Deno.close)

Close the given resource which has been previously opened, such as via opening or creating a file. 
Closing a file when you are finished with it is important to avoid leaking resources.  

`copy :: File a -> Task e File a`

```js
import { close } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = close(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `copy` [📕](https://doc.deno.land/builtin/stable#Deno.copy)

Copies from a source to a destination until either EOF (null) is read from the source, or an error occurs. 

`copy :: Options -> Buffer a -> Buffer b -> Task e Writer b`

```js
import { copy } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Buffer } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = copy({}, Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])), Buffer(new Uint8Array([])));

assert(Task.is(container));
```

### `copyFile` [📕](https://doc.deno.land/builtin/stable#Deno.copyFile)

Copies the contents and permissions of one file to another specified file, by default creating a new file if needed, 
else overwriting. Fails if target path is a directory or is unwritable.

`copyFile :: File a -> File b -> Task e File b`

```js
import { copyFile } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = copyFile(File.fromPath(`${Deno.cwd()}/hoge`), File.fromPath(`${Deno.cwd()}/piyo`));

assert(Task.is(container));
```

### `create` [📕](https://doc.deno.land/builtin/stable#Deno.create)

Creates a file if none exists or truncates an existing file.

`create :: File a -> Task e File a`

```js
import { create } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = create(File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `cwd` [📕](https://doc.deno.land/builtin/stable#Deno.cwd)

Return a Directory representation of the current working directory.

`cwd :: () -> Task e Directory a`

```js
import { cwd } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = cwd();

assert(Task.is(container));
```

### `emptyDir` [📕](https://deno.land/std@0.68.0/fs#emptydir)

Ensures that a directory is empty. Deletes directory contents if the directory is not empty.
If the directory does not exist, it is created. The directory itself is not deleted.

`emptyDir :: Directory a -> Task e Directory a`

```js
import { emptyDir } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Directory } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = emptyDir(Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `ensureDir` [📕](https://deno.land/std@0.68.0/fs#ensuredir)

Ensures that the directory exists. If the directory structure does not exist, it is created. Like `mkdir -p`.

`ensureDir :: Directory a -> Task e Directory a`

```js
import { ensureDir } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Directory } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = emptyDir(Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `exists` [📕](https://deno.land/std@0.68.0/fs#exists)

Test whether the given path exists by checking with the file system. 
If the file or directory doesn't exist, it will resolve to `Either.Left(null)`.

`exists :: Location a -> Task null Location a`

```js
import { exists } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Directory } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = exists(Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `mkdir` [📕](https://deno.land/std@0.68.0/fs#mkdir)

Creates a new directory with the specified path.

`mkdir :: Options -> Directory a -> Task e Directory a`

```js
import { mkdir } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Directory } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = mkdir({}, Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `move` [📕](https://deno.land/std@0.68.0/fs#move)

Moves a file or directory.

`move :: Options -> String -> Location a -> Task e Location b`

```js
import { move } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Directory } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = move({}, `${Deno.cwd()}/piyo`, Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `open` [📕](https://doc.deno.land/builtin/stable#Deno.open)

Open a file and resolve to an instance of File. The file does not need to previously exist if using the create or
createNew open options. It is the callers responsibility to close the file when finished with it.

`open :: Options -> File a -> Task e File a`

```js
import { open } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Directory } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = open({ read: true, write: true }, File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `read` [📕](https://doc.deno.land/builtin/stable#Deno.read)

Read from a Resource given it has a non-zero raw buffer.

`read :: Resource a -> Task e Resource a`

```js
import { read } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = read(File(`${Deno.cwd()}/hoge`, new Uint8Array(5), 3));

assert(Task.is(container));
```

### `readAll` [📕](https://doc.deno.land/builtin/stable#Deno.readAll)

Read from a Resource.

`readAll :: Resource a -> Task e Resource a`

```js
import { readAll } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Buffer, File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = readAll(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `rename` [📕](https://doc.deno.land/builtin/stable#Deno.rename)

Renames a file or directory. 

`rename :: String -> Location a -> Task e Location b`

```js
import { rename } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Directory } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = rename(`${Deno.cwd()}/piyo`, Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `write` [📕](https://doc.deno.land/builtin/stable#Deno.write)

Write to a Resource given it has a non-zero raw buffer.

`write :: Resource a -> Task e Resource a`

```js
import { write } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = write(
  File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), _file.rid)
);

assert(Task.is(container));
```

### `writeAll` [📕](https://doc.deno.land/builtin/stable#Deno.writeAll)

Write all to a Resource from a Buffer.

`writeAll :: Buffer b -> Resource a -> Task e Resource b`

```js
import { writeAll } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Buffer, File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = writeAll(
  Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])),
  File(`${Deno.cwd()}/hoge`, new Uint8Array([]), _file.rid)
);

assert(Task.is(container));
```

### `writeFile` [📕](https://doc.deno.land/builtin/stable#Deno.writeFile)

Write a File to the file system.

`writeFile :: Options -> File a -> Task e File b`

```js
import { writeFile } from "https://deno.land/x/functional_io@v0.2.0/fs.js";
import { Buffer, File } from "https://deno.land/x/functional_io@v0.2.0/types.js";
import Task from "https://deno.land/x/functional@v0.5.2/Task.js";

const container = writeFile(
  {},
  File(`${Deno.cwd()}/hoge`, new Uint8Array([]), _file.rid)
);

assert(Task.is(container));
```
 
## Deno

This codebase uses [Deno](https://deno.land/#installation).

### MIT License

Copyright © 2020 - Sebastien Filion

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
