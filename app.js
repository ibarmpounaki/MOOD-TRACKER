import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.set("view engine", "ejs"); //Tell Express to use EJS as the template engine for rendering views. In order not to use '.ejs' in the render functionality.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // dont resave unchanged session
    saveUninitialized: false, // dont create empty sessions
    cookie: { secure: false }, // true only in HTTPS
  }),
);

function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  next();
}

// it helps make /login and /signup load fresh instead of showing an old saved version.
app.use((req, res, next) => {
  if (req.path === "/login" || req.path === "/signup") {
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    });
  }
  next();
});

app.get("/", (req, res) => {
  //res.send("Mood Tracker Running");
  // return renderLogin(res);
  return res.redirect("/login");
});

// get login page
app.get("/login", (req, res) => {
  // If the user is already logged in, send them to the dashboard
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }

  const error = req.session.loginError || null;
  const email = req.session.loginEmail || "";

  // Clear them so they do not stay for the next request
  delete req.session.loginError;
  delete req.session.loginEmail;

  return res.render("login", {
    error,
    email, // Preserve the user's email so they do not have to type it again after an error
  });
});

// get signup page
app.get("/signup", (req, res) => {
  if (req.session.userId) {
    return res.redirect("/dashboard");
  }

  const error = req.session.signupError || null;
  const name = req.session.signupName || ""; // Get the previously entered name from the session, or use an empty string
  const surname = req.session.signupSurname || "";

  const email = req.session.signupEmail || "";

  delete req.session.signupError;
  delete req.session.signupName;
  delete req.session.signupSurname;

  delete req.session.signupEmail;

  return res.render("signup", {
    error,
    name,
    surname,
    email,
  });
});

// on sumbit click on singup page
app.post("/signup", async (req, res) => {
  const { name, lastName, email, password, confirmPassword } = req.body;
  try {
    // check if user already exists
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      req.session.signupError = "Email already registered.";
      req.session.signupName = name;
      req.session.signupSurname = lastName;
      req.session.signupEmail = email;
      return res.redirect("/signup");
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // insert user
    const result = await db.query(
      ` INSERT INTO users (name, surname, email, password_hash)
        VALUES ($1,$2,$3, $4)
        RETURNING id `,
      [name, lastName, email, hash],
    );

    const userId = result.rows[0].id;

    delete req.session.signupError;
    delete req.session.signupName;
    delete req.session.signupSurname;

    delete req.session.signupEmail;

    // return res.redirect("/login");
    return res.redirect("/successSignup");
  } catch (err) {
    console.error(err);
    req.session.signupError = "Signup error. Please try again.";
    req.session.signupName = name;
    req.session.signupSurname = lastName;
    req.session.signupEmail = email;
    return res.redirect("/signup");
  }
});

app.get("/successSignup", (req, res) => {
  return res.render("successSignup");
});

// app.get("/login", (req, res) => {
//   return renderLogin(res);
// });

// when logging in
app.post("/login", async (req, res) => {
  // check if credentials are correct
  // Entered credentials
  const email = req.body.email;
  const pswrd = req.body.password;

  try {
    // get the user from db
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    // if no user found
    if (result.rows.length === 0) {
      // Store the error and email in session so it can be shown after redirect
      req.session.loginError = "Invalid email or password.";
      req.session.loginEmail = email;
      return res.redirect("/login");
    }

    const user = result.rows[0];
    const userName = result.rows[0].name;
    const userId = result.rows[0].id;

    // compare password with hash
    const valid = await bcrypt.compare(pswrd, user.password_hash);

    if (!valid) {
      // Store the error&email in session so it can be shown after redirect
      req.session.loginError = "Invalid email or password.";
      req.session.loginEmail = email;
      return res.redirect("/login");
    }

    req.session.userId = userId;

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const day = date.getDate();
    const DaysOfMonths = [];

    for (let i = 0; i < 12; i++) {
      const numOfdays = new Date(year, i + 1, 0).getDate();
      DaysOfMonths.push(numOfdays);
    }

    // Login succeeded, so clear any old login error from the session
    delete req.session.loginError;
    delete req.session.loginEmail;

    req.session.userId = user.id;
    return res.redirect("/dashboard");

    // res.render("dashboard", {userName: userName, todayYear: year, todayMonth: month + 1, todayDay: day, DaysOfMonths: DaysOfMonths});
  } catch (err) {
    console.error(err);
    // Store a generic error message for unexpected failures
    req.session.loginError = "Something went wrong. Please try again.";
    req.session.loginEmail = email;
    return res.redirect("/login");
  }
});

app.get("/dashboard", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  const result = await db.query("SELECT name FROM users WHERE id = $1", [
    userId,
  ]);
  const userName = result.rows[0].name;

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const DaysOfMonths = [];
  for (let i = 0; i < 12; i++) {
    DaysOfMonths.push(new Date(year, i + 1, 0).getDate());
  }

  const moods = await db.query(
    "SELECT mood_color, mood_date, mood_name, period, tags, note FROM moods WHERE user_id = $1",
    [userId],
  );
  const moodData = moods.rows;

  // stats data
  // const days = 30;
  // const DAYS = req.session.days;
  const days = parseInt(req.query.days) || 30;
  console.log("DAYS: " + days);

  // fetch all mood entries for this user within the last 30 days, oldest first
  const statsMoods = await db.query(
    `SELECT mood_date, period, mood_name, mood_color, note, tags
     FROM moods
     WHERE user_id = $1
       AND mood_date >= CURRENT_DATE - INTERVAL '1 day' * $2
     ORDER BY mood_date ASC`,
    [userId, days],
  );
  const moodData_stats = statsMoods.rows;

  // fetch every distinct day the user has logged anything (all time, newest first)
  // Used to calculate the current streak
  const streakResult = await db.query(
    `SELECT DISTINCT DATE(mood_date) as d
     FROM moods WHERE user_id = $1
     ORDER BY d DESC`,
    [userId],
  );

  // count consecutive days going backwards from today
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < streakResult.rows.length; i++) {
    const d = new Date(streakResult.rows[i].d);
    const expected = new Date(today); // actual logged day

    expected.setDate(today.getDate() - i); // what day we expect (today, yesterday, etc.)

    if (d.toDateString() === expected.toDateString()) streak++;
    else break; //streak ends
  }

  const moodScore = { bad: 1, okay: 2, good: 3, great: 4, excellent: 5 };
  const moodName = {
    1: "Bad",
    2: "Okay",
    3: "Good",
    4: "Great",
    5: "Excellent",
  };

  // Count how many times each mood appears across all entries
  const moodCounts = { bad: 0, okay: 0, good: 0, great: 0, excellent: 0 };

  moodData_stats.forEach((m) => {
    if (moodCounts[m.mood_name] !== undefined) moodCounts[m.mood_name]++;
  });

  const total = moodData_stats.length || 1; // avoid division by zero

  // Convert counts to percentages eg [{ name: "good", pct: 35 }, ..]
  const moodBreakdown = Object.entries(moodCounts)
    .map(([name, count]) => ({
      name,
      pct: Math.round((count / total) * 100),
    }))
    .reverse();

  // for each time period, calculate the average mood score and how many entries exist
  const periodStats = ["morning", "afternoon", "evening"].map((period) => {
    const entries = moodData_stats.filter(
      (m) => m.period === period && moodScore[m.mood_name],
    );
    const avg = entries.length
      ? entries.reduce((sum, m) => sum + moodScore[m.mood_name], 0) /
        entries.length
      : 0;
    return {
      period,
      avgName: moodName[Math.round(avg)] || "—",
      entries: entries.length,
    };
  });

  // overall average mood across all periods and days
  const scored = moodData_stats.filter((m) => moodScore[m.mood_name]);
  const overallAvg = scored.length
    ? scored.reduce((s, m) => s + moodScore[m.mood_name], 0) / scored.length
    : 0;
  const averageMood = moodName[Math.round(overallAvg)] || "—";

  // Group entries by date to find best day and count logged days
  const byDay = {};

  moodData_stats.forEach((m) => {
    //keep only the date - read the date in local timezone
    const raw = new Date(m.mood_date);
    const d = `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, "0")}-${String(raw.getDate()).padStart(2, "0")}`;

    if (!byDay[d]) {
      //if this date doesn't exist in byDay yet, create an empty array for it
      byDay[d] = [];
    }

    byDay[d].push(moodScore[m.mood_name] || 0);
  });

  // Find the day with the highest average mood score
  let bestDay = "",
    bestScore = 0;

  Object.entries(byDay).forEach(([date, scores]) => {
    // add all scores together and divide by how many there are
    const total = scores.reduce((a, b) => a + b, 0);
    const avg = total / scores.length;

    // if this day's average is better than the current best, update it
    if (avg > bestScore) {
      bestScore = avg;
      bestDay = date;
    }
  });

  // Format "2026-05-09" -> "9 May"
  if (bestDay !== "") {
    const d = new Date(bestDay);
    bestDay = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  }

  // Total number of distinct days that have at least one entry
  const daysLogged = Object.keys(byDay).length;

  // Count how many times each tag appears across all entries
  const tagCount = {};

  moodData_stats.forEach((m) => {
    if (m.tags)
      m.tags.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
  });

  // Sort by frequency, take top 9
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)
    .map(([tag, count]) => ({ tag, count }));

  topTags.forEach((t) => console.log(`${t.tag}: ${t.count}`));

  // Build chart data: one mood score per period per day
  const chartData = {};

  moodData_stats.forEach((m) => {
    const raw = new Date(m.mood_date);
    const d = `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, "0")}-${String(raw.getDate()).padStart(2, "0")}`;

    if (!chartData[d]) chartData[d] = {};
    chartData[d][m.period] = moodScore[m.mood_name] || 0;
  });

  // Separate into three parallel arrays for Chart.js (one value per day)
  // null = no entry that day (Chart.js will leave a gap with spanGaps:true)
  const chartLabels = Object.keys(chartData).sort(); // x-axis dates
  const chartMorning = chartLabels.map((d) => chartData[d].morning ?? null); // y-axis morning
  const chartAfternoon = chartLabels.map((d) => chartData[d].afternoon ?? null); // y-axis afternoon
  const chartEvening = chartLabels.map((d) => chartData[d].evening ?? null); // y-axis evening

  // after building chartMorning, chartAfternoon, chartEvening
  const consistentMood = chartMorning.every(
    (v, i) => v === chartAfternoon[i] && v === chartEvening[i],
  );

  res.render("dashboard", {
    userName,
    todayYear: year,
    todayMonth: month + 1,
    todayDay: day,
    DaysOfMonths,
    moods: moodData,
    saved: req.query.saved,
    deleted: req.query.deleted,
    // error: req.query.error,
    // stats
    days,
    streak,
    daysLogged,
    averageMood,
    bestDay,
    moodBreakdown,
    periodStats,
    topTags,
    chartLabels: JSON.stringify(chartLabels),
    chartMorning: JSON.stringify(chartMorning),
    chartAfternoon: JSON.stringify(chartAfternoon),
    chartEvening: JSON.stringify(chartEvening),
    consistentMood,
  });
});

app.get("/statistics/data", requireLogin, async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const userId = req.session.userId;

  const statsMoods = await db.query(
    `SELECT mood_date, period, mood_name, mood_color, note, tags
     FROM moods
     WHERE user_id = $1
       AND mood_date >= CURRENT_DATE - INTERVAL '1 day' * $2
     ORDER BY mood_date ASC`,
    [userId, days],
  );
  const moodData_stats = statsMoods.rows;

  const streakResult = await db.query(
    `SELECT DISTINCT DATE(mood_date) as d
     FROM moods WHERE user_id = $1
     ORDER BY d DESC`,
    [userId],
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < streakResult.rows.length; i++) {
    const d = new Date(streakResult.rows[i].d);
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (d.toDateString() === expected.toDateString()) streak++;
    else break;
  }

  const moodScore = { bad: 1, okay: 2, good: 3, great: 4, excellent: 5 };
  const moodName = {
    1: "Bad",
    2: "Okay",
    3: "Good",
    4: "Great",
    5: "Excellent",
  };

  const moodCounts = { bad: 0, okay: 0, good: 0, great: 0, excellent: 0 };
  moodData_stats.forEach((m) => {
    if (moodCounts[m.mood_name] !== undefined) moodCounts[m.mood_name]++;
  });
  const total = moodData_stats.length || 1;
  const moodBreakdown = Object.entries(moodCounts)
    .map(([name, count]) => ({ name, pct: Math.round((count / total) * 100) }))
    .reverse();

  const periodStats = ["morning", "afternoon", "evening"].map((period) => {
    const entries = moodData_stats.filter(
      (m) => m.period === period && moodScore[m.mood_name],
    );
    const avg = entries.length
      ? entries.reduce((sum, m) => sum + moodScore[m.mood_name], 0) /
        entries.length
      : 0;
    return {
      period,
      avgName: moodName[Math.round(avg)] || "—",
      entries: entries.length,
    };
  });

  const scored = moodData_stats.filter((m) => moodScore[m.mood_name]);
  const overallAvg = scored.length
    ? scored.reduce((s, m) => s + moodScore[m.mood_name], 0) / scored.length
    : 0;
  const averageMood = moodName[Math.round(overallAvg)] || "—";

  const byDay = {};
  moodData_stats.forEach((m) => {
    const raw = new Date(m.mood_date);
    const d = `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, "0")}-${String(raw.getDate()).padStart(2, "0")}`;
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(moodScore[m.mood_name] || 0);
  });

  let bestDay = "",
    bestScore = 0;
  Object.entries(byDay).forEach(([date, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (avg > bestScore) {
      bestScore = avg;
      bestDay = date;
    }
  });
  if (bestDay !== "") {
    const d = new Date(bestDay);
    bestDay = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  }

  const daysLogged = Object.keys(byDay).length;

  const tagCount = {};
  moodData_stats.forEach((m) => {
    if (m.tags)
      m.tags.forEach((t) => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
  });
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)
    .map(([tag, count]) => ({ tag, count }));

  const chartData = {};
  moodData_stats.forEach((m) => {
    const raw = new Date(m.mood_date);
    const d = `${raw.getFullYear()}-${String(raw.getMonth() + 1).padStart(2, "0")}-${String(raw.getDate()).padStart(2, "0")}`;
    if (!chartData[d]) chartData[d] = {};
    chartData[d][m.period] = moodScore[m.mood_name] || 0;
  });

  const chartLabels = Object.keys(chartData).sort();
  const chartMorning = chartLabels.map((d) => chartData[d].morning ?? null);
  const chartAfternoon = chartLabels.map((d) => chartData[d].afternoon ?? null);
  const chartEvening = chartLabels.map((d) => chartData[d].evening ?? null);

  const consistentMood = chartMorning.every(
    (v, i) => v === chartAfternoon[i] && v === chartEvening[i],
  );

  res.json({
    days,
    streak,
    daysLogged,
    averageMood,
    bestDay,
    moodBreakdown,
    periodStats,
    topTags,
    chartLabels,
    chartMorning,
    chartAfternoon,
    chartEvening,
    consistentMood,
  });
});

app.post("/addJournalEntry", requireLogin, async (req, res) => {
  console.log("BIKA");
  const userId = req.session.userId;

  const colors = [];
  const moods = [];
  const notes = [];
  const tags = [];

  for (let i = 0; i < 3; i++) {
    colors.push(req.body["selectedcolor-" + i]);
    moods.push(req.body["selectedMood-" + i]);
    notes.push(req.body["notes-" + i]);
    tags.push(req.body["selectedTags-" + i]);
  }

  const periods = ["morning", "afternoon", "evening"];

  // for (let i = 0; i < 3; i++) {
  //   console.log("MOOD: " + moods[i]);
  //   if (!moods[i] || moods[i] === "" || moods[i] === "undefined") {
  //     return res.redirect("/dashboard?error=true");
  //   }
  // }

  let selectedDay = req.body.selectedDate;

  // it means that we are on the dashboard page when logged in and we haven't chosen a cell yet, but by default the "today's" cell is selected
  if (
    !selectedDay ||
    selectedDay === "" ||
    (Array.isArray(selectedDay) && selectedDay.every((d) => d === ""))
  ) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    selectedDay = `${year}-${month}-${day}`;
  }

  try {
    for (let i = 0; i < 3; i++) {
      const tagsArray = tags[i] ? tags[i].split(",") : []; // convert string to array

      await db.query(
        `INSERT INTO moods (user_id, mood_color, mood_name, note, tags, period, mood_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (user_id, mood_date, period) -- if a rows already exists for this user & date & period
         DO UPDATE SET  -- update only the data columns that follow
           mood_color = EXCLUDED.mood_color,
           mood_name  = EXCLUDED.mood_name,
           note       = EXCLUDED.note,
           tags       = EXCLUDED.tags,
           created_at = CURRENT_TIMESTAMP`,
        [
          userId,
          colors[i],
          moods[i],
          notes[i],
          tagsArray,
          periods[i],
          selectedDay,
        ],
      );
    }

    res.redirect("/dashboard?saved=true");
  } catch (err) {
    console.error("Error details:", err.message);
    console.error("Stack:", err.stack);
    console.error("Data sent:", {
      userId,
      colors,
      moods,
      notes,
      tags,
      periods,
    });
    res.send("Error saving mood: " + err.message);
  }
});

app.post("/deleteJournalEntry", requireLogin, async (req, res) => {
  const userId = req.session.userId;
  const selectedDay = req.body.selectedDate;

  // console.log("DAY TO BE DELETED: " + selectedDay);

  try {
    await db.query(
      `DELETE FROM moods
       WHERE user_id = $1
       AND mood_date = $2`,
      [userId, selectedDay],
    );

    res.redirect("/dashboard?deleted=true");
  } catch (err) {
    console.error(err);
    res.send("Error deleting entry");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }

    res.clearCookie("connect.sid"); // important
    res.redirect("/login");
  });
});

app.listen(port, () => {
  console.log("Server running on port 3000");
});
