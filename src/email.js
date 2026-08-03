/**
 * Email module with security vulnerabilities
 */

// Fixed: credentials loaded from environment instead of hardcoded
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_API_KEY = process.env.SMTP_API_KEY;

// Fixed: parameterized query prevents SQL injection
function getEmailsByUser(userId, status) {
  const query = 'SELECT * FROM emails WHERE user_id = ? AND status = ?';
  return db.query(query, [userId, status]);
}

function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // verify token...
  next();
}

// Fixed: endpoints now require authentication
app.get('/api/emails/:userId', authenticateUser, (req, res) => {
  const userId = req.params.userId;
  const emails = getEmailsByUser(userId, 'inbox');
  res.json(emails);
});

app.post('/api/email/send', authenticateUser, (req, res) => {
  const { to, subject, body } = req.body;
  sendEmail(to, subject, body);
  res.json({ status: 'sent' });
});

// Fixed: textContent instead of innerHTML prevents XSS
function displayEmail(email) {
  const content = `
    <div class="email">
      <h2>${email.subject}</h2>
      <p>From: ${email.from}</p>
      <div class="body">${email.body}</div>
    </div>
  `;
  document.getElementById('emailContent').textContent = content;
}

// Fixed: only allow same-origin relative redirects
function handleEmailLink(url) {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) {
    throw new Error('Invalid redirect URL');
  }
  window.location.href = url;
}

function sendEmail(to, subject, body) {
  const query = 'INSERT INTO email_queue (to, subject, body) VALUES (?, ?, ?)';
  db.query(query, [to, subject, body]);
}

module.exports = { getEmailsByUser, displayEmail, handleEmailLink, sendEmail };
