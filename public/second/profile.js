const userData = JSON.parse(localStorage.getItem("userData")) || {};
const rightMenu = document.querySelector(".right-menu");
const nameTitle = document.querySelector(".navBtn");

if (userData && userData.name) {
  const name = document.createElement("p");
  name.textContent = `Hello, ${userData.name.split(" ")[0]}!`; // first name
  name.classList.add("nameTitle");
  rightMenu.prepend(name);

  nameTitle.textContent = "Log Out";
  nameTitle.classList.add("log-out-btn");

  const logOutBtn = document.querySelector(".log-out-btn");
  logOutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userData");

      window.location.href = "/main/main.html";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  });
}
