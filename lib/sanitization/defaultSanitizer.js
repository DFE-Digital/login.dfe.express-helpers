const { sanitize } = require("sanitizer");

const sanatizeAndEncode = (key, value) => {
  let sanatised = value;
  if (typeof sanatised === "string") {
    sanatised = sanitize(sanatised);
    sanatised = sanatised.replace(/[<>]/g, (matched) => {
      switch (matched) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        default:
          return "";
      }
    });
  } else if (sanatised instanceof Object) {
    Object.keys(sanatised).forEach((prop) => {
      sanatised[prop] = sanatizeAndEncode(prop, sanatised[prop]);
    });
  }
  return sanatised;
};

module.exports = sanatizeAndEncode;
