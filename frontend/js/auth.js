// --------------------- REGISTER ---------------------
function register() {
  const nameVal = document.getElementById("name").value.trim();
  const emailVal = document.getElementById("email").value.trim();
  const passwordVal = document.getElementById("password").value.trim();
  const msgEl = document.getElementById("msg");

  // Validate
  if (!nameVal || !emailVal || !passwordVal) {
    msgEl.innerText = "Please fill all fields";
    return;
  }

  // Send request to backend
  fetch("http://127.0.0.1:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameVal,
      email: emailVal,
      password: passwordVal,
      role: "student" // Default role is student
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.success || data.message === "Registration successful") {
        // Save user info in localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: nameVal,
            email: emailVal,
            role: "student"
          })
        );
        // Redirect to dashboard
        window.location.href = "dashboard.html";
      } else {
        msgEl.innerText = data.message || "Registration failed";
      }
    })
    .catch(err => {
      console.error(err);
      msgEl.innerText = "Something went wrong";
    });
}

// --------------------- LOGIN ---------------------
function login() {
  const emailVal = document.getElementById("email").value.trim();
  const passwordVal = document.getElementById("password").value.trim();
  const msgEl = document.getElementById("msg");

  if (!emailVal || !passwordVal) {
    msgEl.innerText = "Please fill all fields";
    return;
  }

  fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: emailVal,
      password: passwordVal,
      role: "student" // Always student
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message === "Login successful") {
        // Store user info
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: data.name,
            email: emailVal,
            role: "student"
          })
        );
        window.location.href = "dashboard.html";
      } else {
        msgEl.innerText = data.message || "Invalid credentials";
      }
    })
    .catch(err => {
      console.error(err);
      msgEl.innerText = "Something went wrong";
    });
}

// --------------------- ENTER KEY SUPPORT ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector("button[onclick='login()']");
  const registerBtn = document.querySelector("button[onclick='register()']");

  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (loginBtn) loginBtn.click();
      if (registerBtn) registerBtn.click();
    }
  });
});