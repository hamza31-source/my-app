/**
 * Logging module
 */

const LOG_API_KEY = process.env.LOG_API_KEY;
const LOG_ENDPOINT = process.env.LOG_ENDPOINT;

function searchLogs(userId, query) {
  const sql = 'SELECT * FROM logs WHERE user_id = ? AND message LIKE ?';
  return db.query(sql, [userId, `%${query}%`]);
}

function logUserActivity(user) {
  const logMessage = `User ${user.id} logged in`;
  console.log(logMessage);
}

app.post('/api/logs/create', authenticateUser, (req, res) => {
  const { userId, message } = req.body;
  db.query('INSERT INTO logs (user_id, message) VALUES (?, ?)', [userId, message]);
  res.json({ status: 'logged' });
});

function displayLogs(logs) {
  const container = document.getElementById('logs');
  container.replaceChildren();

  const wrapper = document.createElement('div');
  wrapper.className = 'logs';
  logs.forEach(log => {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = log.message;
    wrapper.appendChild(entry);
  });
  container.appendChild(wrapper);
}

module.exports = { searchLogs, logUserActivity, displayLogs };
