let userData = {};

//Validate first form
const form = document.querySelector(".form-container");
const inputs = form.querySelectorAll("input");
let formSubmitted = false;

//Validate second form
const logInForm = document.querySelector(".logIn-form-container");
const loginputs = logInForm.querySelectorAll("input");
const logInHeader = document.getElementById("log-in-header");
const logIn = document.getElementById("log-in");
const register = document.getElementById("register");
logIn.addEventListener("click", function () {
  logInForm.style.display = "flex";
  form.style.display = "none";
});
logInHeader.addEventListener("click", function () {
  logInForm.style.display = "flex";
  form.style.display = "none";
});

register.addEventListener("click", function () {
  logInForm.style.display = "none";
  form.style.display = "flex";
});

// Validation functions
function validateName(input) {
  if (!input.value.trim()) {
    return "Name cannot be empty";
  }
  return "";
}

function validateEmail(input) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  if (!input.value.trim() || !emailRegex.test(input.value)) {
    return "Enter a valid email address (e.g. name@example.com)";
  }
  return "";
}

function validatePassword(input) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!input.value.trim() || !passwordRegex.test(input.value)) {
    return "Password must be at least 8 characters with letters & numbers";
  }
  return "";
}

function validateBirthdate(input) {
  if (!input.value) return "Birthdate is required";

  const dob = new Date(input.value);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  if (dob.getFullYear() < 1900 || age < 8 || age > 60) {
    return "Student must be between 8 and 60 years old";
  }
  return "";
}

function validateCheckbox(input) {
  if (!input.checked) return "You must accept the terms";
  return "";
}

// Show error and success
function showError(input, message) {
  const error = input.parentElement.querySelector(".error-msg");
  if (error) {
    error.textContent = message;
    error.style.display = message ? "block" : "none";
  }
  input.style.borderColor = message ? "red" : "green";
}

// Validate one input
function validateInput(input) {
  let errorMessage = "";

  switch (input.id) {
    case "name":
    case "logIn-name":
      errorMessage = validateName(input);
      break;
    case "email":
    case "logIn-email":
      errorMessage = validateEmail(input);
      break;
    case "birthdate":
      errorMessage = validateBirthdate(input);
      break;
    case "password":
    case "logIn-password":
      errorMessage = validatePassword(input);
      break;
    case "checkbox":
      errorMessage = validateCheckbox(input);
      break;
  }

  showError(input, errorMessage);
  return !errorMessage;
}

function addLiveValidation(inputs) {
  inputs.forEach((input) => {
    const eventType =
      input.type === "checkbox" || input.type === "date" ? "change" : "input";
    input.addEventListener(eventType, () => validateInput(input));
  });
}

addLiveValidation(inputs);
addLiveValidation(loginputs);
function showMessage(message, type = "success") {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = message;
  msgDiv.className = `toast-msg ${type}`;
  document.body.appendChild(msgDiv);
  setTimeout(() => msgDiv.remove(), 3000);
}
// On submit
const registerButton = form.querySelector("button");
const regbtnText = registerButton.querySelector(".btn-text");
const regbtnLoader = registerButton.querySelector(".btn-loader");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  formSubmitted = true;
  let allValid = true;

  inputs.forEach((input) => {
    const isValid = validateInput(input);
    if (!isValid) allValid = false;
  });

  if (allValid) {
    const safeUserData = {
      name: form.querySelector("#name").value,
      email: form.querySelector("#email").value,
      birthdate: form.querySelector("#birthdate").value,
      agreeTerms: form.querySelector("#checkbox").checked,
    };
    localStorage.setItem("userData", JSON.stringify(safeUserData));

    regbtnText.textContent = "Registering";
    regbtnLoader.classList.add("visible");
    registerButton.disabled = true;
    showQuestionnaire();
    showMessage("Form submitted successfully!");
    regbtnText.textContent = "Register";
    regbtnLoader.classList.remove("visible");
    registerButton.disabled = false;
    // Reset border and errors
    inputs.forEach((input) => {
      input.style.borderColor = "#ccc";
      const error = input.parentElement.querySelector(".error-msg");
      if (error) error.style.display = "none";
    });
  }
});
const logInButton = logInForm.querySelector("button");
const btnText = logInButton.querySelector(".btn-text");
const btnLoader = logInButton.querySelector(".btn-loader");
logInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formSubmitted = true;
  let allValid = true;
  loginputs.forEach((input) => {
    const isValid = validateInput(input);
    if (!isValid) allValid = false;
  });

  if (allValid) {
    showMessage("Form submitted successfully!");
    form.reset();

    loginputs.forEach((input) => {
      input.style.borderColor = "#ccc";
      const error = input.parentElement.querySelector(".error-msg");
      if (error) error.style.display = "none";
    });
  }

  btnText.textContent = "Verifying";
  btnLoader.classList.add("visible");
  logInButton.disabled = true;
  const email = document.getElementById("logIn-email").value.trim();
  const password = document.getElementById("logIn-password").value.trim();
  fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
    .then(async (res) => {
      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) throw new Error(data.message || "Login failed");
      return data;
    })
    .then((data) => {
      btnText.textContent = "Verify";
      btnLoader.classList.remove("visible");
      logInButton.disabled = false;
      showMessage(`Welcome ${data.user.name}`);
      const loggedInUser = {
        name: data.user.name,
        email: data.user.email,
      };
      localStorage.setItem("userData", JSON.stringify(loggedInUser));

      window.location.href = "/second/second.html";
    })
    .catch((err) => {
      console.error("Login fetch error:", err);
      showMessage(err.message);
    });
});
function startVerificationCountdown(container, duration = 10 * 60) {
  const countdownEl = container.querySelector("#countdown");
  let timeLeft = duration;

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  countdownEl.textContent = `Code expires in: ${formatTime(timeLeft)}`;

  const interval = setInterval(() => {
    timeLeft--;
    countdownEl.textContent = `Code expires in: ${formatTime(timeLeft)}`;

    if (timeLeft <= 0) {
      clearInterval(interval);
      countdownEl.textContent = "Verification code expired";
      container.querySelector("#verificationCode").disabled = true;
      container.querySelector("button").disabled = true;
    }
  }, 1000);
}

function showVerificationPopup(email) {
  const QAcontainer = document.createElement("div");

  QAcontainer.classList.add("QA-popup", "showQA");

  QAcontainer.innerHTML = `
    <form id="verifyForm">
      
      <h3 class="verification-header">Email Verification</h3>
      <p class="verification-body">We’ve sent a verification code to <strong>${email}</strong></p>
       <p id="countdown" class="countdown-timer"></p>
      <input type="text" id="verificationCode" placeholder="Enter 6-digit code" maxlength="6" required />
      <button type="submit"> <span class="btn-text">Verify</span>
  <span class="btn-loader"></span></button>
    </form>
  `;

  document.body.appendChild(QAcontainer);

  const verifyForm = QAcontainer.querySelector("#verifyForm");
  const submitButton = verifyForm.querySelector("button");
  const btnText = submitButton.querySelector(".btn-text");
  const btnLoader = submitButton.querySelector(".btn-loader");
  startVerificationCountdown(QAcontainer);
  verifyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = QAcontainer.querySelector("#verificationCode").value.trim();
    if (!code) {
      alert("Please enter the verification code!");
    }
    btnText.textContent = "Verifying";
    btnLoader.classList.add("visible");
    submitButton.disabled = true;
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, code }),
    })
      .then((res) => res.json())
      .then((data) => {
        btnText.textContent = "Verify";
        btnLoader.classList.remove("visible");
        submitButton.disabled = false;

        showMessage(data.message);
        if (data.message.toLowerCase().includes("success")) {
          QAcontainer.classList.remove("showQA");
        }
      })
      .catch((err) => {
        console.error("Verification error:", err);
        showMessage("Verification failed");
      });
  });
}
function showQuestionnaire() {
  const QAcontainer = document.createElement("div");
  QAcontainer.classList.add("QA-popup", "showQA");
  QAcontainer.innerHTML = `
   <form id="studentForm">
      <div id="cross-symbol" class="cross-symbol">x</div>
      <label>Have you graduated?</label>
      <select id="graduated" required>
        <option value="">Select</option>
        <option value="no">Not Graduated</option>
        <option value="yes">Graduated</option>
      </select>
      <div class="text-inQA">If graduated, select the graduated year and section</div>
      <div class="flex-row">
        <div class="flex-item">
          <label>Grade</label>
          <select id="grade" required>
            <option value="">Select Grade</option>
            <option value="KG">KG</option>
            ${Array.from(
              { length: 12 },
              (_, i) => `<option value="${i + 1}">${i + 1}</option>`
            ).join("")}
          </select>
        </div>
        <div class="flex-item">
          <label>Section</label>
          <select id="section" required>
            <option value="">Select Section</option>
            <option value="S">S (G-11 or 12,according to grade)</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
      </div>

      <label>Year Graduated</label>
      <input type="number" id="gradYear" placeholder="e.g., 2022(if not graduated,remain at blank)" min="1900" max="2099" />
      <button type="submit" id="submitBtn"><span class="btn-text">Submit</span>
  <span class="btn-loader"></span></button>
    </form>`;

  document.body.appendChild(QAcontainer);
  const crossSymbol = QAcontainer.querySelector("#cross-symbol");
  crossSymbol.addEventListener("click", () => {
    QAcontainer.classList.remove("showQA");
  });
  const studentForm = QAcontainer.querySelector("#studentForm");
  const submitButton = studentForm.querySelector("button");
  const btnText = submitButton.querySelector(".btn-text");
  const btnLoader = submitButton.querySelector(".btn-loader");
  studentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const questionnaireData = {
      graduated: QAcontainer.querySelector("#graduated").value,
      grade: QAcontainer.querySelector("#grade").value,
      section: QAcontainer.querySelector("#section").value,
      yearGraduated: QAcontainer.querySelector("#gradYear").value,
    };

    const savedUser = JSON.parse(localStorage.getItem("userData")) || {};
    const allData = { ...savedUser, ...questionnaireData };

    if (!allData.name || !allData.email) {
      showMessage("Please fill the main form first!");
      return;
    }
    btnText.textContent = "Submitting";
    btnLoader.classList.add("visible");
    submitButton.disabled = true;
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(allData),
    })
      .then((res) => res.json())
      .then((data) => {
        showMessage(data.message);
        btnText.textContent = "Submit";
        btnLoader.classList.remove("visible");
        submitButton.disabled = false;
        if (data.message.includes("success")) {
          const verificationSent = document.createElement("p");
          verificationSent.textContent = `The verification code has been sent to your email!`;
          QAcontainer.appendChild(verificationSent);
          QAcontainer.classList.remove("showQA");
          showVerificationPopup(allData.email);
        }
      })
      .catch((err) => console.error("Register fetch error:", err));

    QAcontainer.addEventListener("click", (e) => {
      if (e.target === QAcontainer) QAcontainer.classList.remove("showQA");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") QAcontainer.classList.remove("showQA");
    });

    localStorage.setItem("userData", JSON.stringify(allData));
  });
}
document
  .getElementById("forgot-password-link")
  .addEventListener("click", (e) => {
    e.preventDefault();

    const QAcontainer = document.createElement("div");
    QAcontainer.classList.add("QA-popup", "showQA");
    QAcontainer.innerHTML = `
   <form class="forgotForm">
      <div id="cross-symbol" class="cross-symbol">x</div>
        <h3 class="verification-header">Forgot Password</h3>
      <p class="verification-body">Enter your email to receive a reset link!</p>
      <label>Email</label>
      <input type="text" id="forgotEmail" placeholder="Your reset email"/>
      <button type="submit" id="forgotBtn"><span class="btn-text">Send Link</span>
  <span class="btn-loader"></span></button>
  <p id="forgotMsg" class="popup-msg"></p>
    </form>`;

    document.body.appendChild(QAcontainer);
    const crossSymbol = QAcontainer.querySelector("#cross-symbol");
    crossSymbol.addEventListener("click", () => {
      QAcontainer.classList.remove("showQA");
      setTimeout(() => QAcontainer.remove(), 300);
    });

    const forgotForm = QAcontainer.querySelector(".forgotForm");
    const msg = document.getElementById("forgotMsg");
    const btn = document.getElementById("forgotBtn");
    const submitButton = forgotForm.querySelector("button");
    const btnLoader = submitButton.querySelector(".btn-loader");
    forgotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("forgotEmail").value.trim();

      submitButton.disabled = true;
      btnLoader.classList.add("visible");
      msg.textContent = "Sending reset link...";

      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (data.success) {
          btnLoader.classList.remove("visible");
          submitButton.disabled = false;

          msg.textContent = "Reset link sent! Check your inbox.";
          msg.style.color = "green";
        } else {
          msg.textContent = data.message;
          msg.style.color = "red";
        }
      } catch (err) {
        msg.textContent = "⚠️ Something went wrong.";
        msg.style.color = "red";
      } finally {
        btn.disabled = false;
      }
    });
  });
//
const pathParts = window.location.pathname.split("/");
if (pathParts[1] === "reset-password" && pathParts[2]) {
  const token = pathParts[2]; // Extract token from URL

  const QAcontainer = document.createElement("div");
  QAcontainer.classList.add("QA-popup", "showQA");

  QAcontainer.innerHTML = `
    <form class="resetForm">
      <div id="cross-symbol" class="cross-symbol">x</div>
      <h3 class="verification-header">Reset Password</h3>
      <p class="verification-body">Enter your new password</p>
      <input type="password" id="newPassword" placeholder="New password" required />
      <button type="submit" id="resetBtn">
        <span class="btn-text">Reset Password</span>
        <span class="btn-loader"></span>
      </button>
      <p id="resetMsg" class="popup-msg"></p>
    </form>
  `;

  document.body.appendChild(QAcontainer);

  const crossSymbol = QAcontainer.querySelector("#cross-symbol");
  crossSymbol.addEventListener("click", () => {
    QAcontainer.classList.remove("showQA");
    setTimeout(() => QAcontainer.remove(), 300);
  });

  const resetForm = QAcontainer.querySelector(".resetForm");
  const msg = QAcontainer.querySelector("#resetMsg");
  const submitButton = resetForm.querySelector("button");
  const btnLoader = submitButton.querySelector(".btn-loader");

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = QAcontainer.querySelector("#newPassword").value.trim();

    submitButton.disabled = true;
    btnLoader.classList.add("visible");
    msg.textContent = "Resetting password...";

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      btnLoader.classList.remove("visible");
      submitButton.disabled = false;

      if (data.success) {
        msg.textContent = "Password reset successfully!";
        msg.style.color = "green";
      } else {
        msg.textContent = data.message;
        msg.style.color = "red";
      }
    } catch (err) {
      btnLoader.classList.remove("visible");
      submitButton.disabled = false;
      msg.textContent = "⚠️ Something went wrong.";
      msg.style.color = "red";
    }
  });
}
