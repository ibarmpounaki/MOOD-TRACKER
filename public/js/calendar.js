const moods = window.moods || [];

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const nowDate = new Date();
const todayDate = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(nowDate.getDate()).padStart(2, "0")}`;
// const todayDate = `${nowDate.getDate()}-${nowDate.getMonth() + 1}`;

// in order to be accessible from other js files even when its value changes
let selectedDay = todayDate;

// remove/add the '.selected' class whenever a day on the calendar is clicked
document.querySelectorAll(".day").forEach((d) => {
  d.addEventListener("click", (e) => {
    selectedDay = `${e.currentTarget.dataset.year}-${String(e.currentTarget.dataset.month).padStart(2, "0")}-${String(e.currentTarget.dataset.day).padStart(2, "0")}`;

    if (selectedDay <= todayDate) {
      document.querySelectorAll(".day.selected").forEach((ds) => {
        ds.classList.remove("selected");
      });
      d.classList.add("selected");

      //find the mood entries from the DB that has the same date as the day that has been clicked from the calendar
      const cur_Mood_Entry = moods.filter((entry) => {
        const d = new Date(entry.mood_date);
        const entryKey = `${d.getDate()}-${d.getMonth() + 1}`;

        const clickedDate = `${e.currentTarget.dataset.day}-${e.currentTarget.dataset.month}`;
        // selectedDate = `${e.currentTarget.dataset.year}-${e.currentTarget.dataset.month}-${e.currentTarget.dataset.day}`;

        return entryKey === clickedDate;
      });

      // if there are no entries for the clicked day
      if (cur_Mood_Entry.length !== 0) {
        // display the delete btn on the banner (dashboard page)
        document.querySelector(".delete-btn").classList.remove("hidden");
      } else {
        document.querySelector(".delete-btn").classList.add("hidden");
      }

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

          // console.log(
          //   "COLOR: " +
          //     document.querySelector(`input[name='selectedcolor-${index}']`)
          //       .value,
          // );
        });

        // select the saved tags for each period (if any exist)
        document
          .querySelectorAll(`.tag[data-index="${index}"]`)
          .forEach((t) => {
            t.classList.remove("selected");

            if (periodMoodEntry?.tags?.length > 0) {
              periodMoodEntry?.tags?.forEach((tag) => {
                if (
                  Number(t.dataset.index) === index &&
                  t.dataset.tag === tag
                ) {
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

      const now = new Date();
      const dt = String(now.getDate()).padStart(2, "0");
      const m = String(now.getMonth() + 1).padStart(2, "0");
      const y = String(now.getFullYear());

      // if the clicked day is today, display "VIEWING: TODAY" on the banner
      if (dt === day && m === month && y === year) {
        openTodayDay();
      } else {
        openPastDay(`${monthNames[month - 1]} ${day}, ${year}`);
      }
    }
  });
});

function openPastDay(date) {
  const banner = document.getElementById("viewingBanner");
  document.getElementById("viewingDate").textContent = date;
}

function openTodayDay() {
  const banner = document.getElementById("viewingBanner");
  document.getElementById("viewingDate").textContent = "Today";
}

const deleteForm = document.getElementById("deleteForm");

if (deleteForm) {
  deleteForm.addEventListener("submit", function () {
    // selectedDate should be your currently viewed date
    document.getElementById("deleteSelectedDate").value = selectedDay;
  });
}
