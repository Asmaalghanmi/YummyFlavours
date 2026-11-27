document.addEventListener("DOMContentLoaded", function () {
    const editForm = document.getElementById("editProfileForm");
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData) {
        window.location.href = "logInPage.html";
        return;
    }

    const nameInput = document.getElementById("editFname");
    const usernameInput = document.getElementById("editUsername");
    const bioInput = document.getElementById("editBio");

    if (nameInput) nameInput.value = userData.fname || "";
    if (usernameInput) usernameInput.value = userData.username || "";
    if (bioInput) bioInput.value = userData.bio || "";

    if (editForm) {
        editForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const updatedData = {
                id: userData.id,
                fname: nameInput.value.trim(),
                username: usernameInput.value.trim(),
                bio: bioInput.value.trim()
            };

            try {
                const response = await fetch("http://127.0.0.1:5000/api/user/update", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(updatedData)
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    showProfileMessage("Profile updated successfully.", "success");

                    setTimeout(function () {
                        window.location.href = "account.html";
                    }, 1500);
                } else {
                    showProfileMessage(data.message || "Update failed.", "error");
                }
            } catch (error) {
                console.error("Update error:", error);
                showProfileMessage("Connection error. Is your server running?", "error");
            }
        });
    }
});

function showProfileMessage(text, type) {
    let notification = document.getElementById("profileNotification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "profileNotification";
        notification.className = "profile-notification";
        document.body.appendChild(notification);
    }

    notification.textContent = text;
    notification.className = "profile-notification show";

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