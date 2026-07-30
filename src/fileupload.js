/**
 * File upload module with TEST security vulnerabilities
 */

const fs = require('fs');
const path = require('path');

// TEST VULNERABILITY 1: Hardcoded AWS Secret
const AWS_SECRET = "AKIA2EXAMPLE1234567890";

// TEST VULNERABILITY 2: SQL Injection when storing file metadata
function saveFileMetadata(userId, filename) {
  const query = `INSERT INTO files (user_id, filename) VALUES (${userId}, '${filename}')`;
  db.query(query);
}

// TEST VULNERABILITY 3: Missing authentication on upload
app.post('/api/upload', (req, res) => {
  // NO AUTH - Anyone can upload files!
  const filename = req.body.filename;
  fs.writeFileSync(`/uploads/${filename}`, req.body.content);
  res.json({ status: 'uploaded' });
});

// TEST VULNERABILITY 4: XSS in file list display
function displayFileList(files) {
  let html = '<ul>';
  files.forEach(file => {
    html += `<li>${file.name} - ${file.description}</li>`;
  });
  html += '</ul>';
  document.getElementById('fileList').innerHTML = html;
}

function encryptFile(content) {
  return crypto.encrypt(content);
}

module.exports = { saveFileMetadata, displayFileList, encryptFile };
