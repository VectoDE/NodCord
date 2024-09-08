const sendResponse = (req, res, redirectUrl, jsonData) => {
  if (req.accepts('html')) {
    res.redirect(redirectUrl);
  } else if (req.accepts('json')) {
    res.json(jsonData);
  }
};

module.exports = sendResponse;
