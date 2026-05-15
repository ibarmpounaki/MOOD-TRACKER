document
  .querySelector(".part.menu-bar")
  .addEventListener("click", function (e) {
    const selectedLink = e.target.closest("a");
    // console.log(selectedLink);

    if (!selectedLink) return;

    e.preventDefault();

    const selectedImg = selectedLink.querySelector(".menu-image");
    const selectedCategory = e.target.closest(".menu.categories");

    // reset all images and colors
    document.querySelectorAll(".menu-image").forEach((img) => {
      img.src = img.src.replace("-selected", "-unselected");
    });
    document.querySelectorAll("a").forEach((a) => {
      a.style.color = "#5870c06e";
    });
    document.querySelectorAll(".menu.categories").forEach((btn) => {
      btn.classList.remove("active");
    });

    selectedCategory.classList.add("active");

    if (selectedImg.src.includes("-unselected")) {
      selectedImg.src = selectedImg.src.replace("-unselected", "-selected");
      selectedLink.style.color = "#2e3d64";
    }

    // toggle sections based on which link was clicked
    if (selectedLink.classList.contains("journal")) {
      document.getElementById("journalSection").classList.remove("hidden");
      document.getElementById("statsSection").classList.add("hidden");
    } else if (selectedLink.classList.contains("statistics")) {
      document.getElementById("journalSection").classList.add("hidden");
      document.getElementById("statsSection").classList.remove("hidden");
    }
  });
