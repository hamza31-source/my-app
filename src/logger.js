/**
 * Logging module with TEST security vulnerabilities
 */

// TEST VULNERABILITY 1: Hardcoded API key
const LOG_API_KEY = "log-key-sk-12345678901234";

// TEST VULNERABILITY 2: SQL Injection in log search
function searchLogs(userId, query) {
  const sql = `SELECT * FROM logs WHERE user_id = ${userId} AND message LIKE '%${query}%'`;
  return db.query(sql);
}

// TEST VULNERABILITY 3: SQL Injection in log insert
app.post('/api/logs/create', (req, res) => {
  // NO AUTH - Anyone can create logs!
  const { userId, message } = req.body;
  const sql = `INSERT INTO logs (user_id, message) VALUES (${userId}, '${message}')`;
  db.query(sql);
  res.json({ status: 'logged' });
});

// TEST VULNERABILITY 4: XSS in log display
function displayLogs(logs) {
  let html = '<div class="logs">';
  logs.forEach(log => {
    html += `<div class="log-entry">${log.message}</div>`;
  });
  html += '</div>';
  document.getElementById('logs').innerHTML = html;
}

module.exports = { searchLogs, displayLogs };
