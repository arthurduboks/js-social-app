const postsCollection = require("../db").db().collection("posts");
const followsCollection = require("../db").db().collection("follows");
const ObjectId = require("mongodb").ObjectId;
const User = require("./User");
const sanitizeHTML = require("sanitize-html");

let Post = function (data, userid, requestedPostId) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
  this.requestedPostId = requestedPostId;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") {
    this.data.title == "";
  }
  if (typeof this.data.body != "string") {
    this.data.body == "";
  }
  // Clean up invalid data
  this.data = {
    title: sanitizeHTML(this.data.title.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    body: sanitizeHTML(this.data.body.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    createdDate: new Date(),
    author: new ObjectId(this.userid),
  };
};

Post.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("Title cannot be blank.");
  }
  if (this.data.body == "") {
    this.errors.push("Content cannot be blank.");
  }
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      // Save post into DB
      postsCollection
        .insertOne(this.data)
        .then((info) => {
          resolve(info.insertedId);
        })
        .catch(() => {
          this.errors.push("Please try again later.");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

Post.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userid);
      if (post.isVisitorOwner) {
        // actually update the db
        let status = await this.updateDB();
        resolve(status);
      } else {
        reject();
      }
    } catch {
      reject();
    }
  });
};

Post.prototype.updateDB = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      await postsCollection.findOneAndUpdate(
        {
          _id: new ObjectId(this.requestedPostId),
        },
        {
          $set: { title: this.data.title, body: this.data.body },
        }
      );
      resolve("success");
    } else {
      reject("failure");
    }
  });
};

Post.reusablePostQuery = function (
  uniqueOperations,
  visitorId,
  finalOperations = []
) {
  return new Promise(async function (resolve, reject) {
    let aggOperations = uniqueOperations
      .concat([
        {
          $lookup: {
            from: "users",
            localField: "author",
            foreignField: "_id",
            as: "authorDocument",
          },
        },
        {
          $project: {
            title: 1,
            body: 1,
            createdDate: 1,
            authorId: "$author",
            author: { $arrayElemAt: ["$authorDocument", 0] },
          },
        },
      ])
      .concat(finalOperations);

    let posts = await postsCollection.aggregate(aggOperations).toArray();

    // Clean up author property
    posts = posts.map((post) => {
      post.isVisitorOwner = post.authorId.equals(visitorId);
      post.authorId = undefined;

      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar,
      };
      return post;
    });
    resolve(posts);
  });
};

Post.findSingleById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != "string" || !ObjectId.isValid(id)) {
      reject();
      return;
    }
    let posts = await Post.reusablePostQuery(
      [{ $match: { _id: new ObjectId(id) } }],
      visitorId
    );

    if (posts.length) {
      console.log(posts[0]);
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([
    { $match: { author: authorId } },
    { $sort: { createdDate: -1 } },
  ]);
};

Post.delete = function (postIdToDelete, currentUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(postIdToDelete, currentUserId);
      if (post.isVisitorOwner) {
        await postsCollection.deleteOne({
          _id: new ObjectId(postIdToDelete),
        });
        resolve();
      } else {
        reject();
      }
    } catch (error) {
      reject();
    }
  });
};

Post.search = function (searchTerm) {
  return new Promise(async (resolve) => {
    if (typeof (searchTerm == "string")) {
      let posts = await Post.reusablePostQuery(
        [{ $match: { $text: { $search: searchTerm } } }],
        undefined,
        [{ $sort: { score: { $meta: "textScore" } } }]
      );
      resolve(posts);
    } else {
      reject();
    }
  });
};

Post.countPostsByAuthor = function (id) {
  return new Promise(async (resolve, reject) => {
    let postCount = await postsCollection.countDocuments({
      author: id,
    });
    resolve(postCount);
  });
};

Post.getFeed = async function (id) {
  // Create an array of the user ids
  let followedUsers = await followsCollection
    .find({ authorId: new ObjectId(id) })
    .toArray();
  followedUsers = followedUsers.map(function (followDoc) {
    return followDoc.followedId;
  });

  // Look for posts
  return Post.reusablePostQuery([
    { $match: { author: { $in: followedUsers } } },
    { $sort: { createdDate: -1 } },
  ]);
};

module.exports = Post;
