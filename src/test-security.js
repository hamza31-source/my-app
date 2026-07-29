// Simple test file with obvious security issues

// ISSUE 1: SQL Injection
function getUserById(userId) {
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  return db.query(query);
}

// ISSUE 2: Hardcoded API Key
const API_KEY = "sk-12345abcde67890fghijk";

// ISSUE 3: XSS Vulnerability
function displayUserComment(comment) {
  document.getElementById('comments').textContent = comment;
}

// ISSUE 4: Missing Authentication
app.get('/api/admin/users', authenticateUser, (req, res) => {
  const users = db.query('SELECT * FROM users');
  res.json(users);
});

module.exports = { getUserById, displayUserComment };
