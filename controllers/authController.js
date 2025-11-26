const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

async function signup(req, res) {
  const { username, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await userModel.createUser(username, email, phone, hashedPassword);
    return res.redirect('/Mainpage.html');
  } catch (err) {
    console.error(err);
    return res.redirect('/signup.html?error=AccountAlreadyCreated');
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await userModel.findUserByEmailOrUsername(email);
    if (!user) return res.redirect('/login.html?error=UserNotFound');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.redirect('/login.html?error=WrongPassword');

    req.session.userId = user.id;
    req.session.userRole = user.role;

    req.session.save(err => {
      if (err) console.error(err);
      if (user.role === 'admin') return res.redirect('/admin.html');
      return res.redirect('/Mainpage-loggedin.html');
    });
  } catch (err) {
    console.error(err);
    return res.redirect('/login.html?error=ServerError');
  }
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/login.html'));
}

module.exports = { signup, login, logout };
