const postsCollection = require("../db").db().collection("posts");

let Post = function (data) {
  this.data = data;
  this.errors = [];
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
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    createdData: new Date(),
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
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.errors.push("Please try again later.");
          reject(this.errors);
        });
      resolve();
    } else {
      reject(this.errors);
    }
  });
};

module.exports = Post;
