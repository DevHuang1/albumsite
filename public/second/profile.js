const userData = JSON.parse(localStorage.getItem("userData"));
const rightMenu = document.querySelector(".right-menu");
const nameTitle = document.querySelector(".navBtn");
console.log(userData);

function setupLogoutButton() {
  const logOutBtn = document.querySelector(".log-out-btn");
  if (logOutBtn) {
    logOutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      window.location.href = "/main/main.html";
    });
  }
}

if (userData && userData.registered === true) {
  const name = document.createElement("p");
  name.textContent = `Hello, ${userData.name.split(" ")[0]}!`;
  name.classList.add("nameTitle");
  rightMenu.prepend(name);

  nameTitle.textContent = "Log Out";
  nameTitle.classList.add("log-out-btn");

  setupLogoutButton();
}
