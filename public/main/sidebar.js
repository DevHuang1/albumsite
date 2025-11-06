const hamMenu = document.querySelector(".ham-menu");
const sidebar = document.querySelector(".sidebar");
const closeCross = document.querySelector(".close");

hamMenu.addEventListener("click", () => {
  sidebar.classList.add("showside");
});

closeCross.addEventListener("click", () => {
  sidebar.classList.remove("showside");
});
