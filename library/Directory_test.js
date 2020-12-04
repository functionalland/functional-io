import { assert, assertEquals } from "https://deno.land/std@0.79.0/testing/asserts.ts";

import Directory from "./Directory.js";

Deno.test(
  "Directory: #ap - Composition",
  () => {
    const containerA = Directory(`${Deno.cwd()}/hoge`);
    const containerB = Directory(x => x.replace("hoge", "piyo"));
    const containerC = Directory(x => x.replace("piyo", "fuga"));

    assertEquals(
      containerA.ap(containerB.ap(containerC.map(a => b => c => a(b(c))))).toString(),
      containerA.ap(containerB).ap(containerC).toString()
    );
  }
);

Deno.test(
  "Directory: #chain - Associativity",
  async () => {
    const container = Directory(`${Deno.cwd()}/hoge`);
    const f = x => Directory(x.replace("hoge", "piyo"));
    const g = x => Directory(x.replace("piyo", "fuga"));

    assertEquals(
      container.chain(f).chain(g).toString(),
      container.chain(value => f(value).chain(g)).toString()
    );
  }
);

Deno.test(
  "Directory: #equals - Reflexivity",
  () =>
    assert(
      Directory(`${Deno.cwd()}/hoge`).equals(Directory(`${Deno.cwd()}/hoge`))
    )
);

Deno.test(
  "Directory: #equals - Symmetry",
  () => {
    const containerA = Directory(`${Deno.cwd()}/hoge`);
    const containerB = Directory(`${Deno.cwd()}/hoge`);

    assert(containerA.equals(containerB) === containerB.equals(containerA));
  }
);

Deno.test(
  "Directory: #equals - Transitivity",
  () => {
    const containerA = Directory(`${Deno.cwd()}/hoge`);
    const containerB = Directory(`${Deno.cwd()}/hoge`);
    const containerC = Directory(`${Deno.cwd()}/hoge`);

    assert(
      containerA.equals(containerB)
      === containerB.equals(containerC)
      === containerA.equals(containerC)
    )
  }
);

Deno.test(
  "Directory: #extend - Associativity",
  async () => {
    const container = Directory(`${Deno.cwd()}/hoge`);
    const f = container => container.path.replace("hoge", "piyo");
    const g = container => container.path.replace("hoge", "fuga");

    assertEquals(
      container.extend(f).extend(g).toString(),
      container.extend(value => g(value.extend(f))).toString()
    );
  }
);

Deno.test(
  "Directory: #extract - Right identity",
  () => {
    const container = Directory(`${Deno.cwd()}/hoge`);
    const f = container => container.path.replace("hoge", "piyo");

    assertEquals(
      container.extend(f).extract().toString(),
      f(container).toString()
    );
  }
);

Deno.test(
  "Directory: #extract - Left identity",
  () => {
    const container = Directory(`${Deno.cwd()}/hoge`);

    assertEquals(
      container.extend(container => container.extract()).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Directory: #lte - Totality",
  () => {
    const containerA = Directory(`${Deno.cwd()}/hoge`);
    const containerB = Directory(`${Deno.cwd()}/piyo`);

    assert(
      containerA.lte(containerB) || containerB.lte(containerA) === true
    );
  }
);

Deno.test(
  "Directory: #lte - Antisymmetry",
  () => {
    const containerA = Directory(`${Deno.cwd()}/hoge`);
    const containerB = Directory(`${Deno.cwd()}/piyo`);

    assert(
      containerA.lte(containerB) && containerB.lte(containerA) === containerA.equals(containerB)
    );
  }
);

Deno.test(
  "Directory: #lte - Transitivity",
  () => {
    const containerA = Directory(`${Deno.cwd()}/fuga`);
    const containerB = Directory(`${Deno.cwd()}/hoge`);
    const containerC = Directory(`${Deno.cwd()}/piyo`);

    assert(
      containerA.lte(containerB) && containerB.lte(containerC) === containerA.lte(containerC)
    );
  }
);

Deno.test(
  "Directory: #map - Identity",
  () => {
    const container = Directory(`${Deno.cwd()}/hoge`);

    assertEquals(
      container.map(x => x).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Directory: #map - Composition",
  () => {
    const container = Directory(`${Deno.cwd()}/hoge`);
    const f = x => x.replace("hoge", "piyo");
    const g = x => x.replace("piyo", "fuga");

    assertEquals(
      container.map(f).map(g).toString(),
      container.map(x => g(f(x))).toString()
    );
  }
);

Deno.test(
  "Directory: #of - Identity (Applicative)",
  () => {
    const container = Directory(`${Deno.cwd()}/hoge`);

    assertEquals(
      container.ap(Directory.of(x => x)).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "Directory: #of - Left identity (Chainable)",
  async () => {
    const container = Directory(`${Deno.cwd()}/hoge`);
    const f = x => Directory(x.replace("hoge", "piyo"));

    assertEquals(
      container.chain(Directory.of).chain(f).toString(),
      container.chain(f).toString()
    );
  }
);

Deno.test(
  "Directory: #of - Right identity (Chainable)",
  async () => {
    const container = Directory(`${Deno.cwd()}/hoge`);
    const f = x => Directory(x.replace("hoge", "piyo"));

    assertEquals(
      container.chain(f).chain(Directory.of).toString(),
      container.chain(f).toString()
    );
  }
);

Deno.test(
  "Directory: #of - Homomorphism",
  () =>
    assertEquals(
      Directory.of(`${Deno.cwd()}/hoge`).ap(Directory.of(x => x.replace("hoge", "piyo"))),
      Directory.of((x => x.replace("hoge", "piyo"))(`${Deno.cwd()}/hoge`))
    )
);

Deno.test(
  "Directory: #of - Interchange",
  () =>
    assertEquals(
      Directory.of(`${Deno.cwd()}/hoge`)
        .ap(Directory(x => x.replace("hoge", "piyo"))).toString(),
      Directory(x => x.replace("hoge", "piyo"))
        .ap(Directory.of(f => f(`${Deno.cwd()}/hoge`))).toString()
    )
);
