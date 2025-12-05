const pool = require("../db");

async function createUser(user) {
  return pool.query(
    "INSERT INTO users (username,email,phone,password,role) VALUES ($1,$2,$3,$4,$5)",
    [user.username, user.email, user.phone, user.password, user.role]
  );
}

async function findUser(identifier) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1 OR username=$1",
    [identifier]
  );
  return result.rows[0];
}

module.exports = { createUser, findUser };
