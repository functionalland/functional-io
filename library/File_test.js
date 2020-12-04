import { assert, assertEquals } from "https://deno.land/std@0.79.0/testing/asserts.ts";

import File from "./File.js";

Deno.test(
  "File: #ap - Composition",
  () => {
    const containerA = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = File(`${Deno.cwd()}/hoge`, x => new Uint8Array(x.map(x => x + 2)), 3);
    const containerC = File(`${Deno.cwd()}/hoge`, x => new Uint8Array(x.map(x => x * 2)), 3);

    assertEquals(
      containerA.ap(containerB.ap(containerC.map(a => b => c => a(b(c))))).toString(),
      containerA.ap(containerB).ap(containerC).toString()
    );
  }
);

Deno.test(
  "File: #ap with lift",
  () => {
    const lift2 = (f, a, b) => b.ap(a.map(f));

    const containerA = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = File(`${Deno.cwd()}/piyo`, new Uint8Array([ 70, 71, 72, 73, 74 ]), 4);

    assertEquals(
      lift2(x => y => new Uint8Array([ ...x, ...y ]), containerA, containerB).toString(),
      File(`${Deno.cwd()}/piyo`, new Uint8Array([ 65, 66, 67, 68, 69, 70, 71, 72, 73, 74 ]), 4).toString()
    );
  }
);

Deno.test(
  "File: #bimap - Identity",
  () => {
    const container = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assertEquals(
      container.bimap(x => x, x => x).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "File: #bimap - Composition",
  () => {
    const container = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const f = x => new Uint8Array(x.map(x => x + 2));
    const g = x => x + 1;
    const h = x => new Uint8Array(x.map(x => x * 2));
    const i = x => x * 0;

    assertEquals(
      container.bimap(f, g).bimap(h, i).toString(),
      container.bimap(x => h(f(x)), y => i(g(y))).toString()
    );
  }
);

Deno.test(
  "File: #chain - Associativity",
  async () => {
    const container = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const f = x => File(`${Deno.cwd()}/hoge`, new Uint8Array(x.map(x => x + 2)), 3);
    const g = x => File(`${Deno.cwd()}/hoge`, new Uint8Array(x.map(x => x * 2)), 3);

    assertEquals(
      container.chain(f).chain(g).toString(),
      container.chain(value => f(value).chain(g)).toString()
    );
  }
);

Deno.test(
  "File: #concat - Associativity",
  () => {
    const containerA = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 70, 71, 72, 73, 74 ]), 3);
    const containerC = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 75, 76, 77, 78, 79 ]), 3);

    assertEquals(
      containerA.concat(containerB).concat(containerC).toString(),
      containerA.concat(containerB.concat(containerC)).toString()
    );
  }
);

Deno.test(
  "File: #equals - Reflexivity",
  () =>
    assert(
      File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3)
        .equals(File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3))
    )
);

Deno.test(
  "File: #equals - Symmetry",
  () => {
    const containerA = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assert(containerA.equals(containerB) === containerB.equals(containerA));
  }
);

Deno.test(
  "File: #equals - Transitivity",
  () => {
    const containerA = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerC = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assert(
      containerA.equals(containerB)
      === containerB.equals(containerC)
      === containerA.equals(containerC)
    )
  }
);

Deno.test(
  "File: #extend - Associativity",
  async () => {
    const container = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const f = container => new Uint8Array(container.raw.map(x => x + 2));
    const g = container => new Uint8Array(container.raw.map(x => x * 2));

    assertEquals(
      container.extend(f).extend(g).toString(),
      container.extend(value => g(value.extend(f))).toString()
    );
  }
);

/**
 * File Group algebra law "Left identity" and "Right identity" is not respected because the rid can't be modified
 * without using bimap.
 */
// Deno.test(
//   "File: #invert - Right identity",
//   () => {
//     const container = File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3);
//
//     assertEquals(
//       container.concat(container.invert()).toString(),
//       File.empty().toString()
//     );
//   }
// );
//
// Deno.test(
//   "File: #invert - Left identity",
//   () => {
//     const container = File(`${Deno.cwd()}/hoge`, new Uint8Array([]), 3);
//
//     assertEquals(
//       container.invert().concat(container).toString(),
//       File.empty().toString()
//     );
//   }
// );

Deno.test(
  "File: #map - Identity",
  () => {
    const container = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assertEquals(
      container.map(x => x).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "File: #map - Composition",
  () => {
    const container = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const f = x => new Uint8Array(x.map(x => x + 2));
    const g = x => new Uint8Array(x.map(x => x * 2));

    assertEquals(
      container.map(f).map(g).toString(),
      container.map(x => g(f(x))).toString()
    );
  }
);