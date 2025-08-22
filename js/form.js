import { rtdb } from "../js/firebase.js";
  import { ref, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    const button = form.querySelector("button");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get form values
      const inputs = form.querySelectorAll('input[type="text"], input[type="email"], textarea');
      const firstName = inputs[0].value.trim();
      const lastName = inputs[1].value.trim();
      const email = inputs[2].value.trim();
      const message = inputs[3].value.trim();

      // Start sending animation
      button.disabled = true;
      let dots = 0;
      button.textContent = "Sending";
      const interval = setInterval(() => {
        dots = (dots + 1) % 4;
        button.textContent = "Sending" + ".".repeat(dots);
      }, 500);

      try {
        await push(ref(rtdb, "messages"), {
          firstName,
          lastName,
          email,
          message,
          timestamp: new Date().toISOString()
        });

        clearInterval(interval);
        button.textContent = "Sent!";
        button.classList.add("bg-green-600");

        // Success Toast
        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: "Your message has been successfully submitted.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });

        form.reset();
      } catch (error) {
        clearInterval(interval);
        button.textContent = "Send Message";

        // Error Toast
        Swal.fire({
          icon: "error",
          title: "Failed!",
          text: "Something went wrong. Please try again.",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }

      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Send Message";
        button.classList.remove("bg-green-600");
      }, 2000);
    });
  });