import axios from "axios";

export default class RegistrationForm {
  constructor() {
    this.allFields = document.querySelectorAll(
      "#registration-form .form-control"
    );
    this.insertValidation();
    this.username = document.querySelector("#username-register");
    this.username.previousValue = "";
    this.email = document.querySelector("#email-register");
    this.email.previousValue = "";
    this.events();
  }
  // Events
  events() {
    this.username.addEventListener("keyup", () => {
      this.isDifferent(this.username, this.usernameHandler);
    });
    this.email.addEventListener("keyup", () => {
      this.isDifferent(this.email, this.emailHandler);
    });
  }

  // Methods
  isDifferent(el, handler) {
    if (el.previousValue != el.value) {
      handler.call(this);
    }
    el.previousValue = el.value;
  }

  usernameHandler() {
    this.username.errors = false;
    this.usernameInitial();
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(() => this.usernameDelay(), 800);
  }

  emailHandler() {
    this.email.errors = false;
    clearTimeout(this.email.timer);
    this.email.timer = setTimeout(() => this.emailAfterDelay(), 800);
  }

  async emailAfterDelay() {
    if (!/^\S+@\S+$/.test(this.email.value)) {
      this.showValidationErr(this.email, "Invalid e-mail address.");
      return;
    }
    try {
      const currentEmailValue = this.email.value; // Capture the current value
      const response = await axios.post("/doesEmailExist", {
        email: currentEmailValue,
      });
      if (response.data && this.email.value === currentEmailValue) {
        // Direct comparison to current value
        this.showValidationErr(this.email, "This e-mail is already in use.");
      } else {
        this.hideValidationErr(this.email);
      }
    } catch (error) {
      console.log("Something went wrong.", error);
    }
  }

  usernameInitial() {
    if (
      this.username.value != "" &&
      !/^([a-zA-Z0-9])+$/.test(this.username.value)
    ) {
      this.showValidationErr(
        this.username,
        "Username can only contain letters and numbers."
      );
    }

    if (this.username.value.length > 30) {
      this.showValidationErr(
        this.username,
        "Username can not exceed 30 characters."
      );
    }

    if (!this.username.errors) {
      this.hideValidationErr(this.username);
    }
  }

  hideValidationErr(el) {
    el.nextElementSibling.classList.remove("liveValidateMessage--visible");
  }

  showValidationErr(el, message) {
    el.nextElementSibling.innerHTML = message;
    el.nextElementSibling.classList.add("liveValidateMessage--visible");
    el.errors = true;
  }

  usernameDelay() {
    if (this.username.value.length < 5) {
      this.showValidationErr(
        this.username,
        "Username must be at least 5 characters."
      );
    }

    if (!this.username.errors) {
      axios
        .post("/doesUsernameExist", { username: this.username.value })
        .then((response) => {
          if (response.data) {
            this.showValidationErr(
              this.username,
              "This username is already taken."
            );
            this.username.isUnique = false;
          } else {
            this.username.isUnique = true;
          }
        })
        .catch(() => {
          console.log("Please try again later.");
        });
    }
  }

  insertValidation(el) {
    this.allFields.forEach((el) => {
      el.insertAdjacentHTML(
        "afterend",
        '<div class="alert alert-danger small liveValidateMessage"></div>'
      );
    });
  }
}
