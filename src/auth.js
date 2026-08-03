/**
 * Authentication module with security vulnerabilities
 */

// Fixed: secrets loaded from environment instead of hardcoded
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

// Fixed: parameterized query prevents SQL injection
function loginUser(username, password) {
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  const user = db.query(query, [username, password]);
  return user;
}

// NEEDS MANUAL REVIEW: password is still stored in plain text here.
// Hashing it requires knowing the real users-table schema (column
// names, migration path for existing rows), so it isn't safe to
// auto-fix blind. Tracked as SEC-auth-weak-password-storage.
function createUser(username, email, password) {
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, password]);
  return { status: 'created' };
}

// Fixed: token no longer written to logs
function generateToken(userId) {
  const token = SECRET_TOKEN + userId;
  return token;
}

// NEEDS MANUAL REVIEW: /api/logout has no CSRF protection. Adding it
// requires an app-wide CSRF middleware/session decision (e.g. csurf
// config), not a one-file patch. Tracked as SEC-auth-missing-csrf.
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ status: 'logged out' });
});

module.exports = { loginUser, createUser, generateToken };
