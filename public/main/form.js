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

// On submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  formSubmitted = true;
  let allValid = true;

  inputs.forEach((input) => {
    const isValid = validateInput(input);
    if (!isValid) allValid = false;
  });

  if (allValid) {
    userData = {
      name: form.querySelector("#name").value,
      email: form.querySelector("#email").value,
      birthdate: form.querySelector("#birthdate").value,
      password: form.querySelector("#password").value,
      agreeTerms: form.querySelector("#checkbox").checked,
    };

    localStorage.setItem("userData", JSON.stringify(userData));
    showQuestionnaire();
    alert("Form submitted successfully!");

    // Reset border and errors
    inputs.forEach((input) => {
      input.style.borderColor = "#ccc";
      const error = input.parentElement.querySelector(".error-msg");
      if (error) error.style.display = "none";
    });
  }
});

logInForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formSubmitted = true;
  let allValid = true;
  loginputs.forEach((input) => {
    const isValid = validateInput(input);
    if (!isValid) allValid = false;
  });

  if (allValid) {
    alert("Form submitted successfully!");
    form.reset();

    loginputs.forEach((input) => {
      input.style.borderColor = "#ccc";
      const error = input.parentElement.querySelector(".error-msg");
      if (error) error.style.display = "none";
    });
  }

  const name = document.getElementById("logIn-name").value.trim();
  const email = document.getElementById("logIn-email").value.trim();
  const password = document.getElementById("logIn-password").value.trim();
  fetch("http://localhost:3000/api/auth/login", {
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
      alert("Welcome " + data.user.name);
      const loggedInUser = {
        name: data.user.name,
        email: data.user.email,
      };
      localStorage.setItem("userData", JSON.stringify(loggedInUser));
      localStorage.setItem("token", data.token);

      window.location.href = "/second/second.html";
    })
    .catch((err) => {
      console.error("Login fetch error:", err);
      alert(err.message);
    });
});

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
      <button type="submit" id="submitBtn">Submit</button>
    </form>`;

  document.body.appendChild(QAcontainer);
  const crossSymbol = QAcontainer.querySelector("#cross-symbol");
  crossSymbol.addEventListener("click", () => {
    QAcontainer.classList.remove("showQA");
  });
  const studentForm = QAcontainer.querySelector("#studentForm");

  studentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const questionnaireData = {
      graduated: QAcontainer.querySelector("#graduated").value,
      grade: QAcontainer.querySelector("#grade").value,
      section: QAcontainer.querySelector("#section").value,
      yearGraduated: QAcontainer.querySelector("#gradYear").value,
    };

    const allData = { ...userData, ...questionnaireData };
    if (!allData.name || !allData.email || !allData.password) {
      alert("Please fill the main form first!");
      return;
    }
    fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(allData),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        if (data.message.includes("success")) {
        }
      })
      .catch((err) => console.error("Register fetch error:", err));

    QAcontainer.addEventListener("click", (e) => {
      if (e.target === QAcontainer) QAcontainer.classList.remove("showQA");
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") QAcontainer.classList.remove("showQA");
    });

    const savedUser = JSON.parse(localStorage.getItem("userData")) || {};
    const finalData = { ...savedUser, ...questionnaireData };
    localStorage.setItem("userData", JSON.stringify(finalData));
  });
}
