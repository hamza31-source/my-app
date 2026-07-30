/**
 * Authentication module with TEST security vulnerabilities
 */

// TEST VULNERABILITY 1: Hardcoded password and secret key
const ADMIN_PASSWORD = "admin@12345";
const SECRET_TOKEN = "my-super-secret-key-12345";

// TEST VULNERABILITY 2: SQL Injection in login
function loginUser(username, password) {
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const user = db.query(query);
  return user;
}

// TEST VULNERABILITY 3: SQL Injection in user creation
function createUser(username, email, password) {
  const query = `INSERT INTO users (username, email, password) VALUES ('${username}', '${email}', '${password}')`;
  db.query(query);
  return { status: 'created' };
}

// TEST VULNERABILITY 4: Missing authentication on logout
app.post('/api/logout', (req, res) => {
  // NO AUTH CHECK - Anyone can log out anyone!
  req.session.destroy();
  res.json({ status: 'logged out' });
});

module.exports = { loginUser, createUser };
