document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GLOBAL AUTH UI ---
    // Change the profile icon or navigation based on login status
    const token = localStorage.getItem('token');
    const profileActions = document.querySelector('.actions');

    if (token && profileActions) {
        // You could change the person icon to the user's initials, for example
        // or add a "Logout" link to the nav if they are logged in.
    }

    // --- 2. DROPDOWN LOGIC ---
    // If you want the dropdown to toggle on click (better for mobile)
    const recipeDropdown = document.querySelector('.dropdown');
    if (recipeDropdown) {
        recipeDropdown.addEventListener('click', (e) => {
            // Logic to toggle the 'active' class for the menu
        });
    }

    // --- 3. SEARCH LOGIC ---

    const searchIcon = document.querySelector(".bi-search");
    
    if (searchIcon) {
        searchIcon.addEventListener("click", function (e) {
            e.preventDefault();
            
            const currentPath = window.location.pathname;
            let searchPagePath = "";
            
            if (currentPath.includes("/recipes/Rpages/")) {
                searchPagePath = "search.html";
            } else if (currentPath.includes("/recipes/")) {
                searchPagePath = "../Rpages/search.html";
            } else if (currentPath.includes("/account/")) {
                searchPagePath = "../recipes/Rpages/search.html";
            } else {
                searchPagePath = "recipes/Rpages/search.html";
            }
            
            window.location.href = searchPagePath;
        });
    }

    // --- 4. NAVIGATION HIGHLIGHTING ---
    const navLinks = document.querySelectorAll('.nav a');
    const currentPath = window.location.pathname;

    navLinks.forEach(link => {
        if (link.getAttribute('href') && currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
});