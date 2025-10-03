const { pick } = require("lodash");

const filterMiddleware = (filterKeys) => {
  return (req, res, next) => {
    req.body = pick(req.body, filterKeys);
    next();
  };
};

module.exports = { filterMiddleware };
