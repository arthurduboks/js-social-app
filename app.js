const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const markdown = require("marked");
const app = express();
const sanitizeHTML = require("sanitize-html");

const sessionOptions = {
  secret: "0d9a6e968ba0e5f65f4b2a9c55f57e9a6c7cfc737e8ddf98295bab35db25b280",
  store: MongoStore.create({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24, httpOnly: true },
};

app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  // Make marked available globally
  res.locals.filterHTML = (content) => {
    return sanitizeHTML(markdown.parse(content), {
      allowedTags: [
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "strong",
        "bold",
        "italic",
        "em",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
      ],
      allowedAttributes: {},
    });
  };
  // Make flash globally available
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");
  // Make current user id available on the req object
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }
  // Make user session date available within view
  res.locals.user = req.session.user;
  next();
});

const router = require("./router");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

app.use("/", router);

module.exports = app;
