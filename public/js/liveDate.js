let lastDay = null;

function updateDateTime() {
  const now = new Date();

  const date = now.toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
  });

  const time = now.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  document.getElementById("curDate").textContent = "Today, " + date;
  document.getElementById("curTime").textContent = time;
}

updateDateTime(); // run immediately
setInterval(updateDateTime, 1000); // update every second

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
