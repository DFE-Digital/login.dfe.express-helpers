const sanitization = require("./../../lib/sanitization");
const middleware = sanitization({
  sanitizeQuery: false,
  sanitizeBody: false,
});

describe("When using options that do not sanitize query", () => {
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

  it("then it should not touch query params", () => {
    middleware(req, res, next);

    expect(req.query.bad).toBe("<script>alert(1);</script>");
    expect(req.query.good).toBe("test");
    expect(req.query.mixed).toBe("te<script>alert(1);</script>st");
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
