const sanitizeAndEncode = require("./../../lib/sanitization/defaultSanitizer");

describe("when sanitizing using the default sanitizer", () => {
  it.each([
    ["Abc", "Abc"],
    ["<hacker>", ""],
    ["{brace}", "{brace}"],
    ['<script>alert("XSS")</script>', ""],
    ["<!-- This is a comment -->", ""],
    ["?param=1&other=2", "?param=1&amp;other=2"],
    ["Hello&nbsp;World", "Hello&nbsp;World"],
    ["&", "&amp;"],
    ["😊", "😊"],
    ["A & B", "A &amp; B"],
    ["<", "&lt;"],
    ["<<", "&lt;&lt;"],
    [">", "&gt;"],
    [">>", "&gt;&gt;"],
    ["<>", "&lt;&gt;"],
    ["<b />", "&lt;b&gt;&lt;/b&gt;"],
    [
      "<a href='https://www.test.com'>click me</a>",
      "&lt;a&gt;click me&lt;/a&gt;",
    ],
    [
      "<a href=\"javascript:alert('XSS')\">Click Me</a>",
      "&lt;a&gt;Click Me&lt;/a&gt;",
    ],
  ])(`Input data "%s" should output "%s"`, (input, expectedOutput) => {
    expect(sanitizeAndEncode("key", input)).toBe(expectedOutput);
  });
});
