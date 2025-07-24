# login.dfe.express-helpers

Sanitization, error handling middleware, and http helpers for express applications

[![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest)

## Contents

- [Usage](#usage)
  - [Sanitization](#sanitization)
    - [Customise what is sanitized](#customise-what-is-sanitized)
    - [Customise sanitization](#customise-sanitization)
  - [Error Handler middleware](#error-handler-middleware)
    - [asyncWrapper](#asyncwrapper)
    - [EJS Error Page Renderer](#ejs-error-page-renderer)
  - [Http helpers](#http-helpers)
    - [Transient cookies middleware](#transient-cookies-middleware)

# Usage

## Sanitization

The following example will sanitize both req.query and req.body values

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const sanitization = require("login.dfe.express-helpers/sanitization");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// This line must come AFTER using body-parser
app.use(sanitization());
```

### Customise what is sanitized

You can also specify if you want to not sanitise either query or body values

```javascript
app.use(
  sanitization({
    sanitizeQuery: false,
  }),
);
```

```javascript
app.use(
  sanitization({
    sanitizeBody: false,
  }),
);
```

### Customise sanitization

You can also customise the sanitization routine. The following example shows applying a custom rule to enforce a specific regex for a uid parameter.

```javascript
app.use(
  sanitization({
    sanitizer: (key, value) => {
      if (key.toLowerCase() === "uid") {
        return !/^[A-Za-z0-9]+$/.test(value) ? "" : value;
      } else {
        // You can still call the default sanitizer too
        return sanitization.defaultSanitizer(key, value);
      }
    },
  }),
);
```

## Error Handler middleware

The error handler middleware provides a standard express error handler middleware function that will log
the error and return a 500 result. It takes an object that can have a `logger` and `errorPageRenderer`.

`logger` should be an object that has an error function on it, with a signature `error(message, details)`; where message is a string nad details is an object.

`errorPageRenderer` is optional, but if passed, should be a function that can take an error and return an object with properties `content` and `contentType`. These will be used as the respective details in the response.

```javascript
const { getErrorHandler } = require("login.dfe.express-helpers/error-handling");
const errorPageRenderer = (error) => {
  render("500", { error });
};

app.use(getErrorHandler(logger, errorPageRenderer));
```

### asyncWrapper

The `asyncWrapper` can be used to wrap async actions for express, so that errors are handled and
passed through the standard express error chain.

```javascript
const { asyncWrapper } = require("login.dfe.express-helpers/error-handling");

app.use(
  "/my-route",
  asyncWrapper(async (req, res) => {
    await someAction();

    res.status(204).send();
  }),
);
```

### EJS Error Page Renderer

The package includes an EJS error page renderer:

```javascript
const { getErrorHandler, ejsErrorPages } = require("login.dfe.express-helpers/error-handling");

const showErrorDetailsOnPage = false; // You can include error details on the page in appropriate environments

// Links to common locations, such as help or static assets
const urls = {
  help: 'http://url.to/help'
  assets: 'http://cdn.with.assets',
  assetsVersion: 'v1'
};
//assetsVersion is a string that will be added when requesting static assets
// http://cdn.with.assets/assetName?version=v1

const errorPageRenderer = ejsErrorPages.getErrorPageRenderer(urls, showErrorDetailsOnPage);

app.use(getErrorHandler({
  logger,
  errorPageRenderer,
}));
```

## Http helpers

Provides helper functions for common http related activities.

### Transient cookies middleware

This middleware intercepts HTTP Set-Cookie headers and modifies cookies that match specified name patterns to make them transient, i.e., removes any Expires or Max-Age attributes.

By removing persistence attributes the cookies will be treated as session cookies, lasting only for the duration of the browser session. This is useful in situations where sensitive cookies should not be persisted across sessions.

```javascript
const { setCookiesAsTransient } = require("login.dfe.express-helpers/http");

// target all cookies that match the regular expression /\.sig$/
app.use(
  setCookiesAsTransient({
    pattern: [/\.sig$/],
    handler: your - handler - here,
  }),
);
```
