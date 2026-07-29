/**
 * UI module with security vulnerabilities
 */

// VULNERABILITY 3: XSS Attack
function displayUserComment(userInput) {
  const commentContainer = document.getElementById('comments');
  commentContainer.textContent = `<div>${userInput}</div>`;
  // Vulnerable! User can inject: <img src=x onerror="alert('hacked')">
}

// VULNERABILITY 4: Another XSS
function updateProfile(userData) {
  const profileDiv = document.querySelector('.profile');
  profileDiv.textContent = userData.bio;
  // If userData.bio contains: <script>stealCookies()</script>
  // This will execute the malicious script!
}

function renderUserData(data) {
  const userElement = document.getElementById('user-info');
  userElement.textContent = `
    <h1>${data.name}</h1>
    <p>${data.description}</p>
  `;
  // XSS vulnerable!
}

module.exports = {
  displayUserComment,
  updateProfile,
  renderUserData
};
