module.exports = function redirectIfLoggedIn(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/Mainpage.html'); // <-- FIXED
  }
  next();
};
