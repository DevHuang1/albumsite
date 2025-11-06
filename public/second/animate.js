const dark = document.querySelector(".moon");

const popupText = document.createElement("div");
popupText.classList.add("text-popup");
popupText.innerHTML = `
  <div>
    <h1>Dark Mode will be available soon!</h1>
  </div>
`;

document.body.appendChild(popupText);

dark.addEventListener("click", function () {
  popupText.classList.add("showText");
});

popupText.addEventListener("click", (e) => {
  if (e.target === popupText) popupText.classList.remove("showText");
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") popupText.classList.remove("showText");
});

const wrapper = document.getElementById("marquee");

const carouselWidth = wrapper.parentElement.offsetWidth;
while (wrapper.scrollWidth < carouselWidth * 2) {
  wrapper.innerHTML += wrapper.innerHTML;
}
const scrollAmount = wrapper.scrollWidth / 2;
wrapper.animate(
  [
    { transform: "translateX(0)" },
    { transform: `translateX(-${scrollAmount}px)` },
  ],
  {
    duration: 26000,
    iterations: Infinity,
    easing: "linear",
  }
);
