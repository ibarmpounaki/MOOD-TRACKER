let lastDay = null;
let seletedDay_localVar = selectedDay;

document.querySelectorAll(".day").forEach((d) => {
  d.addEventListener("click", (e) => {
    seletedDay_localVar = selectedDay;

    // if the selected day is not "today", delete the glowing grey effect that appear on one part of the day
    if (selectedDay < todayDate) {
      document
        .querySelectorAll(".greyTodayDot.greyTodayDot-active")
        .forEach((ds) => {
          ds.classList.remove("greyTodayDot-active");
        });
    }
  });
});

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

  const curDate = document.getElementById("curDate");
  const curTime = document.getElementById("curTime");
  if (curDate) curDate.textContent = "Today, " + date;
  if (curTime) curTime.textContent = time;

  const hour = new Date().getHours();

  // if current hour is 00:00:01
  if (
    hour === 0 &&
    new Date().getMinutes() === 0 &&
    new Date().getSeconds() === 1
  ) {
    updateTodayHighlight();
  }

  const dotInners = document.querySelectorAll(".greyTodayDot");
  if (!dotInners.length) return; // exits here on any page without dots

  if (selectedDay === todayDate) {
    // 0 = Morning (0-11), 1 = Afternoon (12-17), 2 = Evening (18-23)
    if (hour >= 0 && hour < 12) {
      if (!dotInners[0].classList.contains("greyTodayDot-active")) {
        document
          .querySelectorAll(".greyTodayDot.greyTodayDot-active")
          .forEach((ds) => {
            ds.classList.remove("greyTodayDot-active");
          });
        dotInners[0].classList.add("greyTodayDot-active");
      }
    } else if (hour >= 12 && hour < 18) {
      if (!dotInners[1].classList.contains("greyTodayDot-active")) {
        document
          .querySelectorAll(".greyTodayDot.greyTodayDot-active")
          .forEach((ds) => {
            ds.classList.remove("greyTodayDot-active");
          });
        dotInners[1].classList.add("greyTodayDot-active");
      }
    } else if (hour >= 18) {
      if (!dotInners[2].classList.contains("greyTodayDot-active")) {
        document
          .querySelectorAll(".greyTodayDot.greyTodayDot-active")
          .forEach((ds) => {
            ds.classList.remove("greyTodayDot-active");
          });
        dotInners[2].classList.add("greyTodayDot-active");
      }
    }
  }
}

updateDateTime(); // run immediately
setInterval(updateDateTime, 1000); // update every second

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

  document.querySelectorAll(".day.selected").forEach((ds) => {
    ds.classList.remove("selected");
  });

  const newToday = document.querySelector(
    `.day[data-day="${d}"][data-month="${m}"]`,
  );

  if (newToday) {
    newToday.classList.add("today");
    newToday.classList.add("selected");
  }
}

// Get current hour
// const hour = new Date().getHours();
// const dotInners = document.querySelectorAll(".greyTodayDot");

// // 0 = Morning (0-11), 1 = Afternoon (12-17), 2 = Evening (18-23)
// if (hour >= 0 && hour < 12) {
//   dotInners[0].classList.add("greyTodayDot-active");
// } else if (hour >= 12 && hour < 18) {
//   dotInners[1].classList.add("greyTodayDot-active");
// } else if (hour >= 18) {
//   dotInners[2].classList.add("greyTodayDot-active");
// }

// add the "today's" css to the today's calendar cell. Aka add the black border
const now = new Date();
const d = now.getDate();
const m = now.getMonth() + 1;

const today = document.querySelector(
  `.day[data-day="${d}"][data-month="${m}"]`,
);

if (today) {
  today.classList.add("selected");
}
