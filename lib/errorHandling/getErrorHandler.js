const getErrorHandler = ({ logger = console, errorPageRenderer = null }) => {
  return (err, req, res, next) => {
    const errorMessage = err instanceof Error ? err.message : err;
    logger.log({
      level: "error",
      message: `Error occurred processing ${req.method} ${req.url}: ${errorMessage}`,
      meta: {
        url: req.url,
        method: req.method,
        error: err,
      },
    });
    if (res.headersSent) {
      return next(err);
    }

    let content = null;
    let contentType = null;
    if (errorPageRenderer) {
      const errorPage = errorPageRenderer(err);
      content = errorPage.content;
      contentType = errorPage.contentType;
    }

    res.status(500);
    if (contentType) {
      res.contentType(contentType);
    }
    return res.send(content);
  };
};

module.exports = getErrorHandler;
