const pool = require("../db");

async function createReservation(data) {
  return pool.query(
    `INSERT INTO reservations (fullname,email,checkin,checkout,room_type,status)
     VALUES ($1,$2,$3,$4,$5,'Pending')
     RETURNING id`,
    [data.fullname, data.email, data.checkin, data.checkout, data.roomType]
  );
}

module.exports = { createReservation };
