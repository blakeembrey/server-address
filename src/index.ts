import * as http from "http";
import * as https from "https";
import { resolve } from "url";

export class ServerAddress {
  server: http.Server | https.Server;
  protocol: string;
  isListening = false;
  connections = new Set<any>();

  constructor(app: http.RequestListener | http.Server | https.Server) {
    this.server = typeof app === "function" ? http.createServer(app) : app;
    this.protocol = app instanceof https.Server ? "https" : "http";
  }

  /**
   * Listen to a random port number.
   */
  listen(cb?: () => void) {
    if (!this.server.address()) {
      this.server.listen(0, cb);
    } else if (cb) {
      process.nextTick(cb);
    }

    if (!this.isListening) {
      this.isListening = true;

      this.server.on("connection", c => {
        this.connections.add(c);

        c.on("close", () => {
          this.connections.delete(c);
        });
      });
    }
  }

  /**
   * Close the server (if listening).
   */
  close(cb?: () => void) {
    this.server.close(cb);

    for (const connection of this.connections.values()) {
      connection.destroy();
    }
  }

  /**
   * Resolve a URL to the server location.
   */
  url(path?: string) {
    const addr = this.server.address();

    if (!addr) {
      throw new TypeError("Server is not listening");
    }

    const origin =
      typeof addr === "string"
        ? addr
        : `${this.protocol}://127.0.0.1:${addr.port}`;

    return path ? resolve(origin, path) : origin;
  }
}
