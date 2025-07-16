const { asyncWrapper } = require("../../lib/errorHandling");

const action = jest.fn();
const wrappedAction = asyncWrapper(action);
const req = {};
const res = {};
const next = jest.fn();

describe("when wrapping an action in asyncWrapper", () => {
  beforeEach(() => {
    action.mockReset();

    next.mockReset();
  });

  it("then it should call the action with passed req, res and next", async () => {
    await wrappedAction(req, res, next);

    expect(action.mock.calls).toHaveLength(1);
    expect(action.mock.calls[0][0]).toBe(req);
    expect(action.mock.calls[0][1]).toBe(res);
    expect(action.mock.calls[0][2]).toBe(next);
  });

  it("then it should call next with error if action throws error", async () => {
    const error = new Error("test");
    action.mockImplementation(() => {
      throw error;
    });

    await wrappedAction(req, res, next);

    expect(next.mock.calls).toHaveLength(1);
    expect(next.mock.calls[0][0]).toBe(error);
  });

  it("then it should not call next if action does not throw error", async () => {
    await wrappedAction(req, res, next);

    expect(next.mock.calls).toHaveLength(0);
  });
});
