/**
 * Database module with intentional vulnerabilities for testing
 */

const mysql = require('mysql');

// VULNERABILITY 1: SQL Injection
function getUserById(userId) {
  // FIXED: // FIXED: const query = `SELECT * FROM users WHERE id = ${userId}`;
  db.query(query, (err, results) => {
    if (err) throw err;
    return results;
  });
}

// VULNERABILITY 2: Hardcoded Secret
const API_KEY = "sk-1234567890abcdefghijklmnop";
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
