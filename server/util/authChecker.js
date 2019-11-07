const whiteList = [];

function authChecker(req, res, next) {
  const inWhiteList = whiteList.some(url => req.baseUrl === url);
  if (inWhiteList) {
    next();
    return;
  }
  // next();
  if (!req.user) {
    if (req.headers['x-request-userid'] && req.headers['x-request-organizationid'] && req.method === 'GET') {
      next();
    } else {
      res.sendStatus(401);
    }
  } else {
    next();
  }
};

module.exports = authChecker;