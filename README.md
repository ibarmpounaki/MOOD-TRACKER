# Mood Tracker

A web-based mood tracker for logging how you feel throughout the day and spotting patterns between your mood and your daily habits.

> **Work in progress.** This is a personal project I'm actively building and refining.

## Why I built this

The idea came from a personal need. I wanted to track my mood and understand whether my daily habits were affecting how I felt.

I was also inspired by _Atomic Habits_, which got me interested in tracking small daily habits and looking at their long-term effects. This app is my attempt to make that easy: log a little each day, and over time see what actually makes a difference.

I'm building it to practice frontend development, with a strong focus on UX: keeping the interface simple, clear, and useful as it grows. I'm working on the whole process myself, from the initial idea and UX decisions to the finished application.

## Features

- **Account system**: sign up and log in to keep your journal private.
- **Three entries a day**: separate sections for **morning**, **afternoon**, and **evening**.
- **Notes**: write freely about how each part of your day went.
- **Mood colors**: pick from a five-step color scale (bad → excellent) to represent your mood.
- **Habit tags**: tag each entry with habits or activities, such as _Exercised_, _Meditated_, _Read_, or _No Screens_.
- **Browse past days**: move between days to view, edit, or delete entries.
- **Statistics**: view your mood and habits over the last **7 days** or **30 days**.
- **Responsive design**: works on desktop and mobile, with layout adjustments for smaller screens such as a tags dropdown and a calendar drawer.

## The goal

Over time, you should be able to look back at your mood and habits across a day, week, month, or year, and hopefully identify patterns, such as whether the days you sleep well or skip screens in the evening tend to be better days.

## Tech stack

- **Frontend:** HTML, CSS, JavaScript, EJS templates
- **Backend:** Node.js / Express
- **Icons:** Tabler Icons

## Getting started

```bash
# clone the repository
git clone <repository-url>
cd mood-tracker

# install dependencies
npm install

# set up the database
# create a PostgreSQL database and add your connection details to a .env file

# start the app
npm run dev

Then open `http://localhost:3000` in your browser.
```

## Roadmap

- [ ] Weekly, monthly, and yearly views of mood and habits
- [ ] Insights connecting habits to mood over time
- [ ] Custom tags
- [ ] Further UX refinements based on daily use

## Author

Built by **Ioanna Barmpounaki**: [GitHub](https://github.com/ibarmpounaki) · [LinkedIn](https://www.linkedin.com/in/ioanna-barmpounaki-4515b7164/)
