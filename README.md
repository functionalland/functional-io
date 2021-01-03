<img src="./.github/fl-logo.svg" alt="Functional IO" width="450" />

IO methods as valid Task monads perfect to write great point-free software in JavaScript that is compatible with most modern browsers and Deno.

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno&labelColor=black)](https://deno.land/x/functional_io@v1.1.0)
[![deno version](https://img.shields.io/badge/deno-^1.6.1-lightgrey?logo=deno)](https://github.com/denoland/deno)
[![GitHub release](https://img.shields.io/github/v/release/sebastienfilion/functional-io)](https://github.com/sebastienfilion/functional-io/releases)
[![GitHub licence](https://img.shields.io/github/license/sebastienfilion/functional-io)](https://github.com/sebastienfilion/functional-io/blob/v1.1.0/LICENSE)
[![Discord Chat](https://img.shields.io/discord/790708610023555093.svg)](https://discord.gg/)

  * [Buffer](#buffer)
  * [Directory](#directory)
  * [File](#file)
  * [File System Collection](#file-system-collection)
  * [Request](#request)
  * [Resource](#resource)
  * [Response](#response)
  * [URL](#url)
  * [Browser safe](#browser-safe)
  * [File System](#file-system)
  * [Utilities](#utilities)
  * [TypeScript](#typescript)

# Usage

This example uses the [Ramda library](https://ramdajs.com) - for simplification - but you should be able to use any
library that implements the [Fantasy-land specifications](https://github.com/fantasyland/fantasy-land).

```js
import { __, ap, chain, compose, lift, map, match, path, prop, useWith } from "https://deno.land/x/ramda@v0.27.2/mod.ts";
import Task from "https://deno.land/x/functional@v1.3.3/library/Task.js";
import { safeExtract } from "https://deno.land/x/functional@v1.3.3/library/utilities.js";
import Request from "https://deno.land/x/functional_io@v1.1.0/library/Request.js";
import { factorizeFile } from "https://deno.land/x/functional_io@v1.1.0/library/File.js";
import { fetch } from "https://deno.land/x/functional_io@v1.1.0/library/browser_safe.js";
import { writeFile } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

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

const container = fetchBacon(
  Request.get("https://baconipsum.com/api/?type=all-meat&paras=3&start-with-lorem=1&format=html")
);

// Calling `fetchBacon` results in an instance of `Task` keeping the function pure.
assert(Task.is(container));

const file = safeExtract("Failed to write file.", await container.run());

assert(File.is(file));
```

### Using the bundle

As a convenience, when using Functional IO in the browser, you can use the **unminified** bundled copy (18KB gzipped).

```js
import { Task, safeExtract } from "https://deno.land/x/functional@v1.3.3/functional.js";
import { Request, Response, fetch } from "https://deno.land/x/functional_io@v1.1.0/functional-io.js";

const container = fetch(
  Request.get("https://baconipsum.com/api/?type=all-meat&paras=3&start-with-lorem=1&format=html")
);

assert(Task.is(container));

const response = safeExtract("Failed to fetch resource.", await container.run());

assert(Response.is(response));
```

---

## Buffer

The `Buffer` is the most basic type; it only has one attribute which is a typed array named "raw".
Any type that share the raw attribute is composable with `Buffer` (and each other) and interoperable.

The `Buffer` type implements the following algebras:
- [x] Group
- [x] Comonad
- [x] Monad

### Example

```js
import Buffer from "https://deno.land/x/functional_io@v1.1.0/library/Buffer.js";

const buffer = Buffer.fromString("hoge").concat(Buffer.fromString("fuga"));

assert(Buffer.is(buffer));
```

---

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

---

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

---

## File System Collection

The `FileSystemCollection` is represents a collection of `Location`, namely of `Directory` and `File`. This of it
as an Array for those types.

The `FileSystemCollection` type implements the following algebras:
- [x] Group
- [x] Comonad
- [x] Monad
- [x] Traversable

### Example

```js
const containerA = Maybe.Just(42).map(x => x + 2);
const containerB = Maybe.Nothing.map(x => x + 2);

assert(Maybe.Just.is(containerA));
assert(containerA.extract() === 44);
assert(Maybe.Nothing.is(containerB));
```

---

File Group algebra law "Left identity" and "Right identity" is not respected because the rid can't be modified
without using bimap.

---

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
The methods are curried when necessary. `Object → Unint8Array → Response`

```js
const container = compose(
  lift(Request.post({ ["Content-Type"]: "application/json" })),
  readFile
)(File.fromPath(`${Deno.cwd()}/hoge`));

assert((await container.run()).extract().headers.method === "POST");
```

| Method name            | Has 2 arguments |
|------------------------|-----------------|
| `delete` | `DELETE`    | false           |
| `get` | `GET`          | false           |
| `post` | `POST`        | true            |
| `put` | `PUT`          | true            |

✢ *The capitalized version of the methods were added because `delete` is a TypeScript reserved word.*

---

Request Semigroup algebra law "Left identity" is not respected because the headers can't be modified without using
bimap.

Request Monoid algebra law "Left identity" is not respected because the headers can't be modified without using
bimap.

Request Group algebra law "Left identity" and "Right identity" is not respected because the headers can't be
modified without using bimap.

Request Modnad algebra law "Right identity" is not respected because the headers can't be modified without using
bimap.

Request Applicative algebra law "Interchange" is not respected because the headers can't be modified without using
bimap.

---

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

---

Resource Monoid algebra law "Left identity" is not respected because the rid can't be modified without using
bimap.

Resource Group algebra law "Left identity" and "Right identity" is not respected because the rid can't be modified
without using bimap.

Resource Modnad algebra law "Right identity" is not respected because the rid can't be modified without using
bimap.

Resource Applicative algebra law "Interchange" is not respected because the rid can't be modified without using
bimap.

---

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
The methods are curried: `Object → Uint8Array → Response`

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

---

Response Semigroup algebra law "Left identity" is not respected because the headers can't be modified without using
bimap.

Response Monoid algebra law "Left identity" is not respected because the headers can't be modified without using
bimap.

Response Group algebra law "Left identity" and "Right identity" is not respected because the headers can't be
modified without using bimap.

Response Modnad algebra law "Right identity" is not respected because the headers can't be modified without using
bimap.

Response Applicative algebra law "Interchange" is not respected because the headers can't be modified without using
bimap.

---

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

---

## Browser safe

### `pureFetch`
`Request → Task e Response`

Fetches a resource on a local/remote server.

```js
import { fetch } from "https://deno.land/x/functional_io@v1.1.0/library/browser-safe.js";

const containerA = fetch(Request.GET("http://localhost:8000"));

assert(Task.is(containerA));

const containerB = await container.run().extract();

assert(Response.Success.is(containerB));
```

---

## File System

**⚠️ Note** `Deno.cwd` is used in the following example; if you use `Deno.cwd` to compose your paths, your functions
are no longer pure.

### `chdir` [📕](https://doc.deno.land/builtin/stable#Deno.chdir)
`Directory → Task e Directory`

Change the current working directory to the specified path.

```js
import { chdir } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = chdir(Directory(".."));

assert(Task.is(container));
```

### `chmod` [📕](https://doc.deno.land/builtin/stable#Deno.chmod)
`Number → File → Task e File`

Changes the permission of a specific file/directory of specified path. Ignores the process's umask.

```js
import { chmod } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = chmod(0o000, File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `chown` [📕](https://doc.deno.land/builtin/stable#Deno.chown)
`Number → Number → File → Task e File`

Change owner of a regular file or directory. This functionality is not available on Windows.

```js
import { chown } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = chown(null, null, File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `close` [📕](https://doc.deno.land/builtin/stable#Deno.close)
`Resource → Task e Resource`

Close the given resource which has been previously opened, such as via opening or creating a file.
Closing a file when you are finished with it is important to avoid leaking resources.

```js
import { close } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = close(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `copy` [📕](https://doc.deno.land/builtin/stable#Deno.copy)
`Object → Buffer a → Buffer b → Task e Buffer b`

Copies from a source to a destination until either EOF (null) is read from the source, or an error occurs.

```js
import { copy } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = copy({}, Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])), Buffer(new Uint8Array([])));

assert(Task.is(container));
```

### `copyFile` [📕](https://doc.deno.land/builtin/stable#Deno.copyFile)
`File a → File b → Task e File b`

Copies the contents and permissions of one file to another specified file, by default creating a new file if needed,
else overwriting. Fails if target path is a directory or is unwritable.

```js
import { copyFile } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = copyFile(File.fromPath(`${Deno.cwd()}/hoge`), File.fromPath(`${Deno.cwd()}/piyo`));

assert(Task.is(container));
```

### `create` [📕](https://doc.deno.land/builtin/stable#Deno.create)
`File → Task e File`

Creates a file if none exists or truncates an existing file.

```js
import { create } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = create(File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `cwd` [📕](https://doc.deno.land/builtin/stable#Deno.cwd)

Return a Directory representation of the current working directory.
`() → Task e Directory`

```js
import { cwd } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = cwd();

assert(Task.is(container));
```

### `ensureDir` [📕](https://deno.land/std@0.79.0/fs#ensuredir)
`Directory → Task e Directory`

Ensures that the directory exists. If the directory structure does not exist, it is created. Like `mkdir -p`.

```js
import { ensureDir } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = emptyDir(Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `exists` [📕](https://deno.land/std@0.79.0/fs#exists)
`URL → Task e|null URL

Test whether the given path exists by checking with the file system.
If the file or directory doesn't exist, it will resolve to `Either.Left(null)`.

```js
import { exists } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = exists(Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `mkdir` [📕](https://deno.land/std@0.79.0/fs#mkdir)
`Object → Directory → Task e Directory`

Creates a new directory with the specified path.

```js
import { mkdir } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = mkdir({}, Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `move` [📕](https://deno.land/std@0.79.0/fs#move)
`Object → String → URL → Task e URL`

Moves a file or directory.

```js
import { move } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = move({}, `${Deno.cwd()}/piyo`, Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `open` [📕](https://doc.deno.land/builtin/stable#Deno.open)
`Object → File → Task e File`

Open a file and resolve to an instance of File. The file does not need to previously exist if using the create or
createNew open options. It is the callers responsibility to close the file when finished with it.

```js
import { open } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = open({ read: true, write: true }, File.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `read` [📕](https://doc.deno.land/builtin/stable#Deno.read)
`Resource Task e Resource`

Read from a Resource given it has a non-zero raw buffer.

```js
import { read } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = read(File(`${Deno.cwd()}/hoge`, new Uint8Array(5), 3));

assert(Task.is(container));
```

### `readLine`
`Resource → Task e Resource`

Read from a Resource to the CLRF.

```js
import { readLine } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = readLine(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `readNBytes`
`Number → Resource → Task e Resource`

Read N bytes from a Resource.

```js
import { readNBytes } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = readNBytes(5, File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `readOneByte`
`Resource → Task e Resource`

Read 1 byte from a Resource.

```js
import { readOneByte } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = readOneByte(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `readAll` [📕](https://doc.deno.land/builtin/stable#Deno.readAll)
`Resource → Task e Resource`

Read from a Resource.

```js
import { readAll } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = readAll(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `readFile` [📕](https://doc.deno.land/builtin/stable#Deno.readFile)
`File → Task e File`

Read from a File.

```js
import { readFile } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = readFile(File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

### `remove` [📕](https://doc.deno.land/builtin/stable#Deno.remove)
`Object → URL → Task e URL`

Removes the named file or directory.

```js
import { remove } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = remove({ recursive: true }, Directory.fromPath(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `rename` [📕](https://doc.deno.land/builtin/stable#Deno.rename)
`String → URL → Task e URL`

Renames a file or directory.

```js
import { rename } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = rename(`${Deno.cwd()}/piyo`, Directory(`${Deno.cwd()}/hoge`));

assert(Task.is(container));
```

### `write` [📕](https://doc.deno.land/builtin/stable#Deno.write)
`Resource → Task e Resource`

Write to a Resource given it has a non-zero raw buffer.

```js
import { write } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = write(File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3));

assert(Task.is(container));
```

### `writeAll` [📕](https://doc.deno.land/builtin/stable#Deno.writeAll)
`Buffer → Task e Resource`

Write all to a Resource from a Buffer.

```js
import { writeAll } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = writeAll(
  Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])),
  File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3)
);

assert(Task.is(container));
```

### `writeFile` [📕](https://doc.deno.land/builtin/stable#Deno.writeFile)
`Object → File → Task e File`

Write a File to the file system.

```js
import { writeFile } from "https://deno.land/x/functional_io@v1.1.0/library/fs.js";

const container = writeFile({}, File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3));

assert(Task.is(container));
```

---

## Utilities

### `findCLRFIndex`
`Uint8Array → Number`

This function takes a `Uint8Array` and, returns the index of the last character of the first CLRF sequence
encountered.

```js
import { findCLRFIndex } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";

assertEquals(findCLRFIndex(new Uint8Array([ 104, 111, 103, 101, 13, 10 ])), 6);
```

### `discardFirstLine`
`Uint8Array → Uint8Array`

This function takes a `Uint8Array` and, returns the typed array minus the first line separated by CLRF.

```js
import { discardFirstLine } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";

assertEquals(
  discardFirstLine(new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])),
  new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
);
```

### `discardNCharacter`
`Number → Uint8Array → Uint8Array`

This function takes a Number, a `Uint8Array` and, returns the typed array minus the specified amount of character
starting from the left side.

```js
import { discardNCharacter } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";

assertEquals(
  discardNCharacter(1, new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
  new Uint8Array([ 111, 103, 101, 13, 10 ])
);
```

### `getFirstLine`
`Uint8Array → Uint8Array`

This function takes a `Uint8Array` and, returns the first line separated by a CLRF inclusively.

```js
import { getFirstLine } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";

assertEquals(
  getFirstLine(new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])),
  new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
);
```

### `joinCLRF`
`Uint8Array[] → Uint8Array`

This function takes a list of `Uint8Array` and, returns a `Uint8Array` of the list joined with CLRF sequence; the
function is analogous to `Array#join`.

```js
import { joinCLRF } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";

assertEquals(
  joinCLRF(
    [
      new Uint8Array([ 104, 111, 103, 101 ]),
      new Uint8Array([ 104, 111, 103, 101 ])
    ]
  ),
  new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])
);
```

### `splitCLRF`
`Uint8Array → Uint8Array[]`

This function takes a `Uint8Array` and, returns a list of `Uint8Array` of subarray split at the CLRF sequence; the
function is analogous to `String#split`.

```js
import { splitCLRF } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";

assertEquals(
  splitCLRF(new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])),
  [
    new Uint8Array([ 104, 111, 103, 101, 13, 10 ]),
    new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
  ]
);
```

### `trimCRLF`
`Uint8Array → Uint8Array`

This function takes a `Uint8Array` and, returns a typed array minus CRLF at the beginning and at the end;
the function is analogous to `String#trim`.

```js
import { trimCRLF } from "https://deno.land/x/functional_io@v1.1.0/library/utilities.js";

assertEquals(
  trimCRLF(new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
  new Uint8Array([ 104, 111, 103, 101 ])
);
```

### `factorizeUint8Array`
`Number|Array|Uint8Array → Uint8Array

This function factorize a Uint8Array given an argument.

---

## TypeScript

You can import any types.

```ts
import {
  Buffer,
  Directory,
  File,
  Request,
  Resource,
  Response,
  URL
} from "https://deno.land/x/functional_io@v1.1.0/mod.ts";
```

Or, you can import individual sub-module with the appropriate TypeScript hint in Deno.

```ts
// @deno-types="https://deno.land/x/functional_io@v1.1.0/library/Request.d.ts"
import Request from "https://deno.land/x/functional_io@v1.1.0/library/Request.js";
```
 
---

## Contributing

We appreciate your help! Please, [read the guidelines](./CONTRIBUTING.md).

## License

Copyright © 2020 - Sebastien Filion

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit 
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the 
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
