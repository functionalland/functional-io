import { assert, assertEquals } from "https://deno.land/std@0.79.0/testing/asserts.ts";

import Request from "./Request.js";

Deno.test(
  "Request: #ap - Composition",
  async () => {
    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Request({}, x => new Uint8Array(x.map(x => x + 2)));
    const containerC = Request({}, x => new Uint8Array(x.map(x => x * 2)));

    const containerD = containerA.ap(containerB.ap(containerC.map(a => b => c => a(b(c)))));
    const containerE = containerA.ap(containerB).ap(containerC);

    assert(Request.is(containerD));
    assert(Request.is(containerE));

    assertEquals(
      containerD.toString(),
      containerE.toString()
    );
  }
);

Deno.test(
  "Request: #ap with lift",
  async () => {
    const lift2 = (f, a, b) => b.ap(a.map(f));

    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Request({}, new Uint8Array([ 70, 71, 72, 73, 74 ]));

    const containerC = lift2(x => y => new Uint8Array([ ...x, ...y ]), containerA, containerB);
    const containerD = Request({}, new Uint8Array([ 65, 66, 67, 68, 69, 70, 71, 72, 73, 74 ]));

    assert(Request.is(containerC));
    assert(Request.is(containerD));

    assertEquals(containerC.toString(), containerD.toString());
  }
);

Deno.test(
  "Request: #bimap - Identity",
  () => {
    const container = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.bimap(x => x, x => x).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Request: #bimap - Composition",
  () => {
    const container = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
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
  "Request: #chain - Associativity",
  async () => {
    const container = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => Request({}, new Uint8Array(x.map(x => x + 2)));
    const g = x => Request({}, new Uint8Array(x.map(x => x * 2)));

    assertEquals(
      container.chain(f).chain(g).toString(),
      container.chain(value => f(value).chain(g)).toString()
    );
  }
);

Deno.test(
  "Request: #concat - Right identity",
  () => {
    const container = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.concat(Request.empty()).toString(),
      container.toString()
    );
  }
);

/**
 * Request Semigroup algebra law "Left identity" is not respected because the headers can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Request: #concat - Left identity",
//   () => {
//     const container = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
//
//     assertEquals(
//       Request.empty().concat(container).toString(),
//       container.toString()
//     );
//   }
// );

Deno.test(
  "Request: #concat - Associativity",
  () => {
    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Request({}, new Uint8Array([ 70, 71, 72, 73, 74 ]));
    const containerC = Request({}, new Uint8Array([ 75, 76, 77, 78, 79 ]));

    assertEquals(
      containerA.concat(containerB).concat(containerC).toString(),
      containerA.concat(containerB.concat(containerC)).toString()
    );
  }
);

Deno.test(
  "Request: #empty - Right identity",
  () => {
    const container = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.concat(container.empty()).toString(),
      container.toString()
    );
  }
);

/**
 * Request Monoid algebra law "Left identity" is not respected because the headers can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Request: #empty - Left identity",
//   () => {
//     const container = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
//
//     assertEquals(
//       container.empty().concat(container).toString(),
//       container.toString()
//     );
//   }
// );

Deno.test(
  "Request: #equals - Reflexivity",
  () =>
    assert(
      Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]))
        .equals(Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ])))
    )
);

Deno.test(
  "Request: #equals - Symmetry",
  () => {
    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assert(containerA.equals(containerB) === containerB.equals(containerA));
  }
);

Deno.test(
  "Request: #lte - Totality",
  () => {
    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Request({}, new Uint8Array([ 70, 71, 72, 73, 74 ]));

    assert(
      containerA.lte(containerB) || containerB.lte(containerA) === true
    );
  }
);

Deno.test(
  "Request: #lte - Antisymmetry",
  () => {
    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assert(
      containerA.lte(containerB) && containerB.lte(containerA) === containerA.equals(containerB)
    );
  }
);

Deno.test(
  "Request: #lte - Transitivity",
  () => {
    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Request({}, new Uint8Array([ 70, 71, 72, 73, 74 ]));
    const containerC = Request({}, new Uint8Array([ 75, 76, 77, 78, 79 ]));

    assert(
      containerA.lte(containerB) && containerB.lte(containerC) === containerA.lte(containerC)
    );
  }
);

/**
 * Request Group algebra law "Left identity" and "Right identity" is not respected because the headers can't be
 * modified without using bimap.
 */
// Deno.test(
//   "Request: #invert - Right identity",
//   () => {
//     const container = Request({}, new Uint8Array([]));
//
//     assertEquals(
//       container.concat(container.invert()).toString(),
//       Request.empty().toString()
//     );
//   }
// );

// Deno.test(
//   "Request: #invert - Left identity",
//   () => {
//     const container = Request({}, new Uint8Array([]));
//
//     assertEquals(
//       container.invert().concat(container).toString(),
//       Request.empty().toString()
//     );
//   }
// );

Deno.test(
  "Request: #map - Identity",
  async () => {
    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));

    const containerB = containerA.map(value => value);
    const containerC = containerA;

    assert(Request.is(containerB));
    assert(Request.is(containerC));

    assertEquals(containerB.toString(), containerC.toString());
  }
);

Deno.test(
  "Request: #map - Composition",
  async () => {
    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => new Uint8Array(x.map(x => x + 2));
    const g = x => new Uint8Array(x.map(x => x * 2));

    const containerB = containerA.map(f).map(g);
    const containerC = containerA.map(value => g(f(value)));

    assert(Request.is(containerB));
    assert(Request.is(containerC));

    assertEquals(containerB.toString(), containerC.toString());
  }
);

Deno.test(
  "Request: #of - Left identity (Chainable)",
  async () => {
    const container = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => Request({}, new Uint8Array(x.map(x => x + 2)));

    assertEquals(
      container.chain(Request.of).chain(f).toString(),
      container.chain(f).toString()
    );
  }
);

/**
 * Request Modnad algebra law "Right identity" is not respected because the headers can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Request: #of - Right identity (Chainable)",
//   async () => {
//     const container = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
//     const f = x => Request({}, new Uint8Array(x.map(x => x + 2)));
//
//     assertEquals(
//       container.chain(f).chain(Request.of).toString(),
//       container.chain(f).toString()
//     );
//   }
// );

Deno.test(
  "Request: #of - Homomorphism",
  () =>
    assertEquals(
      Request.of(new Uint8Array([ 65, 66, 67, 68, 69 ])).ap(Request.of(x => x + 2)),
      Request.of((x => x + 2)(new Uint8Array([ 65, 66, 67, 68, 69 ])))
    )
);

/**
 * Request Applicative algebra law "Interchange" is not respected because the headers can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Request: #of - Interchange",
//   () =>
//     assertEquals(
//       Request.of(new Uint8Array([ 65, 66, 67, 68, 69 ]))
//         .ap(Request({}, x => new Uint8Array(x.map(x => x + 2)))).toString(),
//       Request({}, x => new Uint8Array(x.map(x => x + 2)))
//         .ap(Request.of(f => f(new Uint8Array([ 65, 66, 67, 68, 69 ])))).toString()
//     )
// );
