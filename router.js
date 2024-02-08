const express = require("express");
const router = express.Router();
const userController = require("./controllers/userController");
const postController = require("./controllers/postController");
const followController = require("./controllers/followController");

// User routes
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Profile routes
router.get(
  "/profile/:username",
  userController.ifUserExists,
  userController.sharedProfile,
  userController.profilePostsScreen
);

router.get(
  "/profile/:username/followers",
  userController.ifUserExists,
  userController.sharedProfile,
  userController.profileFollowScreen
);

router.get(
  "/profile/:username/following",
  userController.ifUserExists,
  userController.sharedProfile,
  userController.profileFollowingScreen
);

// User posts
router.get(
  "/create-post",
  userController.loggedIn,
  postController.viewCreateScreen
);
router.post("/create-post", userController.loggedIn, postController.create);
router.get("/post/:id", postController.viewSingle);
router.get(
  "/post/:id/edit",
  userController.loggedIn,
  postController.viewEditScreen
);
router.post("/post/:id/edit", userController.loggedIn, postController.edit);
router.post("/post/:id/delete", userController.loggedIn, postController.delete);
router.post("/search", postController.search);

// Follow routes
router.post(
  "/addFollow/:username",
  userController.loggedIn,
  followController.addFollow
);

// Unfollow routes
router.post(
  "/removeFollow/:username",
  userController.loggedIn,
  followController.removeFollow
);

module.exports = router;
