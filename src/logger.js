/**
 * Logging module with security vulnerabilities
 */

// NO AUTH CHECK! (tracked separately, see SEC-1785327695233-ppw9dz5w3)
const LOG_API_KEY = "log-key-sk-12345678901234";
// Fixed: token loaded from environment instead of embedded in the URL
const LOG_ENDPOINT_BASE = "https://api.logging.com/v1/logs";
const LOG_ENDPOINT = `${LOG_ENDPOINT_BASE}?token=${process.env.LOG_ENDPOINT_TOKEN}`;

// Fixed: parameterized query prevents SQL injection
function searchLogs(userId, query) {
  const sql = 'SELECT * FROM logs WHERE user_id = ? AND message LIKE ?';
  return db.query(sql, [userId, `%${query}%`]);
}

// Fixed: password no longer included in the log message
function logUserActivity(user) {
  const logMessage = `User ${user.id} logged in`;
  console.log(logMessage);
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
