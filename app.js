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

function renderLogin(res, options = {}) {
  return res.render("login", {
    error: null,
    email: "",
    ...options,
  });
}

function renderSignup(res, options = {}) {
  return res.render("signup", {
    error: null,
    name: "",
    email: "",
    ...options,
  });
}

app.get("/", (req, res) => {
  //res.send("Mood Tracker Running");
  return renderLogin(res);
});

// get signup page
app.get("/signup", (req, res) => {
  return renderSignup(res);
});

// on sumbit click on singup page
app.post("/signup", async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    // check if user already exists
    const existing = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      return renderSignup(res, {
        error: "Email already registered.",
        name,
        email,
      });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // insert user
    const result = await db.query(
      ` INSERT INTO users (name, email, password_hash)
        VALUES ($1,$2,$3)
        RETURNING id `,
      [name, email, hash],
    );

    const userId = result.rows[0].id;

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    return renderSignup(res, {
      error: "Signup error. Please try again.",
      name,
      email,
    });
  }
});

// app.get("/login", (req, res) => {
//   return renderLogin(res);
// });

app.get("/login", (req, res) => {
  // Read the current login error from the session, if one exists
  const error = req.session.loginError || null;

  // Render the login page and pass the error message to EJS
  res.render("login", {
    error,
    email: "",
  });
});

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
      // Store the error in session so it can be shown after redirect
      req.session.loginError = "Invalid email or password.";
      return res.redirect("/login");
    }

    const user = result.rows[0];
    const userName = result.rows[0].name;
    const userId = result.rows[0].id;

    // compare password with hash
    const valid = await bcrypt.compare(pswrd, user.password_hash);

    if (!valid) {
      // Store the error in session so it can be shown after redirect
      req.session.loginError = "Invalid email or password.";
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

    req.session.userId = user.id;
    return res.redirect("/dashboard");

    // res.render("dashboard", {userName: userName, todayYear: year, todayMonth: month + 1, todayDay: day, DaysOfMonths: DaysOfMonths});
  } catch (err) {
    console.error(err);
    // Store a generic error message for unexpected failures
    req.session.loginError = "Something went wrong. Please try again.";
    return res.redirect("/login");
  }
});

app.get("/dashboard", requireLogin, async (req, res) => {
  const userId = req.session.userId;

  const result = await db.query("SELECT name FROM users WHERE id = $1", [
    userId,
  ]);

  const moods = await db.query(
    "SELECT mood_color, mood_date, mood_name, period, tags, note FROM moods WHERE user_id = $1",
    [userId],
  );

  const moodData = moods.rows;

  const userName = result.rows[0].name;

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const DaysOfMonths = [];
  for (let i = 0; i < 12; i++) {
    DaysOfMonths.push(new Date(year, i + 1, 0).getDate());
  }

  res.render("dashboard", {
    userName,
    todayYear: year,
    todayMonth: month + 1,
    todayDay: day,
    DaysOfMonths,
    moods: moodData,
  });
});

app.post("/addMood", requireLogin, async (req, res) => {
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
  const selectedDate = req.body.selectedDate;

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
          selectedDate,
        ],
      );
    }

    res.redirect("/dashboard");
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

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

app.listen(port, () => {
  console.log("Server running on port 3000");
});
