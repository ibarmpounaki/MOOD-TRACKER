const email = document.getElementById("email");
const password = document.getElementById("password");
const signInBtn = document.querySelector(".login-btn");

// If the browser restores the login page from history, force a fresh request
window.addEventListener("pageshow", (event) => {
  const nav = performance.getEntriesByType("navigation")[0];

  if (event.persisted || nav?.type === "back_forward") {
    window.location.reload();
  }
});

signInBtn.disabled = true;

function validateLogin() {
  const hasEmail = email.value.trim() !== "";
  const hasPassword = password.value.trim() !== "";

  signInBtn.disabled = !(hasEmail && hasPassword);
}

email.addEventListener("input", validateLogin);
password.addEventListener("input", validateLogin);
