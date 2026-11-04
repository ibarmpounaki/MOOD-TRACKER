document
  .querySelector(".part.menu-bar")
  .addEventListener("click", function (e) {
    const selectedLink = e.target.closest("a");
    // console.log(selectedLink);

    if (!selectedLink) return;

    e.preventDefault();

    // move the "active" highlight to the clicked item
    document.querySelectorAll(".menu.categories").forEach((item) => {
      item.classList.remove("active");
    });
    selectedLink.closest(".menu.categories").classList.add("active");

    // toggle sections based on which link was clicked
    if (selectedLink.classList.contains("journal")) {
      document.getElementById("journalSection").classList.remove("hidden");
      document.getElementById("statsSection").classList.add("hidden");
    } else if (selectedLink.classList.contains("statistics")) {
      document.getElementById("journalSection").classList.add("hidden");
      document.getElementById("statsSection").classList.remove("hidden");
    }
  });
