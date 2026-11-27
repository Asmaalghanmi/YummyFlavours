document.addEventListener("DOMContentLoaded", function () {
    hideDiscoverIfLoggedIn();
    loadRandomNewRecipes();
    setupRecipeForm();
});

function hideDiscoverIfLoggedIn() {
    const user = JSON.parse(localStorage.getItem("user"));
    const discoverSection = document.getElementById("discoverSection");

    if (user && user.id && discoverSection) {
        discoverSection.style.display = "none";
    }
}

async function loadRandomNewRecipes() {
    const newRecipesContainer = document.getElementById("newRecipesContainer");

    if (!newRecipesContainer) return;

    try {
        const response = await fetch("http://127.0.0.1:5000/api/site-recipes/random");

        if (!response.ok) {
            throw new Error("Failed to fetch random recipes.");
        }

        const recipes = await response.json();

        newRecipesContainer.innerHTML = "";

        recipes.forEach(function (recipe) {
            newRecipesContainer.innerHTML += `
                <article class="food-card">
                    <h2>${recipe.recipe_title}</h2>

                    <img src="${recipe.recipe_image}" alt="${recipe.recipe_title}">

                    <a href="${recipe.recipe_url}" class="recipe-btn">
                        See Complete Recipe
                        <i class="bi bi-arrow-up-right-circle"></i>
                    </a>
                </article>
            `;
        });
    } catch (error) {
        console.error("Random recipes error:", error);

        newRecipesContainer.innerHTML = `
            <p class="no-favs">Cannot load random recipes from server.</p>
        `;
    }
}

function setupRecipeForm() {
    const recipeForm = document.getElementById("recipeForm");
    const submitBtn = recipeForm ? recipeForm.querySelector('button[type="submit"]') : null;

    if (!recipeForm) return;

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Login First";
        }
    }

    recipeForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !user.id) {
            showMessage("Please log in first to submit a recipe.", "error");
            return;
        }

        const recipeTitle = document.getElementById("recipeTitle").value.trim();
        const category = document.getElementById("category").value;
        const minutes = document.getElementById("minutes").value.trim();
        const description = document.getElementById("description").value.trim();
        const photo = document.getElementById("photo").files[0];

        const titlePattern = /^[A-Za-z0-9\s&'-]+$/;
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

        if (!titlePattern.test(recipeTitle)) {
            showMessage("Recipe title contains invalid characters.", "error");
            return;
        }

        if (category === "") {
            showMessage("Please select a category.", "error");
            return;
        }

        if (minutes === "" || isNaN(minutes) || Number(minutes) < 1) {
            showMessage("Minutes must be a valid positive number.", "error");
            return;
        }

        if (description.length < 10) {
            showMessage("Description must be at least 10 characters.", "error");
            return;
        }

        if (!photo) {
            showMessage("Please upload a recipe photo.", "error");
            return;
        }

        if (!allowedTypes.includes(photo.type)) {
            showMessage("Photo must be JPG, JPEG, or PNG.", "error");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/api/recipes/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_title: recipeTitle,
                    category,
                    minutes,
                    description,
                    photo_name: photo.name
                })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage("Recipe submitted successfully!", "success");
                recipeForm.reset();
            } else {
                showMessage(data.message || "Something went wrong.", "error");
            }
        } catch (error) {
            showMessage("Cannot connect to the server.", "error");
        }
    });
}

function showMessage(text, type) {
    const notification = document.getElementById("recipeMessage");

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
        notification.textContent = "";
    }, 5000);
}