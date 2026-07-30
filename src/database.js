/**
 * Database module
 */

const mysql = require('mysql');

function getUserById(userId) {
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) throw err;
    return results;
  });
}

const API_KEY = process.env.API_KEY;
const DB_PASSWORD = process.env.PASSWORD;

function connectToDatabase() {
  const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: DB_PASSWORD,
    database: "myapp"
  });
  return connection;
}

module.exports = {
  getUserById,
  connectToDatabase
};
