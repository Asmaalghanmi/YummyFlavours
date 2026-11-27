document.addEventListener('DOMContentLoaded', async () => {
    const favContainer = document.getElementById('favoritesContainer');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const userData = JSON.parse(localStorage.getItem('user'));
    
    let allFavorites = []; // Store all recipes here for filtering locally

    if (!userData || !userData.id) {
        alert("Please log in to see your favorites!");
        window.location.href = 'logInPage.html';
        return;
    }

    // Function to draw cards on the screen
    const renderRecipes = (recipes) => {
        if (recipes.length === 0) {
            favContainer.innerHTML = '<p class="no-favs">No recipes found in this category.</p>';
        } else {
            favContainer.innerHTML = '';
            recipes.forEach(recipe => {
                const card = `
                    <div class="fav-card" data-category="${recipe.category}">
                        <h2>${recipe.recipe_name}</h2>
                        <div class="fav-card-image">
                            <img src="${recipe.recipe_image}" alt="${recipe.recipe_name}">
                        </div>
                        <a href="${recipe.recipe_url}" class="fav-card-btn">
                            See Complete Recipe
                            <i class="bi bi-arrow-up-right-circle"></i>
                        </a>
                    </div>
                `;
                favContainer.innerHTML += card;
            });
        }
    };

    // 1. Initial Fetch
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/favorites/${userData.id}`);
        allFavorites = await response.json();
        renderRecipes(allFavorites);
    } catch (err) {
        console.error("Error loading favorites:", err);
        favContainer.innerHTML = '<p>Error loading your favorites.</p>';
    }

    // 2. Filter Button Logic
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all and add to clicked
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.textContent.trim();

            if (category === "All Recipes") {
                renderRecipes(allFavorites);
            } else {
                // Filter the list based on the button text
                const filtered = allFavorites.filter(recipe => 
                    recipe.category.toLowerCase() === category.toLowerCase()
                );
                renderRecipes(filtered);
            }
        });
    });
});