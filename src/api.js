/**
 * API routes with security vulnerabilities
 */

const express = require('express');
const app = express();

// VULNERABILITY 5: Missing Authentication
app.get('/api/users', authenticateUser, (req, res) => {
  // NO AUTHENTICATION CHECK!
  const users = db.query('SELECT * FROM users');
  res.json(users);
});

// VULNERABILITY 6: Missing Authentication on sensitive endpoint
app.post('/api/admin/delete-user/:id', authenticateUser, (req, res) => {
  // NO AUTHENTICATION OR AUTHORIZATION!
  const userId = req.params.id;
  db.query(`DELETE FROM users WHERE id = ${userId}`);
  res.json({ message: 'User deleted' });
});

// VULNERABILITY 7: SQL Injection in API
app.get('/api/search', authenticateUser, (req, res) => {
  const searchTerm = req.query.q;
  const query = `SELECT * FROM products WHERE name LIKE '%${searchTerm}%'`;
  const results = db.query(query);
  res.json(results);
});

// This one is secure (for comparison)
app.get('/api/secure/users', authenticateUser, (req, res) => {
  const users = db.query('SELECT * FROM users');
  res.json(users);
});

function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // verify token...
  next();
}

module.exports = app;
