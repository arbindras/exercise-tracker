const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// In-memory data storage
let users = [];
let exercises = [];

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toDateString();
};

// POST route to create a new user
app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const _id = Date.now().toString(); // Generating a simple _id
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

// GET route to get a list of all users
// GET route to get a list of all users
app.get("/api/users", (req, res) => {
  // Return the list of users, each object contains username and _id
  res.json(users.map((user) => ({ username: user.username, _id: user._id })));
});

// POST route to add an exercise to a user
app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;
  const user = users.find((user) => user._id == _id);

  if (!user) {
    return res.json({ error: "User not found" });
  }

  const exerciseDate = date ? formatDate(date) : formatDate(new Date());
  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate,
    _id: user._id,
  };

  exercises.push(newExercise);
  res.json({
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate,
    _id: user._id,
  });
});

// GET route to get a user's exercise log
app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;
  const user = users.find((user) => user._id == _id);

  if (!user) {
    return res.json({ error: "User not found" });
  }

  let userExercises = exercises.filter((exercise) => exercise._id == _id);

  // Date range filtering
  if (from) {
    const fromDate = new Date(from);
    userExercises = userExercises.filter(
      (exercise) => new Date(exercise.date) >= fromDate
    );
  }

  if (to) {
    const toDate = new Date(to);
    userExercises = userExercises.filter(
      (exercise) => new Date(exercise.date) <= toDate
    );
  }

  // Limit the number of logs
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id: user._id,
    log: userExercises.map(({ description, duration, date }) => ({
      description,
      duration,
      date,
    })),
  });
});

// Start the server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
