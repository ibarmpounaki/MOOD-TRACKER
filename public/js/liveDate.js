function updateDateTime() {
  const now = new Date();

  console.log("hey");
  const formatted = now.toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  document.getElementById("curDate").textContent = formatted;
}

updateDateTime();                  // run immediately
setInterval(updateDateTime, 1000); // update every second
