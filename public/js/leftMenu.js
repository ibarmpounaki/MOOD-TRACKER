document
  .querySelector(".part.menu-bar")
  .addEventListener("click", function (e) {
    const selectedLink = e.target.closest("a");
    if (!selectedLink) return;

    e.preventDefault(); // prevent the default action of the click event

    const selectedImg = selectedLink.querySelector(".menu-image");
    const selectedCategory = e.target.closest(".menu.categories");

    document.querySelectorAll(".menu-image").forEach((img) => {
      img.src = img.src.replace("-selected", "-unselected");
    });

    document.querySelectorAll("a").forEach((a) => {
      a.style.color = " #5870c06e";
    });

    document.querySelectorAll(".menu.categories").forEach((btn) => {
      btn.classList.remove("active");
    });

    selectedCategory.classList.add("active");

    // toggle based on current src
    if (selectedImg.src.includes("-unselected")) {
      selectedImg.src = selectedImg.src.replace("-unselected", "-selected");
      selectedLink.style.color = "#2e3d64";
    }
  });
