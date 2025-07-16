const { getErrorHandler } = require("../../lib/errorHandling");

const logger = {
  log: jest.fn(),
};
const errorPageRenderer = jest.fn();
const error = new Error("test");
const req = {
  url: "/some-url",
  method: "GET",
};
const res = {
  headersSent: false,
  status: jest.fn(),
  contentType: jest.fn(),
  send: jest.fn(),
};
const next = jest.fn();

describe("when using express error handler middleware", () => {
  beforeEach(() => {
    logger.log.mockReset();

    errorPageRenderer.mockReset();
    errorPageRenderer.mockReturnValue({
      content: "Error content here",
      contentType: "text/plain",
    });

    res.headersSent = false;
    res.status.mockReset();
    res.contentType.mockReset();
    res.send.mockReset();

    next.mockReset();
  });

  it("then it should return error handling middleware", () => {
    const middleware = getErrorHandler({ logger, errorPageRenderer });

    expect(middleware).toBeInstanceOf(Function);
  });

  it("then it should log error", () => {
    const middleware = getErrorHandler({ logger, errorPageRenderer });

    middleware(error, req, res, next);

    expect(logger.log.mock.calls).toHaveLength(1);
    expect(logger.log.mock.calls[0][0]).toMatchObject({
      level: "error",
      message: "Error occurred processing GET /some-url: test",
      meta: {
        url: "/some-url",
        method: "GET",
        error,
      },
    });
  });

  it("then it should call next with error if headers already sent", () => {
    const middleware = getErrorHandler({ logger, errorPageRenderer });
    res.headersSent = true;

    middleware(error, req, res, next);

    expect(next.mock.calls).toHaveLength(1);
    expect(next.mock.calls[0][0]).toBe(error);
  });

  it("then it should send status code 500", () => {
    const middleware = getErrorHandler({ logger, errorPageRenderer });

    middleware(error, req, res, next);

    expect(res.status.mock.calls).toHaveLength(1);
    expect(res.status.mock.calls[0][0]).toBe(500);
  });

  it("then it should set content type from errorPageRenderer", () => {
    const middleware = getErrorHandler({ logger, errorPageRenderer });

    middleware(error, req, res, next);

    expect(res.contentType.mock.calls).toHaveLength(1);
    expect(res.contentType.mock.calls[0][0]).toBe("text/plain");
  });

  it("then it should send content from errorPageRenderer", () => {
    const middleware = getErrorHandler({ logger, errorPageRenderer });

    middleware(error, req, res, next);

    expect(res.send.mock.calls).toHaveLength(1);
    expect(res.send.mock.calls[0][0]).toBe("Error content here");
  });

  it("then it should not set content type or send content if errorPageRender not passed", () => {
    const middleware = getErrorHandler({ logger });

    middleware(error, req, res, next);

    expect(res.contentType.mock.calls).toHaveLength(0);
    expect(res.send.mock.calls).toHaveLength(1);
    expect(res.send.mock.calls[0][0]).toBeNull();
  });
});
