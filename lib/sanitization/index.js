const defaultSanitizer = require("./defaultSanitizer");
const defaultOpts = {
  sanitizer: defaultSanitizer,
  sanitizeQuery: true,
  sanitizeBody: true,
};

const patchOpts = (opts) => {
  let patchedOpts = Object.assign({}, defaultOpts);
  if (opts) {
    Object.assign(patchedOpts, opts);
  }
  return patchedOpts;
};
const sanitize = (source, sanitizer) => {
  const keys = Object.keys(source);
  keys.forEach((key) => {
    source[key] = sanitizer(key, source[key]);
  });
};

const sanitizationMiddleware = (opts) => {
  const patchedOpts = patchOpts(opts);

  return (req, res, next) => {
    if (patchedOpts.sanitizeQuery && req.query) {
      sanitize(req.query, patchedOpts.sanitizer);
    }
    if (patchedOpts.sanitizeBody && req.body) {
      sanitize(req.body, patchedOpts.sanitizer);
    }
    return next();
  };
};

sanitizationMiddleware.defaultSanitizer = defaultSanitizer;

module.exports = sanitizationMiddleware;
