/**
 * API routes with TEST security vulnerabilities for skill testing
 */

const express = require('express');
const app = express();

// TEST VULNERABILITY 1: SQL Injection
app.get('/api/user/:id', (req, res) => {
  const userId = req.params.id;
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  const user = db.query(query);
  res.json(user);
});

// TEST VULNERABILITY 2: SQL Injection in search
app.get('/api/search', (req, res) => {
  const searchTerm = req.query.q;
  const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`;
  const results = db.query(query);
  res.json(results);
});

// TEST VULNERABILITY 3: Missing Authentication
app.post('/api/admin/delete-user/:id', (req, res) => {
  const userId = req.params.id;
  db.query(`DELETE FROM users WHERE id = ${userId}`);
  res.json({ message: 'User deleted' });
});

// Secure example (for comparison)
app.get('/api/secure/users', authenticateUser, (req, res) => {
  const users = db.query('SELECT * FROM users');
  res.json(users);
});

function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

module.exports = app;
