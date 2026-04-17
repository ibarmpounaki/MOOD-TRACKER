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

const moods = window.moods || [];

// remove/add the '.selected' class whenever a day on the calendar is clicked
document.querySelectorAll(".day").forEach((d) => {
  d.addEventListener("click", (e) => {
    document.querySelectorAll(".day.selected").forEach((ds) => {
      ds.classList.remove("selected");
    });
    d.classList.add("selected");

    //find the mood entries from the DB that has the same data as the day that has been clicked from the calendar
    const cur_Mood_Entry = moods.filter((entry) => {
      const d = new Date(entry.mood_date);
      const entryKey = `${d.getDate()}-${d.getMonth() + 1}`;

      const clickedDate = `${e.currentTarget.dataset.day}-${e.currentTarget.dataset.month}`;

      return entryKey === clickedDate;
    });

    const periods = ["morning", "afternoon", "evening"];

    periods.forEach((p, index) => {
      // Find the mood entry for the current period, if one exists
      const periodMoodEntry = cur_Mood_Entry.find((entry) => {
        return entry.period === p;
      });

      // put that period's note into the matching textarea
      document.querySelector(".notes-" + index).value =
        periodMoodEntry?.note || "";

      // select the saved mood for each period
      document.querySelectorAll(".mood-" + index).forEach((moodEl) => {
        //clear any previously selected mood option for this period
        moodEl.classList.remove("selected");

        // select the mood option whose data-mood matches the saved mood name
        if (moodEl.dataset.mood === periodMoodEntry?.mood_name) {
          moodEl.classList.add("selected");
        }

        // update the hidden inputs
        document.querySelector(`input[name='selectedMood-${index}']`).value =
          periodMoodEntry?.mood_name;
        document.querySelector(`input[name='selectedcolor-${index}']`).value =
          periodMoodEntry?.mood_color;
      });

      // select the saved tags for each period (if any exist)
      document.querySelectorAll(`.tag[data-index="${index}"]`).forEach((t) => {
        t.classList.remove("selected");

        if (periodMoodEntry?.tags?.length > 0) {
          periodMoodEntry?.tags?.forEach((tag) => {
            if (Number(t.dataset.index) === index && t.dataset.tag === tag) {
              t.classList.add("selected");
            }
          });
        }
      });

      // update the hidden inputs
      document.querySelector(`input[name='selectedTags-${index}']`).value =
        periodMoodEntry?.tags?.join(",") || "";
    });

    const day = String(e.currentTarget.dataset.day).padStart(2, "0");
    const month = String(e.currentTarget.dataset.month).padStart(2, "0");
    const year = document.querySelector("#curYear").textContent.trim();

    document.querySelector("#selectedDate").value = `${year}-${month}-${day}`;
  });
});
