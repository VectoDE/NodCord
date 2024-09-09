const sendResponse = (req, res, redirectUrl, response) => {
  if (!req || !res) {
    throw new Error('Request or Response object is undefined');
  }
  if (req.accepts('html')) {
    res.redirect(redirectUrl);
  } else {
    res.json(response);
  }
};

module.exports = sendResponse;
