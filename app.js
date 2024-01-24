const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const app = express();

const sessionOptions = {
  secret: "0d9a6e968ba0e5f65f4b2a9c55f57e9a6c7cfc737e8ddf98295bab35db25b280",
  store: MongoStore.create({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
};

app.use(session(sessionOptions));
app.use(flash());

const router = require("./router");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
