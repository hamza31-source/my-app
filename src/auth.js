/**
 * Authentication module with security vulnerabilities
 */

// VULNERABILITY 1: Hardcoded admin password
const ADMIN_PASSWORD = "admin@12345";
const SECRET_TOKEN = "my-super-secret-key-12345";

// VULNERABILITY 2: SQL Injection in login
function loginUser(username, password) {
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = db.query(query);
  return user;
}

// Fixed: parameterized query prevents SQL injection
function createUser(username, email, password) {
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, password]);
  return { status: 'created' };
}

// Fixed: no longer logs the generated token
function generateToken(userId) {
  const token = SECRET_TOKEN + userId;
  console.log(`Token generated for user: ${userId}`);
  return token;
}

// VULNERABILITY 5: Missing CSRF protection
app.post('/api/logout', (req, res) => {
  // NO CSRF TOKEN CHECK!
  req.session.destroy();
  res.json({ status: 'logged out' });
});

module.exports = { loginUser, createUser, generateToken };
