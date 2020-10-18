// @deno-types="./Buffer.d.ts"
import Buffer from "./Buffer.js";
import type { BufferPrototype } from "./Buffer.d.ts";
// @deno-types="./Directory.d.ts"
import Directory from "./Directory.js";
import type { DirectoryPrototype } from "./Directory.d.ts";
// @deno-types="./File.d.ts"
import File from "./File.js";
import type { FilePrototype } from "./File.d.ts";
// @deno-types="./Request.d.ts"
import Request from "./Request.js";
import type { RequestPrototype } from "./Request.d.ts";
// @deno-types="./Resource.d.ts"
import Resource from "./Resource.js";
import type { ResourcePrototype } from "./Resource.d.ts";
// @deno-types="./Response.d.ts"
import Response from "./Response.js";
import type { ResponseSuccessPrototype, ResponseFailurePrototype } from "./Response.d.ts";

Deno.test(
  "Buffer type check",
  () => {
    const containerA = Buffer(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Buffer((buffer: Uint8Array) => new Uint8Array(buffer.map(x => x + 2)));
    const f = (buffer: Uint8Array) => Buffer(new Uint8Array(buffer.map((x: number) => x + 2)));
    const g = (container: BufferPrototype) => new Uint8Array(container.raw.map((x: number) => x + 2));
    const h = (buffer: Uint8Array) => new Uint8Array(buffer.map((x: number) => x + 2));

    const containerC = containerA.ap(containerB);
    const containerD = containerA.chain(f);
    const containerE = containerC.concat(containerD);
    const containerF = containerE.empty();
    containerE.equals(containerF);
    const containerG = containerF.extend(g);
    containerG.extract();
    containerE.lte(containerF);
    const containerH = containerG.invert();
    const containerI = containerH.map(h);
    const containerJ = containerI.of(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    Buffer.is(containerJ);
  }
);

Deno.test(
  "Directory type check",
  () => {
    const containerA = Directory(`${Deno.cwd()}/hoge`);
    const containerB = Directory((path: string) => path.replace("hoge", "piyo"));
    const f = (path: string) => Directory(path);
    const g = (container: DirectoryPrototype) => container.path.replace("hoge", "piyo");
    const h = (path: string) => path.replace("hoge", "piyo");

    const containerC = containerA.ap(containerB);
    const containerD = containerA.chain(f);
    containerC.equals(containerD);
    const containerE = containerD.extend(g);
    containerE.extract();
    containerC.lte(containerD);
    const containerF = containerE.map(h);
    const containerG = containerF.of(`${Deno.cwd()}/hoge`);
    File.is(containerG);
  }
);

Deno.test(
  "File type check",
  () => {
    const containerA = File(`${Deno.cwd()}/hoge`, new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = File(
      `${Deno.cwd()}/hoge`,
      (buffer: Uint8Array) => new Uint8Array(buffer.map(x => x + 2)),
      3
    );
    const f = (buffer: Uint8Array) =>
      File(`${Deno.cwd()}/hoge`, new Uint8Array(buffer.map((x: number) => x + 2)), 3);
    const g = (container: FilePrototype) => new Uint8Array(container.raw.map((x: number) => x + 2));
    const h = (buffer: Uint8Array) => new Uint8Array(buffer.map((x: number) => x + 2));
    const i = (rid: number) => rid + 1;

    const containerC = containerA.ap(containerB);
    const containerD = containerA.chain(f);
    const containerE = containerC.concat(containerD);
    const containerF = containerE.empty();
    containerE.equals(containerF);
    const containerG = containerF.extend(g);
    containerG.extract();
    containerE.lte(containerF);
    const containerH = containerG.invert();
    const containerI = containerH.map(h);
    const containerJ = containerI.of(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerK = containerJ.bimap(h, i);
    File.is(containerK);
  }
);

Deno.test(
  "Resource type check",
  () => {
    const containerA = Resource(new Uint8Array([ 65, 66, 67, 68, 69 ]), 3);
    const containerB = Resource((buffer: Uint8Array) => new Uint8Array(buffer.map(x => x + 2)), 3);
    const f = (buffer: Uint8Array) => Resource(new Uint8Array(buffer.map((x: number) => x + 2)), 3);
    const g = (container: ResourcePrototype) => new Uint8Array(container.raw.map((x: number) => x + 2));
    const h = (buffer: Uint8Array) => new Uint8Array(buffer.map((x: number) => x + 2));
    const i = (rid: number) => rid + 1;

    const containerC = containerA.ap(containerB);
    const containerD = containerA.chain(f);
    const containerE = containerC.concat(containerD);
    const containerF = containerE.empty();
    containerE.equals(containerF);
    const containerG = containerF.extend(g);
    containerG.extract();
    containerE.lte(containerF);
    const containerH = containerG.invert();
    const containerI = containerH.map(h);
    const containerJ = containerI.of(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerK = containerJ.bimap(h, i);
    Resource.is(containerK);
  }
);

Deno.test(
  "Response type check",
  () => {
    const containerA = Response.Success({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Response.Success(
      {},
      (buffer: Uint8Array) => new Uint8Array(buffer.map(x => x + 2))
    );
    const f = (buffer: Uint8Array) => Response.Success({}, new Uint8Array(buffer.map((x: number) => x + 2)));
    const g = (headers: Record<string, any>) => ({ ...headers, status: 404 });
    const h = (buffer: Uint8Array) => new Uint8Array(buffer.map((x: number) => x + 2));

    const containerC = containerA.ap(containerB);
    const containerD = containerC.bimap(g, h);
    const containerE = containerD.chain(f);
    const containerF = containerE.concat(containerE);
    const containerG = containerF.empty();
    containerG.equals(containerG);
    containerG.lte(containerG);
    const containerH = containerG.invert();
    const containerI = containerH.map(h);
    const containerJ = containerI.of(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerK = containerJ.bimap(g, h);
    Response.Success.is(containerK);

    const containerL = Response.Failure({ status: 404 }, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerM = containerL.alt(containerA);
    Response.Success.is(containerM);
    const containerN = containerL.ap(containerB);
    const containerO = containerN.bimap(g, h);
    const containerP = containerO.chain(f);
    const containerQ = containerP.concat(containerM);
    Response.Failure.is(containerQ);
  }
);

Deno.test(
  "Request type check",
  () => {
    const containerA = Request({}, new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerB = Request({}, (buffer: Uint8Array) => new Uint8Array(buffer.map(x => x + 2)));
    const f = (buffer: Uint8Array) => Request({}, new Uint8Array(buffer.map((x: number) => x + 2)));
    const g = (headers: Record<string, any>) => ({ ...headers, method: "GET" });
    const h = (buffer: Uint8Array) => new Uint8Array(buffer.map((x: number) => x + 2));

    const containerC = containerA.ap(containerB);
    const containerD = containerA.chain(f);
    const containerE = containerC.concat(containerD);
    const containerF = containerE.empty();
    containerE.equals(containerF);
    containerE.lte(containerF);
    const containerG = containerF.invert();
    const containerH = containerG.map(h);
    const containerI = containerH.of(new Uint8Array([ 65, 66, 67, 68, 69 ]));
    const containerJ = containerI.bimap(g, h);
    Request.is(containerJ);
  }
);
