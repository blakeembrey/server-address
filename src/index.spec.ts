import * as http from "http";
import * as https from "https";
import { compose } from "throwback";
import { fetch, toFetch, Request } from "popsicle/dist/node";
import { transport } from "popsicle-transport-http";
import { join } from "path";
import { readFileSync } from "fs";
import { AddressInfo } from "net";
import { ServerAddress } from "./index";

const unsafeFetch = toFetch(
  compose([
    transport({
      rejectUnauthorized: false
    })
  ]),
  Request
);

describe("server address", () => {
  describe("server function", () => {
    const server = new ServerAddress(handler);

    it("should throw when retrieving a url and not listening", () => {
      expect(() => server.url("/foo")).toThrow(/Server is not listening/);
    });

    describe("listening", () => {
      beforeEach(() => server.listen());

      afterEach(() => server.close());

      it("should resolve empty paths", () => {
        expect(server.url()).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
      });

      it("should support handler functions", async () => {
        const res = await fetch(server.url("/foo"));

        expect(await res.text()).toEqual("GET /foo");
      });

      it("should close immediately", async () => {
        const url1 = server.url("/foo");
        const url2 = server.url("/bar");

        const res = await fetch(url1);

        expect(await res.text()).toEqual("GET /foo");

        server.close();

        await expect(fetch(url2)).rejects.toThrow(/Unable to connect/);
      });
    });
  });

  it("should support http servers", async () => {
    const server = new ServerAddress(http.createServer(handler));

    server.listen();

    const res = await fetch(server.url("/foo"));

    expect(await res.text()).toEqual("GET /foo");

    server.close();
  });

  it("should support https servers", async () => {
    const server = new ServerAddress(
      https.createServer(
        {
          key: readFileSync(join(__dirname, "../fixtures/key.pem")),
          cert: readFileSync(join(__dirname, "../fixtures/key-cert.pem"))
        },
        handler
      )
    );

    server.listen();

    const res = await unsafeFetch(server.url("/foo"));

    expect(await res.text()).toEqual("GET /foo");

    server.close();
  });

  it("should not listen or close an already listening server", async () => {
    const app = http.createServer(handler).listen(0);
    const originalPort = (app.address() as AddressInfo).port;
    const server = new ServerAddress(app);

    server.listen();

    expect((app.address() as AddressInfo).port).toEqual(originalPort);

    const res = await fetch(server.url("/foo"));

    expect(await res.text()).toEqual("GET /foo");

    server.close();

    expect(app.address()).toEqual(null);
  });

  it("should support callback on `listen()`", done => {
    const server = new ServerAddress(http.createServer(handler));

    server.listen(() => {
      server.close(done);
    });
  });

  it("should support callback on `listen()` when already listening", done => {
    const server = new ServerAddress(http.createServer(handler).listen(0));

    server.listen(() => {
      server.close(done);
    });
  });
});

/**
 * Create a http request handler.
 */
function handler(req: http.IncomingMessage, res: http.ServerResponse) {
  res.write(req.method + " " + req.url);
  res.end();
}
