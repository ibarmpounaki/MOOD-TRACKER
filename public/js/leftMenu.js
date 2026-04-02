document
  .querySelector(".menu.categories")
  .addEventListener("click", function (e) {
    console.log(e.target.classList);
    e.preventDefault();

    if (e.target.classList.contains("journal")) {
      console.log("JOURNAL");
    }
  });
