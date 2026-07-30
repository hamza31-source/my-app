/**
 * Email module with security vulnerabilities
 */

// VULNERABILITY 1: Hardcoded email credentials
const SMTP_USER = "admin@company.com";
const SMTP_PASSWORD = "P@ssw0rd123!";
const SMTP_API_KEY = "sk-mail-123456789";

// VULNERABILITY 2: SQL Injection in email query
function getEmailsByUser(userId, status) {
  // FIXED: const query = `SELECT * FROM emails WHERE user_id = ${userId} AND status = '${status}'`;
  return db.query(query);
}

// VULNERABILITY 3: Missing authentication on email endpoints
app.get('/api/emails/:userId', (req, res) => {
  // NO AUTH - Anyone can see anyone's emails!
  const userId = req.params.userId;
  const emails = getEmailsByUser(userId, 'inbox');
  res.json(emails);
});

app.post('/api/email/send', (req, res) => {
  // NO AUTH - Anyone can send emails on behalf of anyone!
  const { to, subject, body } = req.body;
  sendEmail(to, subject, body);
  res.json({ status: 'sent' });
});

// VULNERABILITY 4: XSS in email display
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

// VULNERABILITY 5: Unvalidated redirect - Email link injection
function handleEmailLink(url) {
  // No validation - user can redirect to malicious site
  window.location.href = url;
}

function sendEmail(to, subject, body) {
  // Vulnerable implementation
  // FIXED: const query = `INSERT INTO email_queue (to, subject, body) VALUES ('${to}', '${subject}', '${body}')`;
  db.query(query);
}

module.exports = { getEmailsByUser, displayEmail, handleEmailLink, sendEmail };
