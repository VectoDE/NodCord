require('dotenv').config();

const getBaseUrl = () => {
  const baseUrl = `${process.env.CLIENT_HTTPS}://${process.env.CLIENT_BASE_URL}`;
  return process.env.NODE_ENV === 'production' ? baseUrl : `${baseUrl}:${process.env.CLIENT_PORT}`;
};

module.exports = getBaseUrl;
