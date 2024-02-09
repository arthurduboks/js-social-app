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
    this.usernameInitial();
    clearTimeout(this.username.timer);
    this.username.timer = setTimeout(() => this.usernameDelay(), 800);
  }

  usernameInitial() {
    console.log("Initial ran.");
  }

  usernameDelay() {
    alert("Delay ran.");
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
