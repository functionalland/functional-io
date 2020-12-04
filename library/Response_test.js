import { assert, assertEquals } from "https://deno.land/std@0.79.0/testing/asserts.ts";

import Response from "./Response.js";

Deno.test(
  "Response.Failure: #alt",
  async () => {
    const containerA = Response.Failure({}, new Uint8Array([]))
      .alt(Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ])));
    const containerB = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assert(Response.is(containerA));
    assert(Response.is(containerB));

    assertEquals(containerA.toString(), containerB.toString());
  }
);

Deno.test(
  "Response: #ap - Composition",
  async () => {
    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Response.Success({}, x => new Uint8Array(x.map(x => x + 2)));
    const containerC = Response.Success({}, x => new Uint8Array(x.map(x => x * 2)));

    const containerD = containerA.ap(containerB.ap(containerC.map(a => b => c => a(b(c)))));
    const containerE = containerA.ap(containerB).ap(containerC);

    assert(Response.is(containerD));
    assert(Response.is(containerE));

    assertEquals(
      containerD.toString(),
      containerE.toString()
    );
  }
);

Deno.test(
  "Response: #ap with lift",
  async () => {
    const lift2 = (f, a, b) => b.ap(a.map(f));

    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Response.Success({}, new Uint8Array([ 70, 71, 72, 73, 74 ]));

    const containerC = lift2(x => y => new Uint8Array([ ...x, ...y ]), containerA, containerB);
    const containerD = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69, 70, 71, 72, 73, 74 ]));

    assert(Response.is(containerC));
    assert(Response.is(containerD));

    assertEquals(containerC.toString(), containerD.toString());
  }
);

Deno.test(
  "Response: #bimap - Identity",
  () => {
    const container = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.bimap(x => x, x => x).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Response: #bimap - Composition",
  () => {
    const container = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => ({ ...x, a: 'a' });
    const g = x => new Uint8Array(x.map(x => x + 2));
    const h = x => ({ ...x, b: 'b' });
    const i = x => new Uint8Array(x.map(x => x * 2));

    assertEquals(
      container.bimap(f, g).bimap(h, i).toString(),
      container.bimap(x => h(f(x)), y => i(g(y))).toString()
    );
  }
);

Deno.test(
  "Response: #chain - Associativity",
  async () => {
    const container = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => Response.Success({}, new Uint8Array(x.map(x => x + 2)));
    const g = x => Response.Success({}, new Uint8Array(x.map(x => x * 2)));

    assertEquals(
      container.chain(f).chain(g).toString(),
      container.chain(value => f(value).chain(g)).toString()
    );
  }
);

Deno.test(
  "Response: #concat - Right identity",
  () => {
    const container = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.concat(Response.empty()).toString(),
      container.toString()
    );
  }
);

/**
 * Response Semigroup algebra law "Left identity" is not respected because the headers can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Response: #concat - Left identity",
//   () => {
//     const container = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
//
//     assertEquals(
//       Response.empty().concat(container).toString(),
//       container.toString()
//     );
//   }
// );

Deno.test(
  "Response: #concat - Associativity",
  () => {
    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Response.Success({}, new Uint8Array([ 70, 71, 72, 73, 74 ]));
    const containerC = Response.Success({}, new Uint8Array([ 75, 76, 77, 78, 79 ]));

    assertEquals(
      containerA.concat(containerB).concat(containerC).toString(),
      containerA.concat(containerB.concat(containerC)).toString()
    );
  }
);

Deno.test(
  "Response: #empty - Right identity",
  () => {
    const container = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.concat(container.empty()).toString(),
      container.toString()
    );
  }
);

/**
 * Response Monoid algebra law "Left identity" is not respected because the headers can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Response: #empty - Left identity",
//   () => {
//     const container = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
//
//     assertEquals(
//       container.empty().concat(container).toString(),
//       container.toString()
//     );
//   }
// );

Deno.test(
  "Response: #equals - Reflexivity",
  () =>
    assert(
      Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]))
        .equals(Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ])))
    )
);

Deno.test(
  "Response: #equals - Symmetry",
  () => {
    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assert(containerA.equals(containerB) === containerB.equals(containerA));
  }
);

Deno.test(
  "Response: #lte - Totality",
  () => {
    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Response.Success({}, new Uint8Array([ 70, 71, 72, 73, 74 ]));

    assert(
      containerA.lte(containerB) || containerB.lte(containerA) === true
    );
  }
);

Deno.test(
  "Response: #lte - Antisymmetry",
  () => {
    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assert(
      containerA.lte(containerB) && containerB.lte(containerA) === containerA.equals(containerB)
    );
  }
);

Deno.test(
  "Response: #lte - Transitivity",
  () => {
    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Response.Success({}, new Uint8Array([ 70, 71, 72, 73, 74 ]));
    const containerC = Response.Success({}, new Uint8Array([ 75, 76, 77, 78, 79 ]));

    assert(
      containerA.lte(containerB) && containerB.lte(containerC) === containerA.lte(containerC)
    );
  }
);

/**
 * Response Group algebra law "Left identity" and "Right identity" is not respected because the headers can't be
 * modified without using bimap.
 */
// Deno.test(
//   "Response: #invert - Right identity",
//   () => {
//     const container = Response.Success({}, new Uint8Array([]));
//
//     assertEquals(
//       container.concat(container.invert()).toString(),
//       Response.empty().toString()
//     );
//   }
// );

// Deno.test(
//   "Response: #invert - Left identity",
//   () => {
//     const container = Response.Success({}, new Uint8Array([]));
//
//     assertEquals(
//       container.invert().concat(container).toString(),
//       Response.empty().toString()
//     );
//   }
// );

Deno.test(
  "Response: #map - Identity",
  async () => {
    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    const containerB = containerA.map(value => value);
    const containerC = containerA;

    assert(Response.is(containerB));
    assert(Response.is(containerC));

    assertEquals(containerB.toString(), containerC.toString());
  }
);

Deno.test(
  "Response: #map - Composition",
  async () => {
    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => new Uint8Array(x.map(x => x + 2));
    const g = x => new Uint8Array(x.map(x => x * 2));

    const containerB = containerA.map(f).map(g);
    const containerC = containerA.map(value => g(f(value)));

    assert(Response.is(containerB));
    assert(Response.is(containerC));

    assertEquals(containerB.toString(), containerC.toString());
  }
);

Deno.test(
  "Response: #of - Left identity (Chainable)",
  async () => {
    const container = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => Response.Success({}, new Uint8Array(x.map(x => x + 2)));

    assertEquals(
      container.chain(Response.of).chain(f).toString(),
      container.chain(f).toString()
    );
  }
);

/**
 * Response Modnad algebra law "Right identity" is not respected because the headers can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Response: #of - Right identity (Chainable)",
//   async () => {
//     const container = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
//     const f = x => Response.Success({}, new Uint8Array(x.map(x => x + 2)));
//
//     assertEquals(
//       container.chain(f).chain(Response.of).toString(),
//       container.chain(f).toString()
//     );
//   }
// );

Deno.test(
  "Response: #of - Homomorphism",
  () =>
    assertEquals(
      Response.of(new Uint8Array([ 65, 66, 67, 68, 69 ])).ap(Response.of(x => x + 2)),
      Response.of((x => x + 2)(new Uint8Array([ 65, 66, 67, 68, 69 ])))
    )
);

/**
 * Response Applicative algebra law "Interchange" is not respected because the headers can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Response: #of - Interchange",
//   () =>
//     assertEquals(
//       Response.of(new Uint8Array([ 65, 66, 67, 68, 69 ]))
//         .ap(Response.Success({}, x => new Uint8Array(x.map(x => x + 2)))).toString(),
//       Response.Success({}, x => new Uint8Array(x.map(x => x + 2)))
//         .ap(Response.of(f => f(new Uint8Array([ 65, 66, 67, 68, 69 ])))).toString()
//     )
// );
