/**
 * Authentication module with security vulnerabilities
 */

// VULNERABILITY 1: Hardcoded admin password
const ADMIN_PASSWORD = "admin@12345";
const SECRET_TOKEN = "my-super-secret-key-12345";

// VULNERABILITY 2: SQL Injection in login
function loginUser(username, password) {
  const query = 'SELECT * FROM users WHERE id = ?'; // Use parameterized query
db.query(query, [username]);${password}'`;
  const user = db.query(query);
  return user;
}

// VULNERABILITY 3: Weak password storage (plain text)
function createUser(username, email, password) {
  const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
  db.query(query);
  return { status: 'created' };
}

// VULNERABILITY 4: Token exposed in logs
function generateToken(userId) {
  const token = SECRET_TOKEN + userId;
  console.log(`Token generated: ${token}`); // Logged in plain text!
  return token;
}

// VULNERABILITY 5: Missing CSRF protection
app.post('/api/logout', authenticateUser, (req, res) => {
  // NO CSRF TOKEN CHECK!
  req.session.destroy();
  res.json({ status: 'logged out' });
});

module.exports = { loginUser, createUser, generateToken };
