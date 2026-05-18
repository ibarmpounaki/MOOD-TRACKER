document.querySelectorAll(".stats-pill").forEach((pill) => {
  pill.addEventListener("click", async function () {
    // update active state
    document
      .querySelectorAll(".stats-pill")
      .forEach((p) => p.classList.remove("active"));
    this.classList.add("active");

    const days = this.dataset.days;
    const res = await fetch(`/statistics/data?days=${days}`);
    const data = await res.json();

    // update metric cards
    document.querySelector(".streak-value").textContent = data.streak;
    document.querySelector(".daysLogged-value").textContent = data.daysLogged;
    document.querySelector(".avgMood-value").textContent = data.averageMood;
    document.querySelector(".bestDay-value").textContent = data.bestDay;

    // update chart
    moodChart.data.labels = data.chartLabels;
    moodChart.data.datasets[0].data = data.chartMorning;
    moodChart.data.datasets[1].data = data.chartAfternoon;
    moodChart.data.datasets[2].data = data.chartEvening;
    moodChart.update();

    // update mood breakdown bars
    document.querySelectorAll(".mood-bar-fill").forEach((bar, i) => {
      bar.style.width = data.moodBreakdown[i].pct + "%";
    });
    document.querySelectorAll(".mood-bar-pct").forEach((pct, i) => {
      pct.textContent = data.moodBreakdown[i].pct + "%";
    });

    // update period stats
    document.querySelectorAll(".period-stat-avg").forEach((el, i) => {
      el.textContent = data.periodStats[i].avgName;
    });
    document.querySelectorAll(".period-stat-entries").forEach((el, i) => {
      el.textContent = data.periodStats[i].entries + " entries";
    });

    // consistency notice
    const notice = document.querySelector(".chart-notice");
    if (notice) notice.style.display = data.consistentMood ? "block" : "none";
  });
});
