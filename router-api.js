const apiRouter = require("express").Router();

apiRouter.post("/login", (req, res) => {
  res.json("API login.");
});

module.exports = apiRouter;
