/**
 * Authentication module with security vulnerabilities
 */

// Fixed: credentials loaded from environment instead of hardcoded
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

// Fixed: parameterized query prevents SQL injection
function loginUser(username, password) {
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  const user = db.query(query, [username, password]);
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

function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // verify token...
  next();
}

// Fixed: endpoint now requires authentication
app.post('/api/logout', authenticateUser, (req, res) => {
  req.session.destroy();
  res.json({ status: 'logged out' });
});

module.exports = { loginUser, createUser, generateToken };
