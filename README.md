<img src=".github/fl-word_art-io-reverse.svg" alt="Functional IO" width="450" />

IO methods as valid Task monads perfect to write great point-free software in JavaScript that is compatible with most 
modern browsers and Deno.

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno&labelColor=black)](https://deno.land/x/functional_io@v1.0.0)
[![deno version](https://img.shields.io/badge/deno-^1.5.4-lightgrey?logo=deno)](https://github.com/denoland/deno)
[![GitHub release](https://img.shields.io/github/v/release/sebastienfilion/functional-io)](https://github.com/sebastienfilion/functional-io/releases)
[![GitHub licence](https://img.shields.io/github/license/sebastienfilion/functional-io)](https://github.com/sebastienfilion/functional-io/blob/v1.0.0/LICENSE)

  * [Buffer](#buffer)
  * [Directory](#directory)
  * [File](#file)
  * [FileSystemCollection](#file-system-collection)
  * [Request](#request)
  * [Resource](#resource)
  * [Response](#response)
  * [URL](#url)
  * [File System](#file-system)
  * [Browser Safe](#browser-safe)
  
# Usage

This example uses the [Ramda library](https://ramdajs.com) - for simplification - but you should be able to use any 
library that implements the [Fantasy-land specifications](https://github.com/fantasyland/fantasy-land). 

```js
import { compose, chain, curry } from "https://x.nest.land/ramda@0.27.0/source/index.js";
import Either from "https://deno.land/x/functional@v1.2.1/library/Either.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";
import Buffer from "https://deno.land/x/functional_io@v1.0.0/library/Buffer.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import { close, writeAll, create } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";

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

## Buffer

The `Buffer` is the most basic type; it only has one attribute which is a typed array named "raw".
Any type that share the raw attribute is composable with `Buffer` (and each other) and interoperable.

The `Buffer` type implements the following algebras:
- [x] Group
- [x] Comonad
- [x] Monad

### Example

```js
const buffer = Buffer.fromString("Hoge").concat(Buffer.fromString("Fuga"));

assert(Buffer.is(buffer));
```

## Directory

The `Directory` type represents a directory on the file system. It is the only type with the same shape as `URL`.
It has only one attributes: the path of the directory.
A `Directory` is interoperable with a `URL` or a `File`.
It also has interoperability with a `File` through the `FileSystemCollection` type.

The `Directory` type implements the following algebras:
- [x] Ord
- [x] Comonad
- [x] Monad

### Example

```js
assert(Directory(`${Deno.cwd()}/hoge`).lte(Directory(`${Deno.cwd()}/piyo`)));
```

## File

The `File` type extends the `Resource` type. It represents a file with a path.
It has three attributes: the first is the path of the file, the second is a typed array named "raw" and the last
is the Resource ID (`rid`).
A `File` is composable and interoperable with a `Resource` or a `Buffer` -- It also has some interoperability with a
`Location` through the `FileSystemCollection`.

The `File` type implements the following algebras:
- [x] Group
- [x] Bifunctor
- [x] Comonad
- [x] Monad

### Example

```js
const file = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3)
  .concat(File(`${Deno.cwd()}/piyo`, new Uint8Array([ 70, 71, 72, 73, 74 ]), 3));

assert(File.is(file));
```

## File System Collection

The `FileSystemCollection` is represents a collection of `Location`, namely of `Directory` and `File`. This of it
as an Array for those types.

The `FileSystemCollection` type implements the following algebras:
- [x] Group
- [x] Comonad
- [x] Monad
- [x] Traversable

⚠️ *The `FileSystemCollection` type as a **traversable** is experimental.* 

### Example

```js
const containerA = Maybe.Just(42).map(x => x + 2);
const containerB = Maybe.Nothing.map(x => x + 2);

assert(Maybe.Just.is(containerA));
assert(containerA.extract() === 44);
assert(Maybe.Nothing.is(containerB));
```

## Request

The `Request` represent a HTTP request.
It has two attributes: the first is an object for the response "header" and the second is a typed array named "raw".
The `Request` type is mostly interoperable with `Resource`, `File` and `Response`.

The `Resource` type implements the following algebras:
- [x] Group
- [x] Bifunctor
- [x] Monad

### Example

```js
const request = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]))
  .concat(Resource(new Uint8Array([ 70, 71, 72, 73, 74 ]), 3));

assert(Request.is(request));
```

#### Utilities

The `Request` namespace comes with 4 methods for convenience to create an instance of `Request` with a common verb.
The methods are curried when necessary. `Object -> Unint8Array -> Response`

```js
const container = compose(
  lift(Request.post({ ["Content-Type"]: "application/json" })),
  readFile
)(File.fromPath(`${Deno.cwd()}/hoge`));

assert((await container.run()).extract().headers.method === "POST");
```

| Method name            | Has 2 arguments |
|------------------------|-----------------|
| `delete` / `DELETE`    | false           |
| `get` / `GET`          | false           |
| `post` / `POST`        | true            |
| `put` / `PUT`          | true            |

✢ *The capitalized version of the methods were added because `delete` is a TypeScript reserved word.*

## Resource

The `Resource` type extends the `Buffer` type. It represents a system resource with a handle, eg: STDOUT, STDIN or a
file. It has two attributes: the first is a typed array named "raw" and the second is the Resource ID (`rid`).
Any type that share the `Resource` attributes is composable and interoperable.

The `Resource` type implements the following algebras:
- [x] Group
- [x] Bifunctor
- [x] Comonad
- [x] Monad

### Example

```js
const resource = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3)
  .concat(Resource(new Uint8Array([ 70, 71, 72, 73, 74 ]), 3));

assert(Resource.is(resource));
```

## Response

The `Response` represent a HTTP response.
It has two attributes: the first is an object for the response "header" and the second is a typed array named "raw".
The `Response` type is mostly interoperable with `Resource`, `File` and `Request`.

The `Resource` type implements the following algebras:
- [x] Alternative
- [x] Group
- [x] Bifunctor
- [x] Monad

### Example

```js
const response = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]))
  .concat(Resource(new Uint8Array([ 70, 71, 72, 73, 74 ]), 3));

assert(Response.is(response));
```

#### Utilities

The `Response` namespace comes with 38 methods for convenience to create an instance of `Response` with a common
status.
The methods are curried: `Object -> Uint8Array -> Response`

```js
const container = compose(
  lift(Response.OK({ ["Content-Type"]: "application/json" })),
  readFile
)(File.fromPath(`${Deno.cwd()}/hoge`));

assert((await container.run()).extract().headers.status === 200);
```

| Method name           | Status |
|-----------------------|--------|
| `OK`                  | 200    |
| `Created`             | 201    |
| `Accepted`            | 202    |
| `NoContent`           | 204    |
| `MultipleChoice`      | 300    |
| `MovePermanently`     | 301    |
| `Found`               | 302    |
| `NotModified`         | 304    |
| `TemporaryRedirect`   | 307    |
| `PermanentRedirect`   | 308    |
| `BadRequest`          | 400    |
| `Unauthorized`        | 401    |
| `Forbidden`           | 403    |
| `NotFound`            | 404    |
| `MethodNotAllowed`    | 405    |
| `NotAcceptable`       | 406    |
| `RequestTimeout`      | 408    |
| `Conflict`            | 409    |
| `Gone`                | 410    |
| `ImATeapot`           | 418    |
| `InternalServerError` | 500    |
| `NotImplemented`      | 501    |
| `BadGateway`          | 502    |
| `ServiceUnavailable`  | 503    |
| `GatewayTimeout`      | 504    |
| `PermissionDenied`    | 550    |

## URL

The `URL` type represents an URL; either of a location on the file system or on a remote server.
It has only one attributes: the path of the URL.
A `URL` is interoperable with a `File` or a `Directory`.
It also has interoperability with a `File` or a `Directory` through the `FileSystemCollection` type.

The `URL` type implements the following algebras:
- [x] Ord
- [x] Comonad
- [x] Monad

### Example

```js
assert(URL(`${Deno.cwd()}/hoge`).lte(URL(`${Deno.cwd()}/piyo`)));
```

## File System

**⚠️ Note** `Deno.cwd` is used in the following example; if you use `Deno.cwd` to compose your paths, your functions
are no longer pure. 

### `chdir` [📕](https://doc.deno.land/builtin/stable#Deno.chdir)

Change the current working directory to the specified path.

`chdir :: Directory a -> Task e Directory a`

```js
import { chdir } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Directory from "https://deno.land/x/functional_io@v1.0.0/library/Directory.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = chdir(Directory(".."));

assert(Task.is(container));
```

### `chmod` [📕](https://doc.deno.land/builtin/stable#Deno.chmod)

Changes the permission of a specific file/directory of specified path. Ignores the process's umask.  

`chmod :: Number -> Location a -> Task e Location a`

```js
import { chmod } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = chmod(0o000, File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `chown` [📕](https://doc.deno.land/builtin/stable#Deno.chown)

Change owner of a regular file or directory. This functionality is not available on Windows.

`chown :: Number -> Number -> Location a -> Task e Location a`

```js
import { chown } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = chown(null, null, File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `close` [📕](https://doc.deno.land/builtin/stable#Deno.close)

Close the given resource which has been previously opened, such as via opening or creating a file. 
Closing a file when you are finished with it is important to avoid leaking resources.  

`close :: File a -> Task e File a`

```js
import { close } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = close(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `copy` [📕](https://doc.deno.land/builtin/stable#Deno.copy)

Copies from a source to a destination until either EOF (null) is read from the source, or an error occurs. 

`copy :: Options -> Buffer a -> Buffer b -> Task e Buffer a`

```js
import { copy } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Buffer from "https://deno.land/x/functional_io@v1.0.0/library/Buffer.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = copy({}, Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])), Buffer(new Uint8Array([])));

assert(Task.is(container));
```

### `copyFile` [📕](https://doc.deno.land/builtin/stable#Deno.copyFile)

Copies the contents and permissions of one file to another specified file, by default creating a new file if needed, 
else overwriting. Fails if target path is a directory or is unwritable.

`copyFile :: File a -> File b -> Task e File b`

```js
import { copyFile } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = copyFile(File.fromPath(`${Deno.cwd()}/hoge`), File.fromPath(`${Deno.cwd()}/piyo`));

assert(Task.is(container));
```

### `create` [📕](https://doc.deno.land/builtin/stable#Deno.create)

Creates a file if none exists or truncates an existing file.

`create :: File a -> Task e File a`

```js
import { create } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = create(File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `cwd` [📕](https://doc.deno.land/builtin/stable#Deno.cwd)

Return a Directory representation of the current working directory.

`cwd :: () -> Task e Directory a`

```js
import { cwd } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = cwd();

assert(Task.is(container));
```

### `emptyDir` [📕](https://deno.land/std@0.79.0/fs#emptydir)

Ensures that a directory is empty. Deletes directory contents if the directory is not empty.
If the directory does not exist, it is created. The directory itself is not deleted.

`emptyDir :: Directory a -> Task e Directory a`

```js
import { emptyDir } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Directory from "https://deno.land/x/functional_io@v1.0.0/library/Directory.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = emptyDir(Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `ensureDir` [📕](https://deno.land/std@0.79.0/fs#ensuredir)

Ensures that the directory exists. If the directory structure does not exist, it is created. Like `mkdir -p`.

`ensureDir :: Directory a -> Task e Directory a`

```js
import { ensureDir } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Directory from "https://deno.land/x/functional_io@v1.0.0/library/Directory.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = emptyDir(Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `exists` [📕](https://deno.land/std@0.79.0/fs#exists)

Test whether the given path exists by checking with the file system. 
If the file or directory doesn't exist, it will resolve to `Either.Left(null)`.

`exists :: Location a -> Task null Location a`

```js
import { exists } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Directory from "https://deno.land/x/functional_io@v1.0.0/library/Directory.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = exists(Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `mkdir` [📕](https://deno.land/std@0.79.0/fs#mkdir)

Creates a new directory with the specified path.

`mkdir :: Options -> Directory a -> Task e Directory a`

```js
import { mkdir } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Directory from "https://deno.land/x/functional_io@v1.0.0/library/Directory.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = mkdir({}, Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `move` [📕](https://deno.land/std@0.79.0/fs#move)

Moves a file or directory.

`move :: Options -> String -> Location a -> Task e Location b`

```js
import { move } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Directory from "https://deno.land/x/functional_io@v1.0.0/library/Directory.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = move({}, `${Deno.cwd()}/piyo`, Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `open` [📕](https://doc.deno.land/builtin/stable#Deno.open)

Open a file and resolve to an instance of File. The file does not need to previously exist if using the create or
createNew open options. It is the callers responsibility to close the file when finished with it.

`open :: Options -> File a -> Task e File a`

```js
import { open } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Directory from "https://deno.land/x/functional_io@v1.0.0/library/Directory.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = open({ read: true, write: true }, File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `read` [📕](https://doc.deno.land/builtin/stable#Deno.read)

Read from a Resource given it has a non-zero raw buffer.

`read :: Resource a -> Task e Resource a`

```js
import { read } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = read(File(`${Deno.cwd()}/hoge`, new Uint8Array(5), 3));

assert(Task.is(container));
```

### `readAll` [📕](https://doc.deno.land/builtin/stable#Deno.readAll)

Read from a Resource.

`readAll :: Resource a -> Task e Resource a`

```js
import { readAll } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Buffer from "https://deno.land/x/functional_io@v1.0.0/library/Buffer.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = readAll(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `rename` [📕](https://doc.deno.land/builtin/stable#Deno.rename)

Renames a file or directory. 

`rename :: String -> Location a -> Task e Location b`

```js
import { rename } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Directory from "https://deno.land/x/functional_io@v1.0.0/library/Directory.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = rename(`${Deno.cwd()}/piyo`, Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `write` [📕](https://doc.deno.land/builtin/stable#Deno.write)

Write to a Resource given it has a non-zero raw buffer.

`write :: Resource a -> Task e Resource a`

```js
import { write } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = write(
  File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), _file.rid)
);

assert(Task.is(container));
```

### `writeAll` [📕](https://doc.deno.land/builtin/stable#Deno.writeAll)

Write all to a Resource from a Buffer.

`writeAll :: Buffer b -> Resource a -> Task e Resource b`

```js
import { writeAll } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Buffer from "https://deno.land/x/functional_io@v1.0.0/library/Buffer.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

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
import { writeFile } from "https://deno.land/x/functional_io@v1.0.0/library/fs.js";
import Buffer from "https://deno.land/x/functional_io@v1.0.0/library/Buffer.js";
import File from "https://deno.land/x/functional_io@v1.0.0/library/File.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const container = writeFile(
  {},
  File(`${Deno.cwd()}/hoge`, new Uint8Array([]), _file.rid)
);

assert(Task.is(container));
```      

## Browser Safe

### `fetch`

Fetches a resource on a local/remote server.

`fetch :: Request a -> Task e Response b`

```js
import { fetch } from "https://deno.land/x/functional_io@v1.0.0/library/browser-safe.js";
import Request from "https://deno.land/x/functional_io@v1.0.0/library/Request.js";
import Response from "https://deno.land/x/functional_io@v1.0.0/library/Response.js";
import Task from "https://deno.land/x/functional@v1.2.1/library/Task.js";

const containerA = fetch(Request.GET("http://localhost:8000"));

assert(Task.is(containerA));

const containerB = await container.run().extract();

assert(Response.Success.is(containerB));
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
