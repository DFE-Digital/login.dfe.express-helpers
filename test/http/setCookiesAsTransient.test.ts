const http = require("http");
const setCookiesAsTransient = require("../../lib/http/setCookiesAsTransient");

describe("setCookiesAsTransient", () => {
  let req, res, next, calledNext, cookiesSet;

  beforeEach(() => {
    req = new http.IncomingMessage();
    res = new http.ServerResponse(req);

    cookiesSet = [];
    res.getHeader = jest.fn(() => cookiesSet);
    res.setHeader = jest.fn((name, value) => {
      if (name.toLowerCase() === "set-cookie") {
        cookiesSet = value;
      }
    });

    res.writeHead = jest.fn(function (...args) {
      return this;
    });

    calledNext = false;
    next = () => {
      calledNext = true;
    };
  });

  describe("when cookie names match the provided patterns", () => {
    it("then removes `expires` and `max-age` attributes", () => {
      cookiesSet = [
        "_dsi_session.sig=xyz; Expires=Wed, 01 Jan 2025 00:00:00 GMT; Max-Age=3600",
        "something.sig.foo=abc; Expires=Wed, 01 Jan 2025 00:00:00 GMT",
        "session=abc; Expires=Wed, 01 Jan 2025 00:00:00 GMT",
      ];

      const middleware = setCookiesAsTransient({
        pattern: [/\.sig$/],
        handler: (req, res, next) => res.writeHead(200),
      });

      middleware(req, res, next);

      const modifiedCookies = cookiesSet;

      expect(modifiedCookies[0]).not.toMatch(/expires/i);
      expect(modifiedCookies[0]).not.toMatch(/max-age/i);
      expect(modifiedCookies[1]).toMatch(/expires/i);
      expect(cookiesSet[2]).toMatch(/expires/i);
    });
  });

  describe("when cookie names do not match any pattern", () => {
    it("then leaves the cookies unchanged", () => {
      cookiesSet = [
        "_dsi_session.sig=xyz; Expires=Wed, 01 Jan 2025 00:00:00 GMT; Max-Age=3600",
        "OTHER=abc; Expires=Wed, 01 Jan 2025 00:00:00 GMT",
      ];

      const middleware = setCookiesAsTransient({
        pattern: [/^SID_/],
        handler: (req, res, next) => res.writeHead(200),
      });

      middleware(req, res, next);

      const modifiedCookies = cookiesSet;

      expect(modifiedCookies[0]).toMatch(/expires/i);
      expect(modifiedCookies[0]).toMatch(/max-age/i);
      expect(modifiedCookies[1]).toMatch(/expires/i);
    });
  });

  describe("when a cookie is already expired", () => {
    it("then does not modify it", () => {
      cookiesSet = [
        "_dsi_session.sig=deleted; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0",
      ];

      const middleware = setCookiesAsTransient({
        pattern: [/\.sig$/],
        handler: (req, res, next) => res.writeHead(200),
      });

      middleware(req, res, next);

      const modifiedCookies = cookiesSet;

      expect(modifiedCookies[0]).toMatch(/expires/i);
      expect(modifiedCookies[0]).toMatch(/max-age/i);
    });
  });

  describe("when the middleware handler is executed", () => {
    it("then calls the handler and `next`", () => {
      const handler = jest.fn((req, res, next) => {
        res.writeHead(200);
        next();
      });

      const middleware = setCookiesAsTransient({
        pattern: [/\.sig$/],
        handler,
      });

      middleware(req, res, next);

      expect(handler).toHaveBeenCalled();
      expect(calledNext).toBe(true);
    });
  });
});
