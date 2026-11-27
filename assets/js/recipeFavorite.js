document.addEventListener("DOMContentLoaded", function () {
    const favoriteButton = document.querySelector(".fav-btn");

    if (!favoriteButton) return;

    const heartIcon = favoriteButton.querySelector("i");
    const currentPath = window.location.pathname;
    const pageName = currentPath.substring(currentPath.lastIndexOf("/") + 1);

    let isFavorite = false;

    checkFavoriteStatus();

    favoriteButton.addEventListener("click", async function () {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.id) {
            showFavoriteMessage("Please log in first to add this recipe to favorites.", "error");

            setTimeout(function () {
                window.location.href = "../../account/logInPage.html";
            }, 1500);

            return;
        }

        if (isFavorite) {
            await removeFromFavorites(user.id, pageName);
        } else {
            await addToFavorites(user.id, pageName);
        }
    });

    async function checkFavoriteStatus() {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.id) {
            setInactiveHeart();
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/api/favorites/site/check?user_id=${encodeURIComponent(user.id)}&page_name=${encodeURIComponent(pageName)}`
            );

            const data = await response.json();

            if (response.ok && data.isFavorite) {
                isFavorite = true;
                setActiveHeart();
            } else {
                isFavorite = false;
                setInactiveHeart();
            }
        } catch (error) {
            console.error("Check favorite error:", error);
            isFavorite = false;
            setInactiveHeart();
        }
    }

    async function addToFavorites(userId, pageName) {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/favorites/site/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    page_name: pageName
                })
            });

            const data = await response.json();

            if (response.ok) {
                isFavorite = true;
                setActiveHeart();
                showFavoriteMessage(data.message || "Added to favorites.", "success");
            } else {
                showFavoriteMessage(data.message || "Could not add to favorites.", "error");

                if (response.status === 409) {
                    isFavorite = true;
                    setActiveHeart();
                }
            }
        } catch (error) {
            console.error("Favorite add error:", error);
            showFavoriteMessage("Cannot connect to the server.", "error");
        }
    }

    async function removeFromFavorites(userId, pageName) {
        try {
            const response = await fetch("http://127.0.0.1:5000/api/favorites/site/remove", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: userId,
                    page_name: pageName
                })
            });

            const data = await response.json();

            if (response.ok) {
                isFavorite = false;
                setInactiveHeart();
                showFavoriteMessage(data.message || "Removed from favorites.", "success");
            } else {
                showFavoriteMessage(data.message || "Could not remove from favorites.", "error");
            }
        } catch (error) {
            console.error("Favorite remove error:", error);
            showFavoriteMessage("Cannot connect to the server.", "error");
        }
    }

    function setActiveHeart() {
        favoriteButton.classList.add("active");

        if (heartIcon) {
            heartIcon.classList.remove("bi-heart");
            heartIcon.classList.add("bi-heart-fill");
        }
    }

    function setInactiveHeart() {
        favoriteButton.classList.remove("active");

        if (heartIcon) {
            heartIcon.classList.remove("bi-heart-fill");
            heartIcon.classList.add("bi-heart");
        }
    }
});

function showFavoriteMessage(text, type) {
    let notification = document.getElementById("favoriteNotification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "favoriteNotification";
        notification.className = "favorite-notification";
        document.body.appendChild(notification);
    }

    notification.textContent = text;
    notification.className = "favorite-notification show";

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