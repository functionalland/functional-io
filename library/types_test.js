import { assert, assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

import { Buffer, Directory, File, coerceAsReader, coerceAsWriter, Resource } from "./types.js";

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
  "coerceAsReader",
  () => {
    const _bufferA = new Deno.Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const _bufferB = new Deno.Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const _bufferC = new Deno.Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const _arrayA = new Uint8Array(5);
    const _arrayB = new Uint8Array(5);
    const _arrayC = new Uint8Array(10);
    const _arrayD = new Uint8Array(3);

    const promiseA = _bufferA.read(_arrayA);
    const promiseB = _bufferA.read(_arrayB);
    const promiseC = _bufferB.read(_arrayC);
    const promiseD = _bufferC.read(_arrayD);

    assertEquals(_arrayA, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    assertEquals(_arrayB, new Uint8Array([ 0, 0, 0, 0, 0 ]));
    assertEquals(_arrayC, new Uint8Array([ 65, 66, 67, 68, 69, 0, 0, 0, 0, 0 ]));
    assertEquals(_arrayD, new Uint8Array([ 65, 66, 67 ]));
    assertEquals(promiseA, Promise.resolve(5));
    assertEquals(promiseB, Promise.resolve(0));
    assertEquals(promiseC, Promise.resolve(5));
    assertEquals(promiseD, Promise.resolve(3));

    const _bufferD = coerceAsReader(Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])));
    const _bufferE = coerceAsReader(Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])));
    const _bufferF = coerceAsReader(Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ])));
    const _arrayE = new Uint8Array(5);
    const _arrayF = new Uint8Array(5);
    const _arrayG = new Uint8Array(10);
    const _arrayH = new Uint8Array(3);

    const promiseE = _bufferD.read(_arrayE);
    const promiseF = _bufferD.read(_arrayF);
    const promiseG = _bufferE.read(_arrayG);
    const promiseH = _bufferF.read(_arrayH);

    assertEquals(_arrayE, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    assertEquals(_arrayF, new Uint8Array([ 0, 0, 0, 0, 0 ]));
    assertEquals(_arrayG, new Uint8Array([ 65, 66, 67, 68, 69, 0, 0, 0, 0, 0 ]));
    assertEquals(_arrayH, new Uint8Array([ 65, 66, 67 ]));
    assertEquals(promiseE, Promise.resolve(5));
    assertEquals(promiseF, Promise.resolve(0));
    assertEquals(promiseG, Promise.resolve(5));
    assertEquals(promiseH, Promise.resolve(3));
  }
);

Deno.test(
  "coerceAsWriter",
  () => {
    const _bufferA = new Deno.Buffer(new Uint8Array(5));
    const _bufferB = new Deno.Buffer(new Uint8Array(3));
    const _bufferC = new Deno.Buffer(new Uint8Array(10));
    const _bufferI = new Deno.Buffer(new Uint8Array([ 70, 71, 72, 73, 74 ]));
    const _arrayA = new Uint8Array([ 65, 66, 67, 68, 69 ]);
    const _arrayB = new Uint8Array([ 65, 66, 67, 68, 69 ]);
    const _arrayC = new Uint8Array([ 65, 66, 67, 68, 69 ]);
    const _arrayD = new Uint8Array([ 65, 66, 67, 68, 69 ]);

    const promiseA = _bufferA.write(_arrayA);
    const promiseB = _bufferA.write(_arrayB);
    const promiseC = _bufferB.write(_arrayC);
    const promiseD = _bufferC.write(_arrayD);

    const promiseI = _bufferI.write(_arrayD);

    assertEquals(
      _bufferA,
      new Deno.Buffer(new Uint8Array([ 0, 0, 0, 0, 0, 65, 66, 67, 68, 69, 65, 66, 67, 68, 69 ]))
    );
    assertEquals(
      _bufferB,
      new Deno.Buffer(new Uint8Array([ 0, 0, 0, 65, 66, 67, 68, 69 ]))
    );
    assertEquals(
      _bufferC,
      new Deno.Buffer(new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 65, 66, 67, 68, 69 ]))
    );
    assertEquals(
      _bufferI,
      new Deno.Buffer(new Uint8Array([ 70, 71, 72, 73, 74, 65, 66, 67, 68, 69 ]))
    );
    assertEquals(promiseA, Promise.resolve(5));
    assertEquals(promiseB, Promise.resolve(5));
    assertEquals(promiseC, Promise.resolve(5));
    assertEquals(promiseD, Promise.resolve(5));
    assertEquals(promiseI, Promise.resolve(5));

    const _bufferD = Buffer(new Uint8Array(5));
    const _bufferE = Buffer(new Uint8Array(3));
    const _bufferF = Buffer(new Uint8Array(10));
    const _arrayE = new Uint8Array([ 65, 66, 67, 68, 69 ]);
    const _arrayF = new Uint8Array([ 65, 66, 67, 68, 69 ]);
    const _arrayG = new Uint8Array([ 65, 66, 67, 68, 69 ]);
    const _arrayH = new Uint8Array([ 65, 66, 67, 68, 69 ]);

    const promiseE = coerceAsWriter(_bufferD).write(_arrayE);
    const promiseF = coerceAsWriter(_bufferD).write(_arrayF);
    const promiseG = coerceAsWriter(_bufferE).write(_arrayG);
    const promiseH = coerceAsWriter(_bufferF).write(_arrayH);

    assertEquals(
      _bufferD,
      new Buffer(new Uint8Array([ 0, 0, 0, 0, 0, 65, 66, 67, 68, 69, 65, 66, 67, 68, 69 ]))
    );
    assertEquals(
      _bufferE,
      new Buffer(new Uint8Array([ 0, 0, 0, 65, 66, 67, 68, 69 ]))
    );
    assertEquals(
      _bufferF,
      new Buffer(new Uint8Array([ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 65, 66, 67, 68, 69 ]))
    );
    assertEquals(promiseE, Promise.resolve(5));
    assertEquals(promiseF, Promise.resolve(5));
    assertEquals(promiseG, Promise.resolve(5));
    assertEquals(promiseH, Promise.resolve(5));
  }
);