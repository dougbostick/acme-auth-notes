const express = require("express");
const app = express();
app.use(express.json());
const {
  models: { User, Notes },
} = require("./db");
const path = require("path");

app.use("/dist", express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/auth", async (req, res, next) => {
  try {
    console.log("auth req.body", req.body);
    // const user = await User.byToken(req.headers.authorization);
    // console.log("user", user);
    res.send(await User.byToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/notes", async (req, res, next) => {
  try {
    const user = await User.byToken(req.headers.authorization);
    const notes = await Notes.findAll({
      where: {
        userId: user.id,
      },
    });
    // console.log("notes", notes);
    res.send(notes);
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/notes/:id", async (req, res, next) => {
  try {
    const target = await Notes.findByPk(parseInt(req.params.id));
    target.destroy();
    res.send(204);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/notes", async (req, res, next) => {
  console.log("req", req.headers, req.body.text);

  try {
    const note = req.body.text;
    const user = await User.byToken(req.headers.authorization);
    console.log("notes post user", user);
    const newNote = await Notes.create({ text: note, userId: user.id });
    console.log("NEWNOTE", newNote);
    res.status(201).send(newNote);
  } catch (ex) {
    next(ex);
  }
});

// app.get("/api/purchases", async (req, res, next) => {
//   try {
//     const user = await User.byToken(req.headers.authorization);
//     res.send("TODO Send the purchases for this user");
//   } catch (ex) {
//     next(ex);
//   }
// });

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send({ error: err.message });
});

module.exports = app;
