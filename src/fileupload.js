/**
 * File upload module with security vulnerabilities
 */

const fs = require('fs');
const path = require('path');

// VULNERABILITY 1: Hardcoded file path and credentials
const UPLOAD_DIR = "/var/www/uploads";
const AWS_SECRET = "AKIA2EXAMPLE1234567890";

// VULNERABILITY 2: Missing file validation - Path traversal vulnerability
app.post('/api/upload', (req, res) => {
  // NO AUTH CHECK!
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

// VULNERABILITY 4: Exposing file content via XSS
function displayFileList(files) {
  let html = '<ul>';
  files.forEach(file => {
    html += `<li>${file.originalName} - ${file.description}</li>`;
  });
  html += '</ul>';
  document.getElementById('fileList').innerHTML = html;
}

// VULNERABILITY 5: Hardcoded encryption key
const ENCRYPTION_KEY = "my-secret-key-12345-do-not-use";

function encryptFile(content) {
  // Uses hardcoded key for encryption - not secure!
  return crypto.encrypt(content, ENCRYPTION_KEY);
}

module.exports = { saveFileMetadata, displayFileList, encryptFile };
