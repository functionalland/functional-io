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
