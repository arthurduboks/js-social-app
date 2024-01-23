const bcrypt = require("bcrypt");
const usersCollection = require("../db").collection("users");
const validator = require("validator");

let User = function (data) {
  this.data = data;
  this.errors = [];
};

User.prototype.cleanUp = function () {
  if (typeof this.data.username !== "string") {
    this.data.username = "";
  }
  if (typeof this.data.email !== "string") {
    this.data.email = "";
  }
  if (typeof this.data.password !== "string") {
    this.data.password = "";
  }
  // Remove other invalid props
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

User.prototype.validate = function () {
  if (this.data.username === "") {
    this.errors.push("Username is required");
  }
  if (
    this.data.username != "" &&
    !validator.isAlphanumeric(this.data.username)
  ) {
    this.errors.push("Username must be alphanumeric");
  }
  if (!validator.isEmail(this.data.email)) {
    this.errors.push("Email is required");
  }
  if (this.data.password === "") {
    this.errors.push("Password is required");
  }
  if (this.data.password.length > 0 && this.data.length < 12) {
    this.errors.push("Password must be at least 12 characters");
  }
  if (this.data.password.length > 50) {
    this.errors.push("Password is too long");
  }
  if (this.data.username.length > 0 && this.data.length < 3) {
    this.errors.push("Username must be at least 3 characters");
  }
  if (this.data.password.length > 50) {
    this.errors.push("Username is too long");
  }
};

User.prototype.login = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    const loginUser = await usersCollection.findOne({
      username: this.data.username,
    });
    if (
      loginUser &&
      bcrypt.compareSync(this.data.password, loginUser.password)
    ) {
      resolve("Welcome back!");
    } else {
      reject("Invalid username and password");
    }
  });
};

User.prototype.register = function () {
  // Validate user data
  this.cleanUp();
  this.validate();
  // If there are no val err
  if (!this.errors.length) {
    // Hash password
    let salt = bcrypt.genSaltSync(10);
    this.data.password = bcrypt.hashSync(this.data.password, salt);
    usersCollection.insertOne(this.data);
  }

  // Save the user data
};

module.exports = User;
