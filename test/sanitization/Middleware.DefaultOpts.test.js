const sanitization = require("./../../lib/sanitization");
const middleware = sanitization();

describe("When using default options", () => {
  let req;
  const res = {};
  const next = jest.fn();

  beforeEach(() => {
    req = {
      query: {
        bad: "<script>alert(1);</script>",
        good: "test",
        mixed: "te<script>alert(1);</script>st",
      },
      body: {
        bad: "<script>alert(1);</script>",
        good: "test",
        mixed: "te<script>alert(1);</script>st",
        goodJson: { id: 1, value: "test" },
        badJson: { id: 1, value: "<script>alert(1);</script>" },
        mixedJson: { id: 1, value: "te<script>alert(1);</script>st" },
      },
    };
    next.mockReset();
  });

  it("then it sanitize purely bad query params", () => {
    middleware(req, res, next);

    expect(req.query.bad).toBe("");
  });

  it("then it leave purely good query params untouched", () => {
    middleware(req, res, next);

    expect(req.query.good).toBe("test");
  });

  it("then it sanitize query params with bad mixed in good", () => {
    middleware(req, res, next);

    expect(req.query.mixed).toBe("test");
  });

  it("then it sanitize purely bad body params", () => {
    middleware(req, res, next);

    expect(req.body.bad).toBe("");
  });

  it("then it leave purely good body params untouched", () => {
    middleware(req, res, next);

    expect(req.body.good).toBe("test");
  });

  it("then it sanitize body params with bad mixed in good", () => {
    middleware(req, res, next);

    expect(req.body.mixed).toBe("test");
  });

  it("then it sanitize purely bad json body params", () => {
    middleware(req, res, next);

    expect(req.body.badJson.value).toBe("");
    expect(req.body.badJson.id).toBe(1);
  });

  it("then it leave purely good json body params untouched", () => {
    middleware(req, res, next);

    expect(req.body.goodJson.value).toBe("test");
    expect(req.body.goodJson.id).toBe(1);
  });

  it("then it sanitize json body params with bad mixed in good", () => {
    middleware(req, res, next);

    expect(req.body.mixedJson.value).toBe("test");
    expect(req.body.mixedJson.id).toBe(1);
  });

  it("then it should call next", () => {
    middleware(req, res, next);

    expect(next.mock.calls).toHaveLength(1);
  });
});
