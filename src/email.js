/**
 * Email module
 */

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_API_KEY = process.env.SMTP_API_KEY;

function getEmailsByUser(userId, status) {
  const query = 'SELECT * FROM emails WHERE user_id = ? AND status = ?';
  return db.query(query, [userId, status]);
}

app.get('/api/emails/:userId', authenticateUser, (req, res) => {
  const userId = req.params.userId;
  if (String(req.user.id) !== String(userId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const emails = getEmailsByUser(userId, 'inbox');
  res.json(emails);
});

app.post('/api/email/send', authenticateUser, (req, res) => {
  const { to, subject, body } = req.body;
  sendEmail(to, subject, body);
  res.json({ status: 'sent' });
});

function displayEmail(email) {
  const container = document.getElementById('emailContent');
  container.replaceChildren();

  const wrapper = document.createElement('div');
  wrapper.className = 'email';

  const subject = document.createElement('h2');
  subject.textContent = email.subject;

  const from = document.createElement('p');
  from.textContent = `From: ${email.from}`;

  const body = document.createElement('div');
  body.className = 'body';
  body.textContent = email.body;

  wrapper.append(subject, from, body);
  container.appendChild(wrapper);
}

const ALLOWED_REDIRECT_HOSTS = new Set(['mail.company.com', 'company.com']);

function handleEmailLink(url) {
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin && !ALLOWED_REDIRECT_HOSTS.has(parsed.hostname)) {
      throw new Error('Untrusted redirect target');
    }
    window.location.href = parsed.href;
  } catch (e) {
    console.error('Blocked untrusted email link:', url);
  }
}

function sendEmail(to, subject, body) {
  const query = 'INSERT INTO email_queue (to, subject, body) VALUES (?, ?, ?)';
  db.query(query, [to, subject, body]);
}

module.exports = { getEmailsByUser, displayEmail, handleEmailLink, sendEmail };
