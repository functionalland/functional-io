import { assert, assertEquals } from "https://deno.land/std@0.79.0/testing/asserts.ts";

import Resource from "./Resource.js";

Deno.test(
  "Resource: #ap - Composition",
  () => {
    const containerA = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = Resource(x => new Uint8Array(x.map(x => x + 2)), 3);
    const containerC = Resource(x => new Uint8Array(x.map(x => x * 2)), 3);

    assertEquals(
      containerA.ap(containerB.ap(containerC.map(a => b => c => a(b(c))))).toString(),
      containerA.ap(containerB).ap(containerC).toString()
    );
  }
);

Deno.test(
  "Resource: #bimap - Identity",
  () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assertEquals(
      container.bimap(x => x, x => x).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Resource: #bimap - Composition",
  () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
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
  "Resource: #chain - Associativity",
  async () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const f = x => Resource(new Uint8Array(x.map(x => x + 2)), 3);
    const g = x => Resource(new Uint8Array(x.map(x => x * 2)), 3);

    assertEquals(
      container.chain(f).chain(g).toString(),
      container.chain(value => f(value).chain(g)).toString()
    );
  }
);

Deno.test(
  "Resource: #concat - Right identity",
  () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assertEquals(
      container.concat(Resource.empty()).toString(),
      container.toString()
    );
  }
);

/*
 * Resource Semigroup algebra law "Left identity" is not respected because the rid can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Resource: #concat - Left identity",
//   () => {
//     const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
//
//     assertEquals(
//       Resource.empty().concat(container).toString(),
//       container.toString()
//     );
//   }
// );

Deno.test(
  "Resource: #concat - Associativity",
  () => {
    const containerA = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = Resource(new Uint8Array([ 70, 71, 72, 73, 74 ]), 3);
    const containerC = Resource(new Uint8Array([ 75, 76, 77, 78, 79 ]), 3);

    assertEquals(
      containerA.concat(containerB).concat(containerC).toString(),
      containerA.concat(containerB.concat(containerC)).toString()
    );
  }
);

Deno.test(
  "Resource: #empty - Right identity",
  () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assertEquals(
      container.concat(container.empty()).toString(),
      container.toString()
    );
  }
);

/**
 * Resource Monoid algebra law "Left identity" is not respected because the rid can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Resource: #empty - Left identity",
//   () => {
//     const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
//
//     assertEquals(
//       container.empty().concat(container).toString(),
//       container.toString()
//     );
//   }
// );

Deno.test(
  "Resource: #equals - Reflexivity",
  () =>
    assert(
      Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3)
        .equals(Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3))
    )
);

Deno.test(
  "Resource: #equals - Symmetry",
  () => {
    const containerA = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assert(containerA.equals(containerB) === containerB.equals(containerA));
  }
);

Deno.test(
  "Resource: #equals - Transitivity",
  () => {
    const containerA = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerC = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assert(
      containerA.equals(containerB)
      === containerB.equals(containerC)
      === containerA.equals(containerC)
    )
  }
);

Deno.test(
  "Resource: #extend - Associativity",
  async () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const f = container => new Uint8Array(container.raw.map(x => x + 2));
    const g = container => new Uint8Array(container.raw.map(x => x * 2));

    assertEquals(
      container.extend(f).extend(g).toString(),
      container.extend(value => g(value.extend(f))).toString()
    );
  }
);

Deno.test(
  "Resource: #extract - Right identity",
  () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const f = container => new Uint8Array(container.raw.map(x => x + 2));

    assertEquals(
      container.extend(f).extract().toString(),
      f(container).toString()
    );
  }
);

Deno.test(
  "Resource: #extract - Left identity",
  () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assertEquals(
      container.extend(container => container.extract()).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Resource: #lte - Totality",
  () => {
    const containerA = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = Resource(new Uint8Array([ 70, 71, 72, 73, 74 ]), 3);

    assert(
      containerA.lte(containerB) || containerB.lte(containerA) === true
    );
  }
);

Deno.test(
  "Resource: #lte - Antisymmetry",
  () => {
    const containerA = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assert(
      containerA.lte(containerB) && containerB.lte(containerA) === containerA.equals(containerB)
    );
  }
);

Deno.test(
  "Resource: #lte - Transitivity",
  () => {
    const containerA = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = Resource(new Uint8Array([ 70, 71, 72, 73, 74 ]), 3);
    const containerC = Resource(new Uint8Array([ 75, 76, 78, 79, 80 ]), 3);

    assert(
      containerA.lte(containerB) && containerB.lte(containerC) === containerA.lte(containerC)
    );
  }
);

/**
 * Resource Group algebra law "Left identity" and "Right identity" is not respected because the rid can't be modified
 * without using bimap.
 */
// Deno.test(
//   "Resource: #invert - Right identity",
//   () => {
//     const container = Resource(new Uint8Array([]), 3);
//
//     assertEquals(
//       container.concat(container.invert()).toString(),
//       Resource.empty().toString()
//     );
//   }
// );
//
// Deno.test(
//   "Resource: #invert - Left identity",
//   () => {
//     const container = Resource(new Uint8Array([]), 3);
//
//     assertEquals(
//       container.invert().concat(container).toString(),
//       Resource.empty().toString()
//     );
//   }
// );

Deno.test(
  "Resource: #map - Identity",
  () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assertEquals(
      container.map(x => x).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Resource: #map - Composition",
  () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const f = x => new Uint8Array(x.map(x => x + 2));
    const g = x => new Uint8Array(x.map(x => x * 2));

    assertEquals(
      container.map(f).map(g).toString(),
      container.map(x => g(f(x))).toString()
    );
  }
);

Deno.test(
  "Resource: #of - Identity (Applicative)",
  () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);

    assertEquals(
      container.ap(Resource.of(x => x)).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Resource: #of - Left identity (Chainable)",
  async () => {
    const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const f = x => Resource(new Uint8Array(x.map(x => x + 2)), 3);

    assertEquals(
      container.chain(Resource.of).chain(f).toString(),
      container.chain(f).toString()
    );
  }
);

/**
 * Resource Modnad algebra law "Right identity" is not respected because the rid can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Resource: #of - Right identity (Chainable)",
//   async () => {
//     const container = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
//     const f = x => Resource(new Uint8Array(x.map(x => x + 2)), 3);
//
//     assertEquals(
//       container.chain(f).chain(Resource.of).toString(),
//       container.chain(f).toString()
//     );
//   }
// );

Deno.test(
  "Resource: #of - Homomorphism",
  () =>
    assertEquals(
      Resource.of(new Uint8Array([ 65, 66, 67, 68, 69 ])).ap(Resource.of(x => x + 2)),
      Resource.of((x => x + 2)(new Uint8Array([ 65, 66, 67, 68, 69 ])))
    )
);

/**
 * Resource Applicative algebra law "Interchange" is not respected because the rid can't be modified without using
 * bimap.
 */
// Deno.test(
//   "Resource: #of - Interchange",
//   () =>
//     assertEquals(
//       Resource.of(new Uint8Array([ 65, 66, 67, 68, 69 ]))
//         .ap(Resource(x => new Uint8Array(x.map(x => x + 2)))).toString(),
//       Resource(x => new Uint8Array(x.map(x => x + 2)), 3)
//         .ap(Resource.of(f => f(new Uint8Array([ 65, 66, 67, 68, 69 ])), 3)).toString()
//     )
// );
