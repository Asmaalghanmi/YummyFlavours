# Yummy Flavors – Full-Stack Recipe Platform

A recipe website where users can browse and search recipes by category, create an account, save favorites, share their own recipes and contact the team. Built with a vanilla JavaScript frontend and a Node.js + Express REST API backed by MySQL.

![Home page](docs/home.png)

## Features

- **Recipe browsing** across 6 categories: Breakfast, Lunch, Dinner, Desserts, Snacks and Drinks
- **Search** by title, description, ingredients or instructions, with a category filter
- **Random recipe suggestions** on the home page
- **User accounts:** sign up, log in and edit profile (name, username, bio), with passwords stored as salted hashes
- **Favorites:** add, view and remove saved recipes
- **Share a recipe:** logged-in users can submit their own recipes
- **Contact form** saved to the database
- **Input validation** on both the frontend and the API

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript (Fetch API, LocalStorage) |
| Backend | Node.js, Express 5, REST API |
| Database | MySQL (`mysql2`, parameterized queries) |

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/user/update` | Update profile |
| GET | `/api/site-recipes?search=&category=` | Search site recipes |
| GET | `/api/site-recipes/random` | 3 random recipes |
| GET | `/api/recipes?search=&category=` | List user-shared recipes |
| POST | `/api/recipes/add` | Share a recipe |
| GET | `/api/favorites/:userId` | List a user's favorites |
| POST | `/api/favorites/site/add` | Add a recipe to favorites |
| GET | `/api/favorites/site/check` | Check if a recipe is a favorite |
| DELETE | `/api/favorites/site/remove` | Remove a recipe from favorites |
| POST | `/api/contact` | Send a contact message |

## Database

Five tables: `users`, `site_recipes`, `recipes` (user-shared), `favorites` and `contacts`, with foreign keys linking favorites and shared recipes to users. The schema and the 30 site recipes are in [`yummy_flavors_db.sql`](yummy_flavors_db.sql).

## How to run locally

**Requirements:** Node.js 22+, MySQL (or XAMPP), and VS Code with the Live Server extension.

1. **Create the database:** import `yummy_flavors_db.sql` in phpMyAdmin, or run:
   ```bash
   mysql -u root -p < yummy_flavors_db.sql
   ```
2. **Configure and start the backend:**
   ```bash
   cd backend
   cp .env.example .env      # then put your MySQL password in .env
   npm install
   npm start
   ```
   The API runs at `http://127.0.0.1:5000`.
3. **Start the frontend:** open the project folder in VS Code and click **Go Live** (Live Server, port 5500). Open `index.html`.

## Project structure

```
├── index.html, home.html, about.html, contact.html
├── account/            Sign up, log in, profile, edit profile, favorites
├── recipes/            Category pages and recipe pages
├── assets/
│   ├── css/            Page styles
│   ├── js/             Frontend logic (auth, search, favorites, profile, contact)
│   └── img/            Logo and recipe images
├── backend/
│   ├── server.js       Express REST API
│   └── .env.example    Database settings template
└── yummy_flavors_db.sql  MySQL schema and recipe data
```

## Team

Team project. **My contribution:** _add your part here (e.g. backend API, database design, frontend pages)._
