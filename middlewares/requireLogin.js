module.exports = function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login.html'); // redirect for HTML pages
  }
  next();
};
