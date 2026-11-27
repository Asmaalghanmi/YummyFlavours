document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.getElementById("signupForm");

    if (signupForm) {
        signupForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const submitBtn = event.target.querySelector('button[type="submit"]');

            const fname = document.getElementById("fname").value.trim();
            const lname = document.getElementById("lname").value.trim();
            const username = document.getElementById("username").value.trim();
            const gender = document.getElementById("gender").value;
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (!fname || !lname || !username || !gender || !email || !password) {
                showAuthMessage("Please fill in all fields before submitting.", "error");
                return;
            }

            const userData = {
                fname,
                lname,
                username,
                gender,
                email,
                password
            };

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = "Processing...";
                }

                const response = await fetch("http://127.0.0.1:5000/api/auth/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json().catch(function () {
                    return { message: "Server error occurred." };
                });

                if (response.ok) {
                    showAuthMessage("Account created successfully.", "success");

                    setTimeout(function () {
                        window.location.href = "logInPage.html";
                    }, 1500);
                } else {
                    showAuthMessage(data.message || "An error occurred during signup.", "error");

                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Start Cooking!";
                    }
                }
            } catch (error) {
                console.error("Signup error:", error);
                showAuthMessage("Network error. Is your server running?", "error");

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Start Cooking!";
                }
            }
        });
    }

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const submitBtn = event.target.querySelector(".login-btn");
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (!email || !password) {
                showAuthMessage("Please enter both email and password.", "error");
                return;
            }

            try {
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerText = "Verifying...";
                }

                const response = await fetch("http://127.0.0.1:5000/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });

                const data = await response.json().catch(function () {
                    return { message: "Server error." };
                });

                if (response.ok) {
                    if (data.user) {
                        localStorage.setItem("user", JSON.stringify(data.user));
                        showAuthMessage("Login successful.", "success");

                        setTimeout(function () {
                            window.location.href = "account.html";
                        }, 1000);
                    } else {
                        showAuthMessage("Login error: account data was not received correctly.", "error");

                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerText = "Get Cooking";
                        }
                    }
                } else {
                    showAuthMessage(data.message || "Login failed.", "error");

                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Get Cooking";
                    }
                }
            } catch (error) {
                console.error("Login error:", error);
                showAuthMessage("Network error. Is your server running?", "error");

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Get Cooking";
                }
            }
        });
    }
});

function showAuthMessage(text, type) {
    let notification = document.getElementById("authNotification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "authNotification";
        notification.className = "auth-notification";
        document.body.appendChild(notification);
    }

    notification.textContent = text;
    notification.className = "auth-notification show";

    if (type === "success") {
        notification.classList.add("success");
    }

    if (type === "error") {
        notification.classList.add("error");
    }

    setTimeout(function () {
        notification.classList.remove("show", "success", "error");
        notification.textContent = "";
    }, 3000);
}