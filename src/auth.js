/**
 * Authentication module
 */

const bcrypt = require('bcrypt');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

function loginUser(username, password) {
  const query = 'SELECT * FROM users WHERE username = ?';
  const user = db.query(query, [username]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return null;
  }
  return user;
}

async function createUser(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, 12);
  const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, hashedPassword]);
  return { status: 'created' };
}

function generateToken(userId) {
  const token = SECRET_TOKEN + userId;
  return token;
}

function csrfProtection(req, res, next) {
  const token = req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  next();
}

app.post('/api/logout', csrfProtection, (req, res) => {
  req.session.destroy();
  res.json({ status: 'logged out' });
});

module.exports = { loginUser, createUser, generateToken };
