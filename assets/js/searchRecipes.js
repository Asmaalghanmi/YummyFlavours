document.addEventListener("DOMContentLoaded", function () {
    const recipesContainer = document.getElementById("searchResults");
    const searchInput = document.getElementById("recipeSearch");
    const categoryFilter = document.getElementById("categoryFilter");

    if (!recipesContainer || !searchInput) return;

    async function loadSearchResults() {
        const search = searchInput.value.trim();
        const category = categoryFilter ? categoryFilter.value : "";

        // Important:
        // Do not show recipes if the search box is empty,
        // even if the user selected a category.
        if (search === "") {
            recipesContainer.innerHTML = `<p class="no-favs">Search for a recipe or ingredient.</p>`;
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/api/site-recipes?search=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}`
            );

            if (!response.ok) {
                throw new Error("Server response failed.");
            }

            const recipes = await response.json();

            recipesContainer.innerHTML = "";

            if (recipes.length === 0) {
                recipesContainer.innerHTML = `<p class="no-favs">No recipes found.</p>`;
                return;
            }

            recipes.forEach(function (recipe) {
                recipesContainer.innerHTML += `
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
            console.error("Search error:", error);
            recipesContainer.innerHTML = `
                <p class="no-favs">
                    Cannot load search results from server.
                </p>
            `;
        }
    }

    searchInput.addEventListener("input", loadSearchResults);

    if (categoryFilter) {
        categoryFilter.addEventListener("change", loadSearchResults);
    }

    recipesContainer.innerHTML = `<p class="no-favs">Search for a recipe or ingredient.</p>`;
});