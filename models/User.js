const validator = require("validator");

let User = function (data) {
  this.data = data;
  this.errors = [];
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

User.prototype.register = function () {
  // Validate user data
  this.validate();
  // If there are no val err
  // Save the user data
};

module.exports = User;
