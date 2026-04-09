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
    }

    $(this).toggleClass("selected");

    // update the hidden inputs for this specific section
    document.querySelector(
      `input[name='selectedMood-${PartOfTheDay_MoodIndex}']`,
    ).value = this.dataset.mood;
    document.querySelector(
      `input[name='selectedcolor-${PartOfTheDay_MoodIndex}']`,
    ).value = this.dataset.color;

    //selectedMood = $(this);
  });
});

$(".ok").click(function () {
  if (selectedMood) {
    selectedMood.removeClass("selected");
  }
  selectedMood = null;

  // check if values have been assigned (mood or/and journal)
});

$(".day").click(function () {});
