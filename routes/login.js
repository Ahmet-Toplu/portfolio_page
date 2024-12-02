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
          res.redirect("./"); // Redirect after successful login
        } else {
          res.render("login.ejs", { 
            error: "Invalid username or password",
            username: req.session.username, 
            userId: req.session.userId, 
            isAdmin: req.session.isAdmin
          });
        }
      });
    } else {
      res.render("login.ejs", {
        error: "Invalid username or password",
        username: req.session.username, 
        userId: req.session.userId, 
        isAdmin: req.session.isAdmin
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    next(error);
  }
});
  

router.get("/register", (req, res, next) => {
    res.render("register.ejs", {username: req.session.username, userId: req.session.userId, isAdmin: req.session.isAdmin});
});

router.post(
  "/register",
  [
    // Validate password strength
    check('password')
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long.")
      .matches(/\d/).withMessage("Password must contain at least one number.")
  ],
  async (req, res, next) => {
    // Validate input data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("register.ejs", {
        error: errors.array().map(err => err.msg).join(", "),
        username: req.session.username,
        userId: req.session.userId,
        isAdmin: req.session.isAdmin
      });
    }

    try {
      const { username, email, password } = req.body;

      // Check if username or email already exists
      const sqlquery = "SELECT * FROM users WHERE username = ? OR email = ?";
      const [result] = await db.query(sqlquery, [username, email]);

      if (result.length > 0) {
        return res.render("register.ejs", {
          error: "Username or email already exists",
          username: username,
          email: email
        });
      }

      // Hash the password
      const hash = await bcrypt.hash(password, saltRounds);

      // Insert the user into the database
      const insertQuery = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      await db.query(insertQuery, [username, email, hash]);

      return res.redirect("../");
    } catch (error) {
      console.error("Error during registration:", error);
      return next(error);
    }
  }
);

router.get('/logout', (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('./')
    }
    res.send('you are now logged out. <a href='+'../login'+'>Back to login</a>');
    })
})

// Export the router object so index.js can access it
module.exports = router