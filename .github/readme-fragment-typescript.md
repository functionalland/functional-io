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
 