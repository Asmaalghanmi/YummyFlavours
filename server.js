const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const crypto = require("crypto");

const app = express();

app.use(cors({
    origin: [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5501",
        "http://localhost:5501"
    ],
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database settings come from environment variables (see .env.example).
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "yummy_flavors_db",
    port: Number(process.env.DB_PORT) || 3306
});

/* =========================
   PASSWORD HASHING (Node built-in scrypt)
========================= */

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    const [salt, hash] = String(stored).split(":");
    if (!salt || !hash) {
        return false;
    }
    const storedBuffer = Buffer.from(hash, "hex");
    const testBuffer = crypto.scryptSync(password, salt, storedBuffer.length);
    return storedBuffer.length === testBuffer.length && crypto.timingSafeEqual(storedBuffer, testBuffer);
}

db.connect(function (err) {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }

    console.log("Connected to yummy_flavors_db");
});

app.get("/", function (req, res) {
    res.send("YummyFlavors backend is working!");
});

/* =========================
   CONTACT ROUTES
========================= */

app.post("/api/contact", function (req, res) {
    const {
        firstName,
        lastName,
        gender,
        mobile,
        dob,
        email,
        language,
        message
    } = req.body;

    if (!firstName || !lastName || !gender || !mobile || !dob || !email || !language || !message) {
        return res.status(400).json({
            success: false,
            message: "All contact fields are required."
        });
    }

    const namePattern = /^[A-Za-z\s]{2,50}$/;
    const mobilePattern = /^[0-9]{10,15}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!namePattern.test(firstName) || !namePattern.test(lastName)) {
        return res.status(400).json({
            success: false,
            message: "First name and last name must contain letters only."
        });
    }

    if (!mobilePattern.test(mobile)) {
        return res.status(400).json({
            success: false,
            message: "Mobile number must contain 10 to 15 digits."
        });
    }

    if (!emailPattern.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }

    if (message.trim().length < 10 || message.trim().length > 500) {
        return res.status(400).json({
            success: false,
            message: "Message must be between 10 and 500 characters."
        });
    }

    const sql = `
        INSERT INTO contacts
        (first_name, last_name, gender, mobile, dob, email, language, message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            firstName.trim(),
            lastName.trim(),
            gender,
            mobile.trim(),
            dob,
            email.trim(),
            language,
            message.trim()
        ],
        function (err) {
            if (err) {
                console.error("Contact insert error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Error saving contact message."
                });
            }

            res.status(201).json({
                success: true,
                message: "Contact message saved successfully."
            });
        }
    );
});

app.get("/api/contact", function (req, res) {
    const sql = "SELECT * FROM contacts ORDER BY id DESC";

    db.query(sql, function (err, results) {
        if (err) {
            console.error("Contact fetch error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Error fetching contact messages."
            });
        }

        res.json(results);
    });
});

/* =========================
   AUTH ROUTES
========================= */

app.post("/api/auth/signup", function (req, res) {
    const { fname, lname, username, gender, email, password } = req.body;

    if (!fname || !lname || !username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Required fields are missing."
        });
    }

    const namePattern = /^[A-Za-z\s]{2,50}$/;
    const usernamePattern = /^[A-Za-z0-9_]{3,30}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!namePattern.test(fname) || !namePattern.test(lname)) {
        return res.status(400).json({
            success: false,
            message: "First name and last name must contain letters only."
        });
    }

    if (!usernamePattern.test(username)) {
        return res.status(400).json({
            success: false,
            message: "Username must be 3 to 30 characters and contain letters, numbers, or underscore only."
        });
    }

    if (!emailPattern.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please enter a valid email address."
        });
    }

    if (password.length < 6 || password.length > 50) {
        return res.status(400).json({
            success: false,
            message: "Password must be between 6 and 50 characters."
        });
    }

    const sql = `
        INSERT INTO users
        (first_name, last_name, username, gender, email, password)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            fname.trim(),
            lname.trim(),
            username.trim(),
            gender,
            email.trim(),
            hashPassword(password)
        ],
        function (err) {
            if (err) {
                console.error("Signup error:", err.message);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        success: false,
                        message: "Email or username already exists."
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: "Database error during signup."
                });
            }

            res.status(201).json({
                success: true,
                message: "Account created successfully."
            });
        }
    );
});

app.post("/api/auth/login", function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    const sql = `
        SELECT id, first_name, last_name, username, bio, email, password
        FROM users
        WHERE email = ?
    `;

    db.query(sql, [email.trim()], function (err, results) {
        if (err) {
            console.error("Login error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Database error during login."
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Email not found."
            });
        }

        const user = results[0];

        if (!verifyPassword(password, user.password)) {
            return res.status(401).json({
                success: false,
                message: "Incorrect password."
            });
        }

        res.json({
            success: true,
            message: "Login successful.",
            user: {
                id: user.id,
                fname: user.first_name,
                lname: user.last_name,
                username: user.username,
                bio: user.bio,
                email: user.email
            }
        });
    });
});

/* =========================
   UPDATE PROFILE
========================= */

app.post("/api/user/update", function (req, res) {
    const { id, fname, username, bio } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "User ID is required."
        });
    }

    const sql = `
        UPDATE users
        SET first_name = ?, username = ?, bio = ?
        WHERE id = ?
    `;

    db.query(sql, [fname, username, bio, id], function (err, result) {
        if (err) {
            console.error("Profile update error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Database error during profile update."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: { id, fname, username, bio }
        });
    });
});

/* =========================
   SHARED RECIPES ROUTES
========================= */

app.get("/api/recipes", function (req, res) {
    const search = req.query.search || "";
    const category = req.query.category || "";

    let sql = `
        SELECT *
        FROM recipes
        WHERE recipe_title LIKE ?
    `;

    const values = [`%${search}%`];

    if (category !== "") {
        sql += " AND category = ?";
        values.push(category);
    }

    sql += " ORDER BY id DESC";

    db.query(sql, values, function (err, results) {
        if (err) {
            console.error("Recipes fetch error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Error fetching recipes."
            });
        }

        res.json(results);
    });
});

app.post("/api/recipes/add", function (req, res) {
    const {
        user_id,
        recipe_title,
        category,
        minutes,
        description,
        photo_name
    } = req.body;

    const titlePattern = /^[A-Za-z0-9\s&'-]+$/;
    const allowedCategories = ["Breakfast", "Lunch", "Dinner", "Desserts", "Snacks", "Drinks"];
    const allowedExtensions = [".jpg", ".jpeg", ".png"];

    if (!user_id || isNaN(user_id)) {
        return res.status(400).json({
            success: false,
            message: "Please log in first."
        });
    }

    if (!recipe_title || recipe_title.trim().length < 3 || recipe_title.trim().length > 100) {
        return res.status(400).json({
            success: false,
            message: "Recipe title must be between 3 and 100 characters."
        });
    }

    if (!titlePattern.test(recipe_title)) {
        return res.status(400).json({
            success: false,
            message: "Recipe title contains invalid characters."
        });
    }

    if (!category || !allowedCategories.includes(category)) {
        return res.status(400).json({
            success: false,
            message: "Please select a valid category."
        });
    }

    if (!minutes || isNaN(minutes) || Number(minutes) < 1) {
        return res.status(400).json({
            success: false,
            message: "Minutes must be a valid positive number."
        });
    }

    if (!description || description.trim().length < 10) {
        return res.status(400).json({
            success: false,
            message: "Description must be at least 10 characters."
        });
    }

    if (!photo_name || photo_name.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Recipe photo is required."
        });
    }

    const lowerPhotoName = photo_name.toLowerCase();
    const validPhoto = allowedExtensions.some(function (ext) {
        return lowerPhotoName.endsWith(ext);
    });

    if (!validPhoto) {
        return res.status(400).json({
            success: false,
            message: "Photo must be JPG, JPEG, or PNG."
        });
    }

    const sql = `
        INSERT INTO recipes
        (user_id, recipe_title, category, minutes, description, photo_name)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            recipe_title.trim(),
            category,
            Number(minutes),
            description.trim(),
            photo_name.trim()
        ],
        function (err) {
            if (err) {
                console.error("Recipe insert error:", err.message);
                return res.status(500).json({
                    success: false,
                    message: "Failed to save recipe."
                });
            }

            res.status(201).json({
                success: true,
                message: "Recipe saved successfully."
            });
        }
    );
});

/* =========================
   SITE RECIPES SEARCH ROUTE
========================= */

app.get("/api/site-recipes", function (req, res) {
    const search = req.query.search || "";
    const category = req.query.category || "";

    let sql = `
        SELECT *
        FROM site_recipes
        WHERE (
            recipe_title LIKE ?
            OR description LIKE ?
            OR ingredients LIKE ?
            OR instructions LIKE ?
            OR search_text LIKE ?
        )
    `;

    const values = [
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`,
        `%${search}%`
    ];

    if (category !== "") {
        sql += " AND category = ?";
        values.push(category);
    }

    sql += " ORDER BY id ASC";

    db.query(sql, values, function (err, results) {
        if (err) {
            console.error("Site recipes search error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Error searching recipes."
            });
        }

        res.json(results);
    });
});

/* =========================
   RANDOM SITE RECIPES
========================= */

app.get("/api/site-recipes/random", function (req, res) {
    const sql = `
        SELECT *
        FROM site_recipes
        ORDER BY RAND()
        LIMIT 3
    `;

    db.query(sql, function (err, results) {
        if (err) {
            console.error("Random recipes error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Error fetching random recipes."
            });
        }

        res.json(results);
    });
});

/* =========================
   FAVORITES ROUTES
========================= */

app.get("/api/favorites/:userId", function (req, res) {
    const userId = req.params.userId;

    const sql = `
        SELECT *
        FROM favorites
        WHERE user_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [userId], function (err, results) {
        if (err) {
            console.error("Favorites fetch error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Error fetching favorites."
            });
        }

        res.json(results);
    });
});

app.post("/api/favorites/add", function (req, res) {
    const {
        user_id,
        recipe_name,
        recipe_image,
        recipe_url,
        category
    } = req.body;

    if (!user_id || !recipe_name) {
        return res.status(400).json({
            success: false,
            message: "User and recipe are required."
        });
    }

    const checkSql = `
        SELECT id
        FROM favorites
        WHERE user_id = ? AND recipe_name = ?
    `;

    db.query(checkSql, [user_id, recipe_name], function (checkErr, checkResults) {
        if (checkErr) {
            console.error("Favorite check error:", checkErr.message);
            return res.status(500).json({
                success: false,
                message: "Error checking favorite."
            });
        }

        if (checkResults.length > 0) {
            return res.status(409).json({
                success: false,
                message: "This recipe is already in favorites."
            });
        }

        const insertSql = `
            INSERT INTO favorites
            (user_id, recipe_name, recipe_image, recipe_url, category)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            insertSql,
            [user_id, recipe_name, recipe_image, recipe_url, category],
            function (err) {
                if (err) {
                    console.error("Favorite insert error:", err.message);
                    return res.status(500).json({
                        success: false,
                        message: "Failed to save favorite."
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "Added to favorites."
                });
            }
        );
    });
});

app.delete("/api/favorites/:favoriteId", function (req, res) {
    const favoriteId = req.params.favoriteId;

    const sql = "DELETE FROM favorites WHERE id = ?";

    db.query(sql, [favoriteId], function (err, result) {
        if (err) {
            console.error("Favorite delete error:", err.message);
            return res.status(500).json({
                success: false,
                message: "Failed to delete favorite."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Favorite not found."
            });
        }

        res.json({
            success: true,
            message: "Favorite deleted successfully."
        });
    });
});

/* =========================
   CHECK SITE RECIPE FAVORITE
========================= */

app.get("/api/favorites/site/check", function (req, res) {
    const userId = req.query.user_id;
    const pageName = req.query.page_name;

    if (!userId || !pageName) {
        return res.status(400).json({
            success: false,
            message: "User and recipe page are required."
        });
    }

    const recipeSql = `
        SELECT id
        FROM site_recipes
        WHERE recipe_url LIKE ?
        LIMIT 1
    `;

    db.query(recipeSql, [`%/${pageName}`], function (recipeErr, recipeResults) {
        if (recipeErr) {
            console.error("Find site recipe error:", recipeErr.message);
            return res.status(500).json({
                success: false,
                message: "Error finding recipe."
            });
        }

        if (recipeResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found in database."
            });
        }

        const siteRecipeId = recipeResults[0].id;

        const checkSql = `
            SELECT id
            FROM favorites
            WHERE user_id = ? AND site_recipe_id = ?
            LIMIT 1
        `;

        db.query(checkSql, [userId, siteRecipeId], function (checkErr, checkResults) {
            if (checkErr) {
                console.error("Favorite check error:", checkErr.message);
                return res.status(500).json({
                    success: false,
                    message: "Error checking favorite."
                });
            }

            res.json({
                success: true,
                isFavorite: checkResults.length > 0
            });
        });
    });
});

/* =========================
   ADD SITE RECIPE TO FAVORITES
========================= */

app.post("/api/favorites/site/add", function (req, res) {
    const { user_id, page_name } = req.body;

    if (!user_id || !page_name) {
        return res.status(400).json({
            success: false,
            message: "User and recipe page are required."
        });
    }

    const recipeSql = `
        SELECT *
        FROM site_recipes
        WHERE recipe_url LIKE ?
        LIMIT 1
    `;

    db.query(recipeSql, [`%/${page_name}`], function (recipeErr, recipeResults) {
        if (recipeErr) {
            console.error("Find site recipe error:", recipeErr.message);
            return res.status(500).json({
                success: false,
                message: "Error finding recipe."
            });
        }

        if (recipeResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found in database."
            });
        }

        const recipe = recipeResults[0];

        const checkSql = `
            SELECT id
            FROM favorites
            WHERE user_id = ? AND site_recipe_id = ?
            LIMIT 1
        `;

        db.query(checkSql, [user_id, recipe.id], function (checkErr, checkResults) {
            if (checkErr) {
                console.error("Favorite check error:", checkErr.message);
                return res.status(500).json({
                    success: false,
                    message: "Error checking favorite."
                });
            }

            if (checkResults.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: "This recipe is already in your favorites."
                });
            }

            const insertSql = `
                INSERT INTO favorites
                (user_id, site_recipe_id, recipe_name, recipe_image, recipe_url, category)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [
                    user_id,
                    recipe.id,
                    recipe.recipe_title,
                    recipe.recipe_image,
                    recipe.recipe_url,
                    recipe.category
                ],
                function (err) {
                    if (err) {
                        console.error("Favorite insert error:", err.message);
                        return res.status(500).json({
                            success: false,
                            message: "Failed to save favorite."
                        });
                    }

                    res.status(201).json({
                        success: true,
                        message: "Added to favorites."
                    });
                }
            );
        });
    });
});

/* =========================
   REMOVE SITE RECIPE FROM FAVORITES
========================= */

app.delete("/api/favorites/site/remove", function (req, res) {
    const { user_id, page_name } = req.body;

    if (!user_id || !page_name) {
        return res.status(400).json({
            success: false,
            message: "User and recipe page are required."
        });
    }

    const recipeSql = `
        SELECT id
        FROM site_recipes
        WHERE recipe_url LIKE ?
        LIMIT 1
    `;

    db.query(recipeSql, [`%/${page_name}`], function (recipeErr, recipeResults) {
        if (recipeErr) {
            console.error("Find site recipe error:", recipeErr.message);
            return res.status(500).json({
                success: false,
                message: "Error finding recipe."
            });
        }

        if (recipeResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Recipe not found in database."
            });
        }

        const siteRecipeId = recipeResults[0].id;

        const deleteSql = `
            DELETE FROM favorites
            WHERE user_id = ? AND site_recipe_id = ?
        `;

        db.query(deleteSql, [user_id, siteRecipeId], function (deleteErr, result) {
            if (deleteErr) {
                console.error("Remove favorite error:", deleteErr.message);
                return res.status(500).json({
                    success: false,
                    message: "Failed to remove favorite."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Favorite not found."
                });
            }

            res.json({
                success: true,
                message: "Removed from favorites."
            });
        });
    });
});

/* =========================
   START SERVER
========================= */

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, function () {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});