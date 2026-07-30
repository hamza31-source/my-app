/**
 * Email module with TEST security vulnerabilities
 */

// TEST VULNERABILITY 1: Hardcoded email credentials
const SMTP_USER = "admin@company.com";
const SMTP_PASSWORD = "P@ssw0rd123!";
const SMTP_API_KEY = "sk-mail-123456789";

// TEST VULNERABILITY 2: SQL Injection in email query
function getEmailsByUser(userId, status) {
  const query = `SELECT * FROM emails WHERE user_id = ${userId} AND status = '${status}'`;
  return db.query(query);
}

// TEST VULNERABILITY 3: Missing authentication on email endpoint
app.get('/api/emails/:userId', (req, res) => {
  // NO AUTH - Anyone can access anyone's emails!
  const userId = req.params.userId;
  const emails = getEmailsByUser(userId, 'inbox');
  res.json(emails);
});

// TEST VULNERABILITY 4: XSS in email display
function displayEmail(email) {
  const emailDiv = document.getElementById('emailContent');
  emailDiv.innerHTML = `<h2>${email.subject}</h2><p>${email.body}</p>`;
}

function sendEmail(to, subject, body) {
  // TEST VULNERABILITY 5: SQL Injection in insert
  const query = `INSERT INTO email_queue (to, subject, body) VALUES ('${to}', '${subject}', '${body}')`;
  db.query(query);
}

module.exports = { getEmailsByUser, displayEmail, sendEmail };
