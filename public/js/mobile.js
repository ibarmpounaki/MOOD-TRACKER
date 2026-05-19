const testDay = document.querySelector(".day, button.today");

(function () {
  if (window.innerWidth > 1470) return; // desktop — do nothing

  function getSelectedDay() {
    return (
      document.querySelector(".day.selected") ||
      document.querySelector("button.today.selected") ||
      document.querySelector("button.today")
    );
  }

  function clickDay(day, month, year) {
    const sel =
      `button.today[data-day="${day}"][data-month="${month}"][data-year="${year}"], ` +
      `.day[data-day="${day}"][data-month="${month}"][data-year="${year}"]`;

    const el = document.querySelector(sel);

    if (!el) {
      console.log("element not found");
      return;
    }

    handleDayClick(el); // call directly instead of .click()
  }

  function buildDotStrip() {
    const strip = document.getElementById("dayDotStrip");
    if (!strip) return;
    strip.innerHTML = "";
    const today = new Date();
    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = `${d.getDate()}-${d.getMonth() + 1}`;
      const dot = document.createElement("div");
      dot.className = "day-dot";
      if (i === 0) dot.classList.add("active");
      else if (typeof moodMap !== "undefined" && !moodMap[key])
        dot.classList.add("empty");
      strip.appendChild(dot);
    }
  }
  buildDotStrip();

  // prev arrow
  document.getElementById("prevDayBtn")?.addEventListener("click", function () {
    const cur = getSelectedDay();

    if (!cur) return;

    console.log("day:", cur.dataset.day);
    console.log("month:", cur.dataset.month);
    console.log("year:", cur.dataset.year);

    const d = new Date(
      parseInt(cur.dataset.year),
      parseInt(cur.dataset.month) - 1,
      parseInt(cur.dataset.day),
    );

    d.setDate(d.getDate() - 1);
    clickDay(d.getDate(), d.getMonth() + 1, d.getFullYear());
  });

  // next arrow
  document.getElementById("nextDayBtn")?.addEventListener("click", function () {
    const cur = getSelectedDay();

    if (!cur) return;

    const d = new Date(
      parseInt(cur.dataset.year),
      parseInt(cur.dataset.month) - 1,
      parseInt(cur.dataset.day),
    );

    d.setDate(d.getDate() + 1);

    // don't go into the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (d > today) return;
    clickDay(d.getDate(), d.getMonth() + 1, d.getFullYear());
  });

  // calendar FAB + overlay
  const fab = document.getElementById("calFab");
  const overlay = document.getElementById("calOverlay");
  const drawer = document.getElementById("calDrawerInner");
  const calCard = document.querySelector(".calendar-card");

  fab.addEventListener("click", () => {
    console.log("fab clicked");
    console.log("overlay element:", overlay);
    overlay.classList.add("open");
    console.log("overlay classes:", overlay.className);
    document.body.style.overflow = "hidden";
  });

  if (fab && overlay && calCard && drawer) {
    // clone the real calendar into the drawer
    const clone = calCard.cloneNode(true);

    console.log("clone innerHTML length:", clone.innerHTML.length);
    console.log("clone children:", clone.children.length);
    clone.style.display = "block";
    clone.style.visibility = "visible";
    clone.style.height = "auto";
    clone.style.position = "relative";
    clone.style.overflow = "visible";
    drawer.appendChild(clone);

    clone.style.display = "block";
    drawer.appendChild(clone);

    // wire clicks in the cloned calendar → trigger real calendar → close overlay
    clone.querySelectorAll(".day, button.today").forEach((dayEl) => {
      dayEl.addEventListener("click", function () {
        clickDay(this.dataset.day, this.dataset.month, this.dataset.year);
        closeOverlay();
      });
    });

    fab.addEventListener("click", () => {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
    });

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay();
    });

    function closeOverlay() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  }
})();
