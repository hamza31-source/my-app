/**
 * Database module with TEST security vulnerabilities
 */

const mysql = require('mysql');

// TEST VULNERABILITY 1: Hardcoded API Key
const API_KEY = "sk-1234567890abcdefghijklmnop";

// TEST VULNERABILITY 2: Hardcoded Database Password
const DB_PASSWORD = "MyDatabasePassword123!";

// TEST VULNERABILITY 3: SQL Injection
function getUserById(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  db.query(query, (err, results) => {
    if (err) throw err;
    return results;
  });
}

// TEST VULNERABILITY 4: SQL Injection in login
function loginUser(email, password) {
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  return db.query(query);
}

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
  loginUser,
  connectToDatabase
};
