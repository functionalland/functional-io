import { assertEquals } from "https://deno.land/std@0.79.0/testing/asserts.ts";

import Buffer from "./Buffer.js";
import {
  coerceAsReader,
  coerceAsWriter,
  discardFirstLine,
  discardNCharacter,
  findCLRFIndex, getFirstLine, joinCLRF,
  splitCLRF,
  trimCRLF
} from "./utilities.js";

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

Deno.test(
  "findCLRFIndex",
  () => {
    assertEquals(
      findCLRFIndex(new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
      6
    );

    assertEquals(
      findCLRFIndex(new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])),
      6
    );

    assertEquals(
      findCLRFIndex(new Uint8Array([ 104, 111, 103, 101, 13, 104, 111, 103, 101 ])),
      -1
    );

    assertEquals(
      findCLRFIndex(new Uint8Array([ 104, 111, 103, 101, 10, 104, 111, 103, 101 ])),
      -1
    );
  }
);

Deno.test(
  "discardFirstLine",
  () => {
    assertEquals(
      discardFirstLine(new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])),
      new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
    );

    assertEquals(
      discardFirstLine(new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
      new Uint8Array([])
    );
  }
);

Deno.test(
  "discardNCharacter",
  () => {
    assertEquals(
      discardNCharacter(1, new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
      new Uint8Array([ 111, 103, 101, 13, 10 ])
    );
  }
);

Deno.test(
  "getFirstLine",
  () => {
    assertEquals(
      getFirstLine(new Uint8Array([ 104, 111, 103, 101, 13, 10, 104, 111, 103, 101, 13, 10 ])),
      new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
    );

    assertEquals(
      getFirstLine(new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
      new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
    );
  }
);

Deno.test(
  "joinCLRF",
  () => {
    assertEquals(
      joinCLRF(
        [
          new Uint8Array([ 104, 111, 103, 101 ]),
          new Uint8Array([ 112, 105, 121, 111 ])
        ]
      ),
      new Uint8Array([ 104, 111, 103, 101, 13, 10, 112, 105, 121, 111, 13, 10 ])
    );

    assertEquals(
      joinCLRF([ new Uint8Array([ 104, 111, 103, 101 ]) ]),
      new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
    );
  }
)

Deno.test(
  "splitCLRF",
  () => {
    assertEquals(
      splitCLRF(new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
      [
        new Uint8Array([ 104, 111, 103, 101, 13, 10 ])
      ]
    );

    assertEquals(
      splitCLRF(new Uint8Array([ 104, 111, 103, 101, 13, 10, 112, 105, 121, 111, 13, 10 ])),
      [
        new Uint8Array([ 104, 111, 103, 101, 13, 10 ]),
        new Uint8Array([ 112, 105, 121, 111, 13, 10 ])
      ]
    );

    assertEquals(
      splitCLRF(new Uint8Array([ 104, 111, 103, 101, 13, 112, 105, 121, 111 ])),
      [
        new Uint8Array([ 104, 111, 103, 101, 13, 112, 105, 121, 111 ])
      ]
    );

    assertEquals(
      splitCLRF(new Uint8Array([ 104, 111, 103, 101, 10, 112, 105, 121, 111 ])),
      [
        new Uint8Array([ 104, 111, 103, 101, 10, 112, 105, 121, 111 ])
      ]
    );
  }
);

Deno.test(
  "trimCRLF",
  () => {
    assertEquals(
      trimCRLF(new Uint8Array([ 104, 111, 103, 101, 13, 10 ])),
      new Uint8Array([ 104, 111, 103, 101 ])
    );

    assertEquals(
      trimCRLF(new Uint8Array([ 13, 10, 104, 111, 103, 101, 13, 10 ])),
      new Uint8Array([ 104, 111, 103, 101 ])
    );

    assertEquals(
      trimCRLF(new Uint8Array([ 13, 10, 13, 10, 104, 111, 103, 101, 13, 10 ])),
      new Uint8Array([ 104, 111, 103, 101 ])
    );

    assertEquals(
      trimCRLF(new Uint8Array([ 13, 10, 104, 111, 103, 101, 13, 10, 112, 105, 121, 111, 13, 10 ])),
      new Uint8Array([ 104, 111, 103, 101, 13, 10, 112, 105, 121, 111 ])
    );

    assertEquals(
      trimCRLF(new Uint8Array([ 104, 111, 103, 101 ])),
      new Uint8Array([ 104, 111, 103, 101 ])
    );
  }
);
