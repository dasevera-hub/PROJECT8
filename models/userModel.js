const pool = require('../db');

async function createUser(username, email, phone, hashedPassword, role='user') {
  return pool.query(
    'INSERT INTO users (username,email,phone,password,role) VALUES ($1,$2,$3,$4,$5)',
    [username, email, phone, hashedPassword, role]
  );
}

async function findUserByEmailOrUsername(identifier) {
  const result = await pool.query(
    'SELECT id, username, role, password FROM users WHERE email=$1 OR username=$1',
    [identifier]
  );
  return result.rows[0];
}

module.exports = { createUser, findUserByEmailOrUsername };
