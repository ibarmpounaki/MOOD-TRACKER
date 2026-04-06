let selectedMood = null;

document.querySelectorAll(".tag").forEach((tg) => {
  tg.addEventListener("click", function () {
    this.classList.toggle("selected");
  });
});

$(".mood").click(function (e) {
  //if we clicked on a NOT already selected mood, remove the selected class from the mood that had been selected last
  if (!$(this).hasClass("selected")) {
    $(".mood").removeClass("selected");
  }

  $(this).toggleClass("selected");

  // $(this).addClass("selected");
  $("#selectedMoodInput").val($(this).data("mood"));
  $("#selectedColorInput").val($(this).data("color"));
  selectedMood = $(this);
});

$(".ok").click(function () {
  if (selectedMood) {
    selectedMood.removeClass("selected");
  }
  selectedMood = null;

  // check if values have been assigned (mood or/and journal)
});

$(".day").click(function () {});
