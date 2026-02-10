import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "123456",
  port: 5432,
});
db.connect();

app.set("view engine", "ejs");  ///Tell Express to use EJS as the template engine for rendering views. In order not to use '.ejs' in the render functionality.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/", (req, res) => {
  //res.send("Mood Tracker Running");
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.redirect("/");
});

app.post("/login", (req, res) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();  // 0-11
    const day = date.getDate();

    const DaysOfMonths = [];

    for(let i = 0; i < 12; i++){
        const numOfdays = new Date(year, i + 1, 0).getDate();
        DaysOfMonths.push(numOfdays);
    }

    res.render("dashboard", {todayYear: year, todayMonth: month + 1, todayDay: day, DaysOfMonths: DaysOfMonths});
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});