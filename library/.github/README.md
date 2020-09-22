# Functional IO

Deno IO methods as valid Task monads perfect to write great point-free software in JavaScript.

[![deno land](http://img.shields.io/badge/available%20on-deno.land/x-lightgrey.svg?logo=deno&labelColor=black)](https://deno.land/x/functional-deno-io@v0.1.0)
[![deno version](https://img.shields.io/badge/deno-^1.3.2-lightgrey?logo=deno)](https://github.com/denoland/deno)
[![GitHub release](https://img.shields.io/github/v/release/sebastienfilion/functional-deno-io)](https://github.com/sebastienfilion/functional-deno-io/releases)
[![GitHub licence](https://img.shields.io/github/license/sebastienfilion/functional-deno-io)](https://github.com/sebastienfilion/functional-deno-io/blob/v0.1.0/LICENSE)
  
# Usage

This example uses the [Ramda library](https://ramdajs.com) - for simplification - but you should be able to use any library that implements
the [Fantasy-land specifications](https://github.com/fantasyland/fantasy-land). 

```js
import { compose, chain, curry } from "https://x.nest.land/ramda@0.27.0/source/index.js";
import Either from "https://deno.land/x/functional@v0.5.4/Either.js";
import Task from "https://deno.land/x/functional@v0.5.4/Task.js";
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

### Read more on [Github →](https://github.com/sebastienfilion/functional-deno-io)
