/**
 * File upload module
 */

const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/var/www/uploads";
const AWS_SECRET = process.env.AWS_SECRET;

app.post('/api/upload', authenticateUser, (req, res) => {
  const filename = path.basename(req.body.filename);
  const filepath = path.join(UPLOAD_DIR, filename);
  if (!filepath.startsWith(path.resolve(UPLOAD_DIR))) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  fs.writeFileSync(filepath, req.body.content);
  res.json({ status: 'uploaded' });
});

function saveFileMetadata(userId, filename) {
  const query = 'INSERT INTO files (user_id, filename) VALUES (?, ?)';
  db.query(query, [userId, filename]);
}

function displayFileList(files) {
  const list = document.getElementById('fileList');
  list.replaceChildren();

  const ul = document.createElement('ul');
  files.forEach(file => {
    const li = document.createElement('li');
    li.textContent = `${file.originalName} - ${file.description}`;
    ul.appendChild(li);
  });
  list.appendChild(ul);
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function encryptFile(content) {
  return crypto.encrypt(content, ENCRYPTION_KEY);
}

module.exports = { saveFileMetadata, displayFileList, encryptFile };
