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

app.set("view engine", "ejs");  ///Tell Express to use EJS as the template engine for rendering views. In order not to use '.ejs' in the render functionality.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,              // dont resave unchanged session
    saveUninitialized: false,   // dont create empty sessions
    cookie: { secure: false }   // true only in HTTPS
}));

function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect("/login");
    }
    next();
}

app.get("/", (req, res) => {
    //res.send("Mood Tracker Running");
    res.render("login");
});

// get signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// on sumbit click on singup page
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // check if user already exists
        const existing = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existing.rows.length > 0) {
            return res.send("Email already registered");
        }

        // hash password
        const hash = await bcrypt.hash(password, 10);

        // insert user
        const result = await db.query(
            `INSERT INTO users (name, email, password_hash)
            VALUES ($1,$2,$3)
            RETURNING id`,
            [name, email, hash]
        );

        const userId = result.rows[0].id;

        res.redirect("/login");

    } catch (err) {
        console.error(err);
        res.send("Signup error");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

// when logging in
app.post("/login", async (req, res) => {

    // check if credentials are correct
    // Entered credentials
    const email = req.body.email;
    const pswrd = req.body.password;

    try {
        // get the user from db
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1", [email]
        );
        
        // if no user found
        if(result.rows.length === 0){
            return res.send("user not found!");
        }

        const user = result.rows[0];
        const userName = result.rows[0].name;
        const userId = result.rows[0].id;

        // compare password with hash
        const valid = await bcrypt.compare(pswrd, user.password_hash);

        if (!valid) {
            return res.send("Incorrect password");
        }

        req.session.userId = userId;

        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();  // 0-11
        const day = date.getDate();
        const DaysOfMonths = [];

        for(let i = 0; i < 12; i++){
            const numOfdays = new Date(year, i + 1, 0).getDate();
            DaysOfMonths.push(numOfdays);
        }

        res.redirect("/dashboard");

        // res.render("dashboard", {userName: userName, todayYear: year, todayMonth: month + 1, todayDay: day, DaysOfMonths: DaysOfMonths});

    } catch (err) {
        console.error(err);
        res.send("Server error");
    }
});

app.get("/dashboard", requireLogin, async (req, res) => {
    const userId = req.session.userId;

    const result = await db.query(
        "SELECT name FROM users WHERE id = $1",
        [userId]
    );

    const moods = await db.query(
        "SELECT mood_color, mood_date FROM moods WHERE user_id = $1",
        [userId]
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
        moods: moodData
    });


});

app.post("/addMood", requireLogin, async (req, res) => {

    const userId = req.session.userId;
    const color = req.body.selectedcolor;
    const mood = req.body.selectedMood;
    const note = req.body.notes;

    try {

        await db.query(
            `INSERT INTO moods (user_id, mood_color, mood_name, note, mood_date)
            VALUES ($1,$2,$3,$4,CURRENT_DATE)
            ON CONFLICT (user_id, mood_date)
            DO UPDATE SET
                mood_color = EXCLUDED.mood_color,
                mood_name  = EXCLUDED.mood_name,
                note       = EXCLUDED.note,
                created_at = CURRENT_TIMESTAMP`,
            [userId, color, mood, note]
        );

        res.redirect("/dashboard");

    } catch (err) {
        console.error(err);
        res.send("Error saving mood");
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