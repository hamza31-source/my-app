/**
 * Security vulnerability patterns for detection and fixing
 */

const patterns = {
  sql_injection: {
    name: "SQL Injection",
    severity: "critical",
    description: "Parameterized queries not used in database operations",
    patterns: [
      /const\s+\w+\s*=\s*[`'"]SELECT.*\$\{.*\}[`'"]/, // Template literals with variables
      /db\.query\s*\(\s*[`'"]SELECT.*\$\{.*\}/, // Direct interpolation
      /sql\s*=\s*[`'"].*\$\{.*\}[`'"]/,
    ],
    fix: (code, match) => {
      return code.replace(
        /const\s+(\w+)\s*=\s*[`'"](.+?)\$\{(\w+)\}(.+?)[`'"]/,
        "const $1 = 'SELECT * FROM users WHERE id = ?'; // Use parameterized query\ndb.query($1, [$3]);"
      );
    },
    template: `
// ❌ Vulnerable:
const query = \`SELECT * FROM users WHERE id = \${userId}\`;
db.query(query);

// ✅ Fixed:
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
    `.trim(),
  },

  xss_vulnerability: {
    name: "XSS Vulnerability",
    severity: "high",
    description: "Using innerHTML with user-controlled data can lead to XSS attacks",
    patterns: [
      /\.innerHTML\s*=/, // innerHTML assignments
      /innerHTML\s*\+=/,
      /eval\s*\(/,
      /Function\s*\(/,
      /\$\(.*\)\.html\(/,
    ],
    fix: (code) => {
      return code
        .replace(/\.innerHTML\s*=/g, ".textContent =")
        .replace(/\.innerHTML\s*\+=/g, ".textContent +=");
    },
    template: `
// ❌ Vulnerable:
document.getElementById('output').textContent = userInput;
element.textContent = \`<div>\${data}</div>\`;

// ✅ Fixed:
document.getElementById('output').textContent = userInput;
element.textContent = data;
// Or use DOM methods:
const div = document.createElement('div');
div.textContent = data;
element.appendChild(div);
    `.trim(),
  },

  hardcoded_secrets: {
    name: "Hardcoded Secrets",
    severity: "critical",
    description: "API keys, passwords, and tokens hardcoded in source code",
    patterns: [
      /['"]?api[_-]?key['"]?\s*[:=]\s*['"][^'"]+['"]/i,
      /['"]?password['"]?\s*[:=]\s*['"][^'"]+['"]/i,
      /['"]?secret['"]?\s*[:=]\s*['"][^'"]+['"]/i,
      /['"]?token['"]?\s*[:=]\s*['"][^'"]+['"]/i,
      /['"]?auth['"]?\s*[:=]\s*['"][^'"]+['"]/i,
      /ghp_[A-Za-z0-9_]+/, // GitHub token pattern
      /sk-[A-Za-z0-9_]+/, // OpenAI API key pattern
    ],
    fix: (code) => {
      return code
        .replace(/(['"]?api[_-]?key['"]?\s*[:=]\s*)['"]\w+['"]/i, "$1process.env.API_KEY")
        .replace(/(['"]?password['"]?\s*[:=]\s*)['"]\w+['"]/i, "$1process.env.PASSWORD")
        .replace(/(['"]?secret['"]?\s*[:=]\s*)['"]\w+['"]/i, "$1process.env.SECRET")
        .replace(/(['"]?token['"]?\s*[:=]\s*)['"]\w+['"]/i, "$1process.env.TOKEN");
    },
    template: `
// ❌ Vulnerable:
const API_KEY = "sk-1234567890abcdefghij";
const password = process.env.PASSWORD;
const dbToken = process.env.TOKEN;

// ✅ Fixed:
const API_KEY = process.env.API_KEY;
const password = process.env.DB_PASSWORD;
const dbToken = process.env.GITHUB_TOKEN;

// Add to .env file:
// API_KEY=sk-1234567890abcdefghij
// DB_PASSWORD=supersecretpassword
// GITHUB_TOKEN=ghp_xxxxxxxxxxx
    `.trim(),
  },

  vulnerable_dependencies: {
    name: "Vulnerable Dependencies",
    severity: "high",
    description: "Using outdated or vulnerable package versions",
    patterns: [
      /lodash.*[<4\.17\.21]/,
      /express.*[<4\.16\.0]/,
      /mongoose.*[<5\.0\.0]/,
      /helmet.*[<3\.0\.0]/,
    ],
    fix: (code) => {
      return code
        .replace(/"lodash":\s*"[^"]*"/, '"lodash": "^4.17.21"')
        .replace(/"express":\s*"[^"]*"/, '"express": "^4.18.2"')
        .replace(/"mongoose":\s*"[^"]*"/, '"mongoose": "^7.0.0"')
        .replace(/"helmet":\s*"[^"]*"/, '"helmet": "^7.0.0"');
    },
    template: `
// ❌ Vulnerable (in package.json):
{
  "dependencies": {
    "lodash": "4.17.15",
    "express": "4.15.0"
  }
}

// ✅ Fixed:
{
  "dependencies": {
    "lodash": "^4.17.21",
    "express": "^4.18.2"
  }
}
    `.trim(),
  },

  missing_authentication: {
    name: "Missing Authentication",
    severity: "high",
    description: "API endpoints without authentication or authorization checks",
    patterns: [
      /app\.(get|post|put|delete)\(['"][^'"]+['"],\s*\(.*?\)\s*=>\s*{(?!.*auth|.*isAuth|.*checkAuth|.*requireAuth|.*verifyToken)/,
      /router\.(get|post|put|delete)\(['"][^'"]+['"],\s*\(.*?\)\s*=>\s*{(?!.*auth|.*isAuth|.*checkAuth|.*requireAuth|.*verifyToken)/,
    ],
    fix: (code) => {
      return code.replace(
        /app\.(get|post|put|delete)\((['"][^'"]+['"])\s*,\s*\((.*?)\)\s*=>/,
        "app.$1($2, authenticateUser, (req, res) =>"
      );
    },
    template: `
// ❌ Vulnerable:
app.post('/api/users', authenticateUser, (req, res) => {
  // No authentication check!
  const user = createUser(req.body);
  res.json(user);
});

// ✅ Fixed:
app.post('/api/users', authenticateUser, (req, res) => {
  // Authentication middleware ensures user is verified
  const user = createUser(req.body);
  res.json(user);
});

// Add authentication middleware:
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};
    `.trim(),
  },
};

module.exports = patterns;
