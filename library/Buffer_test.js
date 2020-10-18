import { assert, assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

import Buffer from "./Buffer.js";

Deno.test(
  "Buffer: #ap - Composition",
  () => {
    const containerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Buffer(x => new Uint8Array(x.map(x => x + 2)));
    const containerC = Buffer(x => new Uint8Array(x.map(x => x * 2)));

    assertEquals(
      containerA.ap(containerB.ap(containerC.map(a => b => c => a(b(c))))).toString(),
      containerA.ap(containerB).ap(containerC).toString()
    );
  }
);

Deno.test(
  "Buffer: #ap with lift",
  () => {
    const lift2 = (f, a, b) => b.ap(a.map(f));

    const containerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Buffer(new Uint8Array([ 70, 71, 72, 73, 74 ]));

    assertEquals(
      lift2(x => y => new Uint8Array([ ...x, ...y ]), containerA, containerB).toString(),
      Buffer(new Uint8Array([ 65, 66, 67, 68, 69, 70, 71, 72, 73, 74 ])).toString()
    );
  }
);

Deno.test(
  "Buffer: #chain - Associativity",
  async () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => Buffer(new Uint8Array(x.map(x => x + 2)));
    const g = x => Buffer(new Uint8Array(x.map(x => x * 2)));

    assertEquals(
      container.chain(f).chain(g).toString(),
      container.chain(value => f(value).chain(g)).toString()
    );
  }
);

Deno.test(
  "Buffer: #concat - Right identity",
  () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.concat(Buffer.empty()).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Buffer: #concat - Left identity",
  () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      Buffer.empty().concat(container).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Buffer: #concat - Associativity",
  () => {
    const containerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Buffer(new Uint8Array([ 70, 71, 72, 73, 74 ]));
    const containerC = Buffer(new Uint8Array([ 75, 76, 77, 78, 79 ]));

    assertEquals(
      containerA.concat(containerB).concat(containerC).toString(),
      containerA.concat(containerB.concat(containerC)).toString()
    );
  }
);

Deno.test(
  "Buffer: #empty - Right identity",
  () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.concat(container.empty()).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Buffer: #empty - Left identity",
  () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.empty().concat(container).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Buffer: #equals - Reflexivity",
  () =>
    assert(
      Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]))
        .equals(Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])))
    )
);

Deno.test(
  "Buffer: #equals - Symmetry",
  () => {
    const containerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assert(containerA.equals(containerB) === containerB.equals(containerA));
  }
);

Deno.test(
  "Buffer: #equals - Transitivity",
  () => {
    const containerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerC = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assert(
      containerA.equals(containerB)
      === containerB.equals(containerC)
      === containerA.equals(containerC)
    )
  }
);

Deno.test(
  "Buffer: #extend - Associativity",
  async () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = container => new Uint8Array(container.raw.map(x => x + 2));
    const g = container => new Uint8Array(container.raw.map(x => x * 2));

    assertEquals(
      container.extend(f).extend(g).toString(),
      container.extend(value => g(value.extend(f))).toString()
    );
  }
);

Deno.test(
  "Buffer: #extract - Right identity",
  () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = container => new Uint8Array(container.raw.map(x => x + 2));

    assertEquals(
      container.extend(f).extract().toString(),
      f(container).toString()
    );
  }
);

Deno.test(
  "Buffer: #extract - Left identity",
  () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.extend(container => container.extract()).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Buffer: #lte - Totality",
  () => {
    const containerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Buffer(new Uint8Array([ 70, 71, 72, 73, 74 ]));

    assert(
      containerA.lte(containerB) || containerB.lte(containerA) === true
    );
  }
);

Deno.test(
  "Buffer: #lte - Antisymmetry",
  () => {
    const containerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assert(
      containerA.lte(containerB) && containerB.lte(containerA) === containerA.equals(containerB)
    );
  }
);

Deno.test(
  "Buffer: #lte - Transitivity",
  () => {
    const containerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Buffer(new Uint8Array([ 70, 71, 72, 73, 74 ]));
    const containerC = Buffer(new Uint8Array([ 75, 76, 78, 79, 80 ]));

    assert(
      containerA.lte(containerB) && containerB.lte(containerC) === containerA.lte(containerC)
    );
  }
);

Deno.test(
  "Buffer: #invert - Right identity",
  () => {
    const container = Buffer(new Uint8Array([]));

    assertEquals(
      container.concat(container.invert()).toString(),
      Buffer.empty().toString()
    );
  }
);

Deno.test(
  "Buffer: #invert - Left identity",
  () => {
    const container = Buffer(new Uint8Array([]));

    assertEquals(
      container.invert().concat(container).toString(),
      Buffer.empty().toString()
    );
  }
);

Deno.test(
  "Buffer: #map - Identity",
  () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.map(x => x).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Buffer: #map - Composition",
  () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => new Uint8Array(x.map(x => x + 2));
    const g = x => new Uint8Array(x.map(x => x * 2));

    assertEquals(
      container.map(f).map(g).toString(),
      container.map(x => g(f(x))).toString()
    );
  }
);

Deno.test(
  "Buffer: #of - Identity (Applicative)",
  () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));

    assertEquals(
      container.ap(Buffer.of(x => x)).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Buffer: #of - Left identity (Chainable)",
  async () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => Buffer(new Uint8Array(x.map(x => x + 2)));

    assertEquals(
      container.chain(Buffer.of).chain(f).toString(),
      container.chain(f).toString()
    );
  }
);

Deno.test(
  "Buffer: #of - Right identity (Chainable)",
  async () => {
    const container = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const f = x => Buffer(new Uint8Array(x.map(x => x + 2)));

    assertEquals(
      container.chain(f).chain(Buffer.of).toString(),
      container.chain(f).toString()
    );
  }
);

Deno.test(
  "Buffer: #of - Homomorphism",
  () =>
    assertEquals(
      Buffer.of(new Uint8Array([ 65, 66, 67, 68, 69 ])).ap(Buffer.of(x => x + 2)),
      Buffer.of((x => x + 2)(new Uint8Array([ 65, 66, 67, 68, 69 ])))
    )
);

Deno.test(
  "Buffer: #of - Interchange",
  () =>
    assertEquals(
      Buffer.of(new Uint8Array([ 65, 66, 67, 68, 69 ]))
        .ap(Buffer(x => new Uint8Array(x.map(x => x + 2)))).toString(),
      Buffer(x => new Uint8Array(x.map(x => x + 2)))
        .ap(Buffer.of(f => f(new Uint8Array([ 65, 66, 67, 68, 69 ])))).toString()
    )
);