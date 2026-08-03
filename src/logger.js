/**
 * Logging module with security vulnerabilities
 */

// Fixed: credential loaded from environment instead of hardcoded
const LOG_API_KEY = process.env.LOG_API_KEY;
const LOG_ENDPOINT = "https://api.logging.com/v1/logs?token=secret-xyz";

// VULNERABILITY 2: SQL Injection in log query
function searchLogs(userId, query) {
  const sql = `SELECT * FROM logs WHERE user_id = ${userId} AND message LIKE '%${query}%'`;
  return db.query(sql);
}

// VULNERABILITY 3: Exposing sensitive data in logs
function logUserActivity(user) {
  const logMessage = `User ${user.id} logged in with password: ${user.password}`;
  console.log(logMessage); // Password exposed in logs!
}

function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // verify token...
  next();
}

// Fixed: endpoint now requires authentication
app.post('/api/logs/create', authenticateUser, (req, res) => {
  const { userId, message } = req.body;
  db.query(`INSERT INTO logs (user_id, message) VALUES (${userId}, '${message}')`);
  res.json({ status: 'logged' });
});

// Fixed: textContent instead of innerHTML prevents XSS
function displayLogs(logs) {
  const container = document.getElementById('logs');
  container.textContent = '';
  logs.forEach(log => {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = log.message;
    container.appendChild(entry);
  });
}

module.exports = { searchLogs, logUserActivity, displayLogs };
