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

  // if current hour is 00:00:01
  if (
    new Date().getHours() === 0 &&
    new Date().getMinutes() === 0 &&
    new Date().getSeconds() === 1
  ) {
    //console.log("It's 00:00:01");
    updateTodayHighlight();
  }
}

updateDateTime(); // run immediately
setInterval(updateDateTime, 1000); // update every second

//Get current hour
const hour = new Date().getHours();
const dotInners = document.querySelectorAll(".greyTodayDot");

// 0 = Morning (0-11), 1 = Afternoon (12-17), 2 = Evening (18-23)
if (hour >= 0 && hour < 12) {
  dotInners[0].classList.add("greyTodayDot-active");
} else if (hour >= 12 && hour < 18) {
  dotInners[1].classList.add("greyTodayDot-active");
} else if (hour >= 18) {
  dotInners[2].classList.add("greyTodayDot-active");
}
