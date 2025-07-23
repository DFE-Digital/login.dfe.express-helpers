/**
 * @typedef {Object} TransientCookieOptions
 * @property {RegExp[]} pattern - Regex patterns to match cookie names.
 * @property {(req, res, next?) => void | Promise<void>} handler
 */

/**
 * Creates an Express middleware that removes `expires` and `max-age`
 * attributes from selected cookies, making them transient (session‑only).
 *
 * @param {TransientCookieOptions} options
 * @returns {Function} Express-style middleware.
 *
 * @example
 * const { setCookiesAsTransient } = require("login.dfe.express-error-handling");
 * app.use(setCookiesAsTransient({
 *   pattern: [/\.sig$/],
 *   handler: your-handler-here,
 * }));
 */
function setCookiesAsTransient(options) {
  /**
   * Does the cookie name match *any* supplied regex?
   * Accepts a full Set‑Cookie string, extracts the name (text before “=”),
   * and tests against each pattern.
   */
  const match = (cookie) => {
    const name = cookie.split("=")[0];
    return options.pattern.some((regExPattern) => regExPattern.test(name));
  };

  /**
   * Returned middleware
   */
  return function (req, res, next) {
    const originalWriteHead = res.writeHead;

    res.writeHead = function (...args) {
      const cookies = res.getHeader("set-cookie") || [];

      const modifiedCookies = cookies.map((cookie) => {
        const isExpired = /;\s*expires=Thu, 01 Jan 1970/i.test(cookie);
        if (match(cookie) && !isExpired) {
          return cookie
            .replace(/;\s*expires=[^;]+/gi, "")
            .replace(/;\s*max-age=[^;]+/gi, "");
        }
        return cookie;
      });

      res.setHeader("set-cookie", modifiedCookies);
      return originalWriteHead.apply(res, args);
    };

    options.handler(req, res, next);
  };
}

module.exports = setCookiesAsTransient;
