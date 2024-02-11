const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");

exports.sharedProfile = async (req, res, next) => {
  let isVisitorsProfile = false;
  let isFollowing = false;
  if (req.session.user) {
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id);
    isFollowing = await Follow.isVisitorFollowing(
      req.profileUser._id,
      req.visitorId
    );
  }

  req.isVisitorsProfile = isVisitorsProfile;
  req.isFollowing = isFollowing;
  // Retrieve post and follow count
  let postCountPromise = Post.countPostsByAuthor(req.profileUser._id);
  let followerCountPromise = Follow.countFollowersById(req.profileUser._id);
  let followingCountPromise = Follow.countFollowingById(req.profileUser._id);
  let [postCount, followerCount, followingCount] = await Promise.all([
    postCountPromise,
    followerCountPromise,
    followingCountPromise,
  ]);

  req.postCount = postCount;
  req.followerCount = followerCount;
  req.followingCount = followingCount;

  next();
};

exports.loggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in for this.");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.login = (req, res) => {
  let user = new User(req.body);
  user
    .login()
    .then((result) => {
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id,
      };
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((e) => {
      req.flash("errors", e);
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.register = (req, res) => {
  let user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id,
      };
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch((regErrors) => {
      regErrors.forEach((error) => {
        req.flash("regErrors", error);
      });
      req.session.save(() => {
        res.redirect("/");
      });
    });
};

exports.home = async (req, res) => {
  if (req.session.user) {
    // Fetch post feed
    let posts = await Post.getFeed(req.session.user._id);
    res.render("home-dashboard", { posts: posts });
  } else {
    res.render("home-guest", {
      regErrors: req.flash("regErrors"),
    });
  }
};

exports.ifUserExists = (req, res, next) => {
  User.findByUsername(req.params.username)
    .then((userDocument) => {
      req.profileUser = userDocument;
      next();
    })
    .catch(() => {
      res.render("404");
    });
};

exports.profilePostsScreen = (req, res) => {
  // Req post model for posts
  Post.findByAuthorId(req.profileUser._id)
    .then((posts) => {
      res.render("profile", {
        title: `${req.profileUser.username}`,
        currentPage: "posts",
        posts: posts,
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        isFollowing: req.isFollowing,
        isVisitorsProfile: req.isVisitorsProfile,
        counts: {
          postCount: req.postCount,
          followerCount: req.followerCount,
          followingCount: req.followingCount,
        },
      });
    })
    .catch(() => {
      res.render("404");
    });
};

exports.profileFollowScreen = async (req, res) => {
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id);
    res.render("profile-followers", {
      currentPage: "followers",
      followers: followers,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount,
      },
    });
  } catch {
    res.render("404");
  }
};

exports.profileFollowingScreen = async (req, res) => {
  try {
    let following = await Follow.getFollowingById(req.profileUser._id);
    res.render("profile-following", {
      currentPage: "following",
      following: following,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {
        postCount: req.postCount,
        followerCount: req.followerCount,
        followingCount: req.followingCount,
      },
    });
  } catch {
    res.render("404");
  }
};

exports.doesEmailExist = async (req, res) => {
  let emailBool = await User.doesEmailExist(req.body.email);
  res.json(emailBool);
};

exports.doesUsernameExist = (req, res) => {
  console.log("Checking existence for username:", req.body.username);
  User.findByUsername(req.body.username)
    .then((userDoc) => {
      if (userDoc) {
        // User found
        res.json(true);
      } else {
        // User not found
        res.json(false);
      }
    })
    .catch((error) => {
      console.error("Error checking username existence:", error);
      res
        .status(500)
        .send("An error occurred while checking username existence.");
    });
};
