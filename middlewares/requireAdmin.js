module.exports = function requireAdmin(req, res, next) {
  if (!req.session.userRole || req.session.userRole !== 'admin') {
    return res.redirect('/Mainpage.html'); // redirect non-admins
  }
  next();
};
