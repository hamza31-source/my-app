/**
 * File upload module with security vulnerabilities
 */

const fs = require('fs');
const path = require('path');

// VULNERABILITY 1: Hardcoded file path and credentials
const UPLOAD_DIR = "/var/www/uploads";
const AWS_SECRET = "AKIA2EXAMPLE1234567890";

// NO AUTH CHECK! (tracked separately, see SEC-1785327695233-3vq2ici59)
app.post('/api/upload', (req, res) => {
  const filename = req.body.filename;
  // Fixed: reject path-traversal attempts instead of joining the raw filename
  if (typeof filename !== 'string' || path.basename(filename) !== filename) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const filepath = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, req.body.content);
  res.json({ status: 'uploaded' });
});

// Fixed: parameterized query prevents SQL injection
function saveFileMetadata(userId, filename) {
  const query = 'INSERT INTO files (user_id, filename) VALUES (?, ?)';
  db.query(query, [userId, filename]);
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

// Fixed: credential loaded from environment instead of hardcoded
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function encryptFile(content) {
  // Uses hardcoded key for encryption - not secure!
  return crypto.encrypt(content, ENCRYPTION_KEY);
}

module.exports = { saveFileMetadata, displayFileList, encryptFile };
