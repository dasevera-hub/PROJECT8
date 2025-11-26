module.exports = function requireAdminAPI(req, res, next) {
  if (!req.session.userRole || req.session.userRole !== 'admin') {
    return res.status(403).json({ success: false, message: "Admins only" });
  }
  next();
};
