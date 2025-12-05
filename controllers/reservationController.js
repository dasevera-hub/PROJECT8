const pool = require("../db");

module.exports = {
  createReservation: async (fullname, email, checkin, checkout, roomType) => {
    return pool.query(
      `INSERT INTO reservations (fullname,email,checkin,checkout,room_type,status)
       VALUES ($1,$2,$3,$4,$5,'Pending')
       RETURNING id`,
      [fullname, email, checkin, checkout, roomType]
    );
  }
};
