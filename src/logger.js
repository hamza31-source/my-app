/**
 * Logging module with security vulnerabilities
 */

// VULNERABILITY 1: Hardcoded API credentials
const LOG_API_KEY = "log-key-sk-12345678901234";
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

// VULNERABILITY 4: Missing authentication on logging endpoint
app.post('/api/logs/create', (req, res) => {
  // NO AUTH CHECK - Anyone can create logs!
  const { userId, message } = req.body;
  db.query(`INSERT INTO logs (user_id, message) VALUES (${userId}, '${message}')`);
  res.json({ status: 'logged' });
});

// VULNERABILITY 5: XSS in log display
function displayLogs(logs) {
  let html = '<div class="logs">';
  logs.forEach(log => {
    html += `<div class="log-entry">${log.message}</div>`;
  });
  html += '</div>';
  document.getElementById('logs').innerHTML = html;
}

module.exports = { searchLogs, logUserActivity, displayLogs };
