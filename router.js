const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");

// User routes
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Profile routes
router.get(
  "/profile/:username",
  userController.ifUserExists,
  userController.profilePostsScreen
);

// User posts
router.get(
  "/create-post",
  userController.loggedIn,
  postController.viewCreateScreen
);
router.post("/create-post", userController.loggedIn, postController.create);
router.get("/post/:id", postController.viewSingle);
router.get("/post/:id/edit", postController.viewEditScreen);
router.post("/post/:id/edit", postController.edit);

module.exports = router;
