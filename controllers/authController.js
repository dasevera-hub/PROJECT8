const bcrypt = require("bcrypt");
const pool = require("../db");

module.exports = {
  createUser: async (username, email, phone, password) => {
    const hashed = await bcrypt.hash(password, 10);
    return pool.query(
      "INSERT INTO users (username,email,phone,password,role) VALUES ($1,$2,$3,$4,$5)",
      [username, email, phone, hashed, "user"]
    );
  },

  findUser: async (identifier) => {
    const result = await pool.query(
      "SELECT id, username, role, password FROM users WHERE email=$1 OR username=$1",
      [identifier]
    );
    return result.rows[0];
  }
};
