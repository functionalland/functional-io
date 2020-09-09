import { Connection } from "./types.js";
import Task from "../../functional/library/Task";

// connect :: Connection a -> Task e Connection a
export const connect = connection => Connection.isOrThrow(connection)
  && Task.wrap(
    _ => Deno.connect(
      {
        hostname: connection.hostname,
        port: connection.port || 80,
        transport: connection.transport
      }
    )
  )
    .map(_connection => Connection(_connection));

// connectTls :: Connection a -> Task e Connection a
export const connectTls = connection => Connection.isOrThrow(connection)
  && Task.wrap(
    _ => Deno.connect(
      {
        certFile: connection.certFile,
        hostname: connection.hostname,
        port: connection.port || 80
      }
    )
  )
    .map(_connection => Connection(_connection));