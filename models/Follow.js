const { ObjectId } = require("mongodb");

const usersCollection = require("../db").db().collection("users");
const followsCollection = require("../db").db().collection("follows");

let Follow = function (followedUsername, authorId) {
  this.followedUsername = followedUsername;
  this.authorId = authorId;
  this.errors = [];
};

Follow.prototype.cleanUp = function () {
  if (typeof this.followedUsername != "string") {
    this.followedUsername = "";
  }
};

Follow.prototype.validate = async function (action) {
  // User must exist in database
  let followedAccount = await usersCollection.findOne({
    username: this.followedUsername,
  });
  if (followedAccount) {
    this.followedId = followedAccount._id;
  } else {
    this.errors.push("User does not exist.");
  }
  let followExists = await followsCollection.findOne({
    followedId: this.followedId,
    authorId: new ObjectId(this.authorId),
  });
  if (action == "create") {
    if (followExists) {
      this.errors.push("You are already following this user.");
    }
  }
  if (action == "delete") {
    if (!followExists) {
      this.errors.push("You are not following this user. Nothing to unfollow.");
    }
  }
};

Follow.prototype.create = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate("create");
    if (!this.errors.length) {
      await followsCollection.insertOne({
        followedId: this.followedId,
        authorId: new ObjectId(this.authorId),
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.prototype.delete = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    await this.validate("delete");
    if (!this.errors.length) {
      await followsCollection.deleteOne({
        followedId: this.followedId,
        authorId: new ObjectId(this.authorId),
      });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

Follow.isVisitorFollowing = async function (followedId, visitorId) {
  let followDoc = await followsCollection.findOne({
    followedId: followedId,
    authorId: new ObjectId(visitorId),
  });
  if (followDoc) {
    return true;
  } else {
    return false;
  }
};

module.exports = Follow;
