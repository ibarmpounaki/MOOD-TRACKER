let selectedMood = null;

document.querySelectorAll(".tag").forEach((tg) => {
  tg.addEventListener("click", function () {
    this.classList.toggle("selected");

    //collect all the selected tags
    const selectedTags = [];
    const index = this.dataset.index;

    document
      .querySelectorAll(`.tagContainer-${index} .selected`)
      .forEach((t) => selectedTags.push(t.dataset.tag)); //get the data-tag from the element

    document.querySelector(`input[name='selectedTags-${index}']`).value =
      selectedTags.join(",");
  });
});

document.querySelectorAll(".mood").forEach((md) => {
  md.addEventListener("click", function () {
    const moodClass = [...this.classList].find((c) => c.startsWith("mood-")); //string
    const PartOfTheDay_MoodIndex = moodClass.replace("mood-", ""); //string

    //if we clicked on a NOT already selected mood, remove the selected class from the mood that had been selected last
    if (!$(this).hasClass("selected")) {
      document
        .querySelectorAll(".mood-" + PartOfTheDay_MoodIndex)
        .forEach((tg) => {
          tg.classList.remove("selected");
        });

      $(this).toggleClass("selected");

      // update the hidden inputs for this specific section
      document.querySelector(
        `input[name='selectedMood-${PartOfTheDay_MoodIndex}']`,
      ).value = this.dataset.mood;
      document.querySelector(
        `input[name='selectedcolor-${PartOfTheDay_MoodIndex}']`,
      ).value = this.dataset.color;
    } else {
      $(this).toggleClass("selected");

      document.querySelector(
        `input[name='selectedMood-${PartOfTheDay_MoodIndex}']`,
      ).value = "";
      document.querySelector(
        `input[name='selectedcolor-${PartOfTheDay_MoodIndex}']`,
      ).value = "";
    }

    //selectedMood = $(this);
  });
});

// $(".ok").click(function () {
//   if (selectedMood) {
//     selectedMood.removeClass("selected");
//   }
//   selectedMood = null;
// });

function showErrorToast(message) {
  document.querySelector(".toast-error")?.remove();

  const toast = document.createElement("div");
  toast.className = "toast toast-error";
  toast.textContent = message;
  document.body.appendChild(toast);

  // remove from DOM after animation ends
  toast.addEventListener("animationend", () => toast.remove());
}

const saveBtn = document.querySelector("button.ok");
console.log(saveBtn);

document.querySelector("button.ok").addEventListener("click", function (e) {
  e.preventDefault();

  const periods = ["Morning", "Afternoon", "Evening"];
  let valid = true;

  // check if values have been assigned for all the 3 parts of the day (mood is required)
  for (let i = 0; i < 3; i++) {
    const mood = document.querySelector(
      `input[name='selectedMood-${i}']`,
    ).value;
    if (!mood || mood === "" || mood === "undefined") {
      showErrorToast(`Please select a mood for ${periods[i]} before saving.`);
      return;
    }
  }

  // all moods valid — submit manually
  document.querySelector("form[action='/addJournalEntry']").submit();
});
