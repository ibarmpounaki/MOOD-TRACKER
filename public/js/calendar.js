// Keep the calendar highlight in sync when the day changes
// global function
function updateTodayHighlight() {
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;

  if (d === lastDay) return; // no change will be made

  lastDay = d;

  document
    .querySelectorAll(".day.today")
    .forEach((el) => el.classList.remove("today"));

  const newToday = document.querySelector(
    `.day[data-day="${d}"][data-month="${m}"]`,
  );

  if (newToday) newToday.classList.add("today");
}

// remove/add the '.selected' class whenever a day on the calendar is clicked
document.querySelectorAll(".day").forEach((d) => {
  d.addEventListener("click", () => {
    document.querySelectorAll(".day.selected").forEach((ds) => {
      ds.classList.remove("selected");
    });
    d.classList.add("selected");
  });
});
