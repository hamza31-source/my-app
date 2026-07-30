/**
 * API routes
 */

const express = require('express');
const app = express();

app.get('/api/users', authenticateUser, (req, res) => {
  const users = db.query('SELECT * FROM users');
  res.json(users);
});

app.post('/api/admin/delete-user/:id', authenticateUser, requireAdmin, (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM users WHERE id = ?', [userId]);
  res.json({ message: 'User deleted' });
});

app.get('/api/search', authenticateUser, (req, res) => {
  const searchTerm = req.query.q;
  const query = 'SELECT * FROM products WHERE name LIKE ?';
  const results = db.query(query, [`%${searchTerm}%`]);
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

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

module.exports = app;
