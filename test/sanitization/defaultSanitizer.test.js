jest.mock("sanitizer");

const { sanitize } = require("sanitizer");

const sanitizeAndEncode = require("./../../lib/sanitization/defaultSanitizer");

describe("when sanitizing using the default sanitizer", () => {
  it("then it should sanatize and encode string values", () => {
    sanitize.mockReset().mockReturnValue("sanitized");
    const actual = sanitizeAndEncode("key", "value");

    expect(actual).toBe("sanitized");
    expect(sanitize.mock.calls).toHaveLength(1);
    expect(sanitize.mock.calls[0][0]).toBe("value");
  });

  it("then it should sanatize and encode all properties of object values", () => {
    sanitize.mockReset().mockImplementation((value) => {
      return "sanitized-" + value;
    });
    const actual = sanitizeAndEncode("key", {
      one: "value1",
      two: "value2",
      three: {
        a: "value3",
        b: "value4",
      },
    });

    expect(actual).toEqual({
      one: "sanitized-value1",
      two: "sanitized-value2",
      three: {
        a: "sanitized-value3",
        b: "sanitized-value4",
      },
    });
    expect(sanitize.mock.calls).toHaveLength(4);
    expect(sanitize.mock.calls[0][0]).toBe("value1");
    expect(sanitize.mock.calls[1][0]).toBe("value2");
    expect(sanitize.mock.calls[2][0]).toBe("value3");
    expect(sanitize.mock.calls[3][0]).toBe("value4");
  });

  it("then it should sanatize and encode all elements of array values", () => {
    sanitize.mockReset().mockImplementation((value) => {
      return "sanitized-" + value;
    });

    const actual = sanitizeAndEncode("key", ["value1", "value2"]);

    expect(actual[0]).toBe("sanitized-value1");
    expect(actual[1]).toBe("sanitized-value2");
    expect(sanitize.mock.calls).toHaveLength(2);
    expect(sanitize.mock.calls[0][0]).toBe("value1");
    expect(sanitize.mock.calls[1][0]).toBe("value2");
  });
});
