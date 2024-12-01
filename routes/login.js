// Create a new router
const bcrypt = require("bcrypt");
const saltRounds = 10;
const express = require("express");
const router = express.Router();
var expressSanitizer = require("express-sanitizer");
const { check, validationResult } = require('express-validator');

const isLoggedIn = async (req, res, next) => {
  if (req.session.userId) {
    // Check if the logged-in user is an admin
    try {
      const [rows, fields] = await db.query('SELECT admin FROM users WHERE id = ?', [req.session.userId]);
      if (rows.length > 0 && rows[0].admin) {
        req.session.isAdmin = true; // Set isAdmin to true if the user is an admin
      } else {
        req.session.isAdmin = false; // Set isAdmin to false if the user is not an admin
      }
      return next();
    } catch (error) {
      console.error('Error checking admin status:', error);
      return res.redirect('/login'); // Redirect to login page if there is an error
    }
  } else {
    req.session.isAdmin = false;
    res.redirect('/login'); // Redirect to login page if not logged in
  }
};

// Handle our routes
router.get('/',function(req, res, next){
    // send the cached user data to login page
    res.render('login.ejs', {username: req.session.username, userId: req.session.userId, isAdmin: req.session.isAdmin});
})

// Login form submission route
router.post("/", async (req, res, next) => {      
    let sqlquery = "SELECT * FROM users WHERE username = ?";
    let record = [req.sanitize(req.body.username)];
  
    try {
      const [rows, fields] = await db.query(sqlquery, record);
  
      if (rows.length > 0) {
        // Compare the password
        bcrypt.compare(req.sanitize(req.body.password), rows[0].password, function (err, result) {
          if (result) {
            // Store the username in session instead of userId
            req.session.username = rows[0].username;  // Store username in session
            req.session.userId = rows[0].id;  // Store userId in session
            req.session.isAdmin = rows[0].admin;  // Store admin status in session
            res.redirect("/"); // Redirect after successful login
          } else {
            res.render("login.ejs", { error: "Invalid username or password" });
          }
        });
      } else {
        res.render("login.ejs", { error: "Invalid username or password" });
      }
    } catch (error) {
      console.error("Error during login:", error);
      next(error);
    }
  });
  

router.get("/register", (req, res, next) => {
    res.render("register.ejs", {username: req.session.username, userId: req.session.userId, isAdmin: req.session.isAdmin});
});

router.post("/register", async (req, res, next) => {
  try {
    // Sanitize and extract the form data
    let username = req.sanitize(req.body.username);
    let email = req.sanitize(req.body.email);
    let password = req.sanitize(req.body.password);

    // Step 1: Check if username or email already exists
    let sqlquery = "SELECT * FROM users WHERE username = ? OR email = ?";
    let record = [username, email];
    const [result] = await db.query(sqlquery, record);

    if (result.length > 0) {
      return res.render("register.ejs", { error: "Username or email already exists" });
    }
    // Step 2: Hash the password
    const hash = await bcrypt.hash(password, saltRounds);

    // Step 3: Insert the user into the database
    let insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    let insertRecord = [username, email, hash];
    await db.query(insertQuery, insertRecord);

    // Step 4: Retrieve the user's details from the database
    let fetchQuery = "SELECT * FROM users WHERE username = ?";
    const [userResult] = await db.query(fetchQuery, [username]);

    if (userResult.length > 0) {
      // Set session variables
      const user = userResult[0];
      req.session.username = user.username;
      req.session.userId = user.id;
      req.session.isAdmin = user.admin;
    }

    return res.redirect("../");
  } catch (error) {
    console.error("Error during registration:", error);
    return next(error);
  }
});

router.get('/logout', (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'./'+'>Back to login</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router