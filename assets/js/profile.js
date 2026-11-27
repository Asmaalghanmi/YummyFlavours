document.addEventListener("DOMContentLoaded", async function () {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData) {
        window.location.href = "logInPage.html";
        return;
    }

    const nameElement = document.getElementById("userName");
    const usernameElement = document.getElementById("userHandle");
    const bioElement = document.getElementById("userBio");
    const avatarElement = document.getElementById("userInitials");
    const favGrid = document.getElementById("accountFavGrid");

    const roleElement = document.getElementById("userRole");
    if (roleElement) {
        roleElement.style.display = "none";
    }

    if (nameElement) {
        nameElement.textContent = userData.fname || userData.first_name || "";
    }

    if (usernameElement) {
        usernameElement.textContent = userData.username ? `@${userData.username}` : "";
    }

    if (bioElement) {
        bioElement.textContent = userData.bio || "No bio added yet.";
    }

    if (avatarElement) {
        const displayName = userData.username || userData.fname || userData.first_name || "?";
        avatarElement.textContent = displayName.charAt(0).toUpperCase();
    }

    if (favGrid) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/api/favorites/${userData.id}`);
            const recipes = await response.json();

            favGrid.innerHTML = "";

            if (recipes.length === 0) {
                favGrid.innerHTML = `
                    <p class="no-favs">No favorites yet. Start exploring!</p>

                    <a href="../recipes/Rpages/recipes.html" class="discover-box">
                        <i class="bi bi-plus"></i>
                        <p>Discover more recipes</p>
                    </a>
                `;
            } else {
                recipes.slice(0, 3).forEach(function (recipe) {
                    favGrid.innerHTML += `
                        <div class="small-card">
                            <h3>${recipe.recipe_name}</h3>

                            <img src="${recipe.recipe_image}" alt="${recipe.recipe_name}">

                            <a href="${recipe.recipe_url}" class="small-btn">
                                See Complete Recipe
                                <i class="bi bi-arrow-up-right-circle"></i>
                            </a>
                        </div>
                    `;
                });

                favGrid.innerHTML += `
                    <a href="../recipes/Rpages/recipes.html" class="discover-box">
                        <i class="bi bi-plus"></i>
                        <p>Discover more recipes</p>
                    </a>
                `;
            }
        } catch (error) {
            console.error("Error loading profile favorites:", error);
            favGrid.innerHTML = '<p class="no-favs">Error loading favorites.</p>';
        }
    }

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (event) {
            event.preventDefault();

            showProfileMessage("Logged out successfully.", "success");

            setTimeout(function () {
                localStorage.removeItem("user");
                window.location.href = "../index.html";
            }, 1500);
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