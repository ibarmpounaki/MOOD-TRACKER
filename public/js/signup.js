// password strength

console.log("bikamee");
const input = document.getElementById("passwordInput");
const segs = [
  document.getElementById("seg1"),
  document.getElementById("seg2"),
  document.getElementById("seg3"),
  document.getElementById("seg4"),
];
const label = document.getElementById("strengthLabel");

input.addEventListener("input", () => {
  const val = input.value;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  segs.forEach((s, i) => {
    s.className = "strength-seg";
    if (i < score) {
      if (score <= 1) s.classList.add("weak");
      else if (score <= 2) s.classList.add("medium");
      else s.classList.add("strong");
    }
  });

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#e07070", "#e0a840", "#38c070", "#28a858"];
  label.textContent = val.length ? labels[score] : "";
  label.style.color = val.length ? colors[score] : "#b0b4d0";
});

// confirm password match
const confirmInput = document.getElementById("confirmInput");
const okBtn = document.querySelector(".login-btn");

// Keep the button disabled until both password fields match
okBtn.disabled = true;

function validatePasswords() {
  const password = input.value.trim();
  const confirmPassword = confirmInput.value.trim();

  // Passwords are valid only if both fields are filled and identical
  const matches =
    password !== "" && confirmPassword !== "" && password === confirmPassword;

  confirmInput.classList.toggle("error", confirmPassword !== "" && !matches);
  okBtn.disabled = !matches;
}

// Re-check validation whenever either password field change
input.addEventListener("input", validatePasswords);
confirmInput.addEventListener("input", validatePasswords);
