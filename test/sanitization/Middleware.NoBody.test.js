const sanitization = require("./../../lib/sanitization");
const middleware = sanitization({
  sanitizeBody: false,
});

describe("When using default options", () => {
  const req = {
    query: {
      bad: "<script>alert(1);</script>",
      good: "test",
      mixed: "te<script>alert(1);</script>st",
    },
    body: {
      bad: "<script>alert(1);</script>",
      good: "test",
      mixed: "te<script>alert(1);</script>st",
    },
  };
  const res = {};
  const next = jest.fn();

  beforeEach(() => {
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

  it("then it should not touch body params", () => {
    middleware(req, res, next);

    expect(req.body.bad).toBe("<script>alert(1);</script>");
    expect(req.body.good).toBe("test");
    expect(req.body.mixed).toBe("te<script>alert(1);</script>st");
  });

  it("then it should call next", () => {
    middleware(req, res, next);

    expect(next.mock.calls).toHaveLength(1);
  });
});
