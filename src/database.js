/**
 * Database module with intentional vulnerabilities for testing
 */

const mysql = require('mysql');

// Fixed: parameterized query prevents SQL injection
function getUserById(userId) {
  const query = 'SELECT * FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) throw err;
    return results;
  });
}

// Fixed: secret loaded from environment instead of hardcoded
const API_KEY = process.env.STRIPE_API_KEY;
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
