export default class RegistrationForm {
  constructor() {
    this.allFields = document.querySelectorAll(
      "#registration-form .form-control"
    );
    this.insertValidation();
    this.username = document.querySelector("#username-register");
    this.username.previousValue = "";
    this.events();
  }
  // Events
  events() {
    this.username.addEventListener("keyup", () => {
      this.isDifferent(this.username, this.usernameHandler);
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
        "Username must be at least 5 characters. "
      );
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
