const contactForm = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

contactForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const gender = document.querySelector('input[name="gender"]:checked');
  const mobile = document.getElementById("mobile").value.trim();
  const dob = document.getElementById("dob").value;
  const email = document.getElementById("email").value.trim();
  const language = document.getElementById("language").value;
  const message = document.getElementById("message").value.trim();

  const namePattern = /^[A-Za-z\s]+$/;
  const mobilePattern = /^05[0-9]{8}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!namePattern.test(firstName)) {
    showMessage("First name must contain letters only.", "error");
    return;
  }

  if (!namePattern.test(lastName)) {
    showMessage("Last name must contain letters only.", "error");
    return;
  }

  if (!gender) {
    showMessage("Please select your gender.", "error");
    return;
  }

  if (!mobilePattern.test(mobile)) {
    showMessage("Mobile number must start with 05 and contain 10 digits.", "error");
    return;
  }

  if (dob === "") {
    showMessage("Please select your date of birth.", "error");
    return;
  }

  if (!emailPattern.test(email)) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  if (language === "") {
    showMessage("Please select your preferred language.", "error");
    return;
  }

  if (message.length < 10) {
    showMessage("Message must be at least 10 characters.", "error");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName,
        lastName,
        gender: gender.value,
        mobile,
        dob,
        email,
        language,
        message
      })
    });

    const data = await response.json();

    if (data.success) {
      showMessage("Your message has been sent successfully ", "success");
      contactForm.reset();
    } else {
      showMessage("Something went wrong. Please try again.", "error");
    }
  } catch (error) {
    showMessage("Cannot connect to the server.", "error");
  }
});

function showMessage(text, type) {
  const notification = document.getElementById("topNotification");

  if (!notification) {
    alert(text);
    return;
  }

  notification.textContent = text;
  notification.className = "top-notification show";

  if (type === "error") {
    notification.classList.add("error");
  }

  if (type === "success") {
    notification.classList.add("success");
  }

  setTimeout(() => {
    notification.classList.remove("show", "error", "success");
  }, 5000);
}