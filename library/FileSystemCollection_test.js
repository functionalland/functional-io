import { assertEquals } from "https://deno.land/std@0.70.0/testing/asserts.ts";

import FileSystemCollection from "./FileSystemCollection.js";
import File from "./File.js";

Deno.test(
  "FileSystemCollection: #concat - Right identity",
  () => {
    const container = FileSystemCollection([
      File.fromPath(`${Deno.cwd()}/hoge`),
      File.fromPath(`${Deno.cwd()}/piyo`),
      File.fromPath(`${Deno.cwd()}/fuga`)
    ]);

    assertEquals(
      container.concat(FileSystemCollection.empty()).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "FileSystemCollection: #concat - Left identity",
  () => {
    const container = FileSystemCollection([
      File.fromPath(`${Deno.cwd()}/hoge`),
      File.fromPath(`${Deno.cwd()}/piyo`),
      File.fromPath(`${Deno.cwd()}/fuga`)
    ]);

    assertEquals(
      FileSystemCollection.empty().concat(container).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "FileSystemCollection: #concat - Associativity",
  () => {
    const containerA = FileSystemCollection([ File.fromPath(`${Deno.cwd()}/hoge`) ]);
    const containerB = FileSystemCollection([ File.fromPath(`${Deno.cwd()}/piyo`) ]);
    const containerC = FileSystemCollection([ File.fromPath(`${Deno.cwd()}/fuga`) ]);

    assertEquals(
      containerA.concat(containerB).concat(containerC).toString(),
      containerA.concat(containerB.concat(containerC)).toString()
    );
  }
);

Deno.test(
  "FileSystemCollection: #empty - Right identity",
  () => {
    const container = FileSystemCollection([
      File.fromPath(`${Deno.cwd()}/hoge`),
      File.fromPath(`${Deno.cwd()}/piyo`),
      File.fromPath(`${Deno.cwd()}/fuga`)
    ]);

    assertEquals(
      container.concat(container.empty()).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "FileSystemCollection: #empty - Left identity",
  () => {
    const container = FileSystemCollection([
      File.fromPath(`${Deno.cwd()}/hoge`),
      File.fromPath(`${Deno.cwd()}/piyo`),
      File.fromPath(`${Deno.cwd()}/fuga`)
    ]);

    assertEquals(
      container.empty().concat(container).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "FileSystemCollection: #invert - Right identity",
  () => {
    const container = FileSystemCollection([]);

    assertEquals(
      container.concat(container.invert()).toString(),
      FileSystemCollection.empty().toString()
    );
  }
);

Deno.test(
  "FileSystemCollection: #invert - Left identity",
  () => {
    const container = FileSystemCollection([]);

    assertEquals(
      container.invert().concat(container).toString(),
      FileSystemCollection.empty().toString()
    );
  }
);

Deno.test(
  "FileSystemCollection: #map - Identity",
  () => {
    const container = FileSystemCollection([
      File.fromPath(`${Deno.cwd()}/hoge`),
      File.fromPath(`${Deno.cwd()}/piyo`),
      File.fromPath(`${Deno.cwd()}/fuga`)
    ]);

    assertEquals(
      container.map(x => x).toString(),
      container.toString()
    );
  }
);

Deno.test(
  "FileSystemCollection: #map - Composition",
  () => {
    const container = FileSystemCollection([
      File.fromPath(`${Deno.cwd()}/hoge`),
      File.fromPath(`${Deno.cwd()}/piyo`),
      File.fromPath(`${Deno.cwd()}/fuga`)
    ]);
    const f = file => File.from({ ...file, path: `${file.path}.js` });
    const g = file => File.from({ ...file, rid: file.path + 1 });

    assertEquals(
      container.map(f).map(g).toString(),
      container.map(x => g(f(x))).toString()
    );
  }
);

Deno.test(
  "FileSystemCollection: #traverse - --",
  () => {
    const container = FileSystemCollection([
      File("", new Uint8Array([ 65, 66, 67, 68, 69 ]), 0),
      File("", new Uint8Array([ 70, 71, 72, 73, 74 ]), 0),
      File("", new Uint8Array([ 75, 76, 77, 78, 79 ]), 0),
    ]);

    assertEquals(
      container.traverse(_ => File.of(new Uint8Array([])), x => x).toString(),
      FileSystemCollection(
        File(
          "",
          new Uint8Array([ 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79 ]),
          0
        )
      ).toString()
    );
  }
);

// Deno.test(
//   "FileSystemCollection: #traverse - Identity",
//   () => {
//     const container = FileSystemCollection([]);
//
//     assertEquals(
//       container.traverse(_ => File.of(new Uint8Array([])), x => x).toString(),
//       FileSystemCollection.of(container).toString()
//     );
//   }
// );

// Deno.test(
//   "FileSystemCollection: #traverse - Naturality",
//   () => {
//     const container = FileSystemCollection([
//       File("", new Uint8Array([ 65, 66, 67, 68, 69 ]), 0),
//       File("", new Uint8Array([ 70, 71, 72, 73, 74 ]), 0),
//       File("", new Uint8Array([ 75, 76, 77, 78, 79 ]), 0),
//     ]);
//     const f = x => File.of(x);
//
//     assertEquals(
//       f(container.traverse(File, x => x)).toString(),
//       container.traverse(File, f).toString()
//     );
//   }
// );
