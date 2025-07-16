const sanitization = require("./../../lib/sanitization");
const defaultOpts = {
  sanitizer: (key, value) => {
    if (key === "notspecial") {
      return sanitization.defaultSanitizer(key, value);
    }
    return value.split("").reverse().join("");
  },
};
const middleware = sanitization(defaultOpts);

describe("When using a custom sanitizer", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      query: {
        uid: "user1",
      },
      body: {
        username: "usertwo",
      },
    };
    res = {};
    next = jest.fn();
  });

  it("then it should sanitize query params", () => {
    middleware(req, res, next);

    expect(req.query.uid).toBe("1resu");
  });

  it("then it should sanitize body params", () => {
    middleware(req, res, next);

    expect(req.body.username).toBe("owtresu");
  });

  it("then it should not sanitize query if sanitizeQuery is false", () => {
    const opts = Object.assign({ sanitizeQuery: false }, defaultOpts);
    const mw = sanitization(opts);

    mw(req, res, next);

    expect(req.query.uid).toBe("user1");
  });

  it("then it should not sanitize query if sanitizeQuery is false", () => {
    const opts = Object.assign({ sanitizeQuery: false }, defaultOpts);
    const mw = sanitization(opts);

    mw(req, res, next);

    expect(req.query.uid).toBe("user1");
  });

  it("then it should not sanitize body if sanitizeBody is false", () => {
    const opts = Object.assign({ sanitizeBody: false }, defaultOpts);
    const mw = sanitization(opts);

    mw(req, res, next);

    expect(req.body.username).toBe("usertwo");
  });

  it("then it should allow calling the default sanitizer", () => {
    req.query.notspecial = "cl<script>alert(1)</script>ean";

    middleware(req, res, next);

    expect(req.query.notspecial).toBe("clean");
  });

  it("then it should call next", () => {
    middleware(req, res, next);

    expect(next.mock.calls).toHaveLength(1);
  });
});
