const pool = require("../db");

module.exports = {
  getReservations: async () => {
    return pool.query("SELECT * FROM reservations ORDER BY id DESC");
  },

  approveReservation: async (id) => {
    return pool.query(
      "UPDATE reservations SET status=$1 WHERE id=$2",
      ["Approved", id]
    );
  },

  deleteReservation: async (id) => {
    return pool.query("DELETE FROM reservations WHERE id=$1", [id]);
  }
};
