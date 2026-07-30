/**
 * UI module
 */

function displayUserComment(userInput) {
  const commentContainer = document.getElementById('comments');
  commentContainer.textContent = userInput;
}

function updateProfile(userData) {
  const profileDiv = document.querySelector('.profile');
  profileDiv.textContent = userData.bio;
}

function renderUserData(data) {
  const userElement = document.getElementById('user-info');
  userElement.replaceChildren();

  const heading = document.createElement('h1');
  heading.textContent = data.name;

  const description = document.createElement('p');
  description.textContent = data.description;

  userElement.append(heading, description);
}

module.exports = {
  displayUserComment,
  updateProfile,
  renderUserData
};
