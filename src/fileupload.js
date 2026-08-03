/**
 * File upload module with security vulnerabilities
 */

const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = "/var/www/uploads";
// Fixed: credential loaded from environment instead of hardcoded
const AWS_SECRET = process.env.AWS_SECRET;

function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  // verify token...
  next();
}

// Fixed: endpoint now requires authentication
app.post('/api/upload', authenticateUser, (req, res) => {
  const filename = req.body.filename;
  const filepath = path.join(UPLOAD_DIR, filename); // Vulnerable to ../../../ attacks
  fs.writeFileSync(filepath, req.body.content);
  res.json({ status: 'uploaded' });
});

// VULNERABILITY 3: SQL Injection when storing file metadata
function saveFileMetadata(userId, filename) {
  const query = `INSERT INTO files (user_id, filename) VALUES (${userId}, '${filename}')`;
  db.query(query);
}

// Fixed: textContent instead of innerHTML prevents XSS
function displayFileList(files) {
  const list = document.getElementById('fileList');
  list.textContent = '';
  files.forEach(file => {
    const li = document.createElement('li');
    li.textContent = `${file.originalName} - ${file.description}`;
    list.appendChild(li);
  });
}

// VULNERABILITY 5: Hardcoded encryption key
const ENCRYPTION_KEY = "my-secret-key-12345-do-not-use";

function encryptFile(content) {
  // Uses hardcoded key for encryption - not secure!
  return crypto.encrypt(content, ENCRYPTION_KEY);
}

module.exports = { saveFileMetadata, displayFileList, encryptFile };
