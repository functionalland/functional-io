import { serve } from "https://deno.land/std@0.70.0/http/server.ts";
const server = serve({ port:8000 });
console.debug("FU")

for await (const request of server) {
  request.respond({ body: "hello world" });
}