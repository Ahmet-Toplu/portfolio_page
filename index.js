// Import express and ejs
var express = require("express");
var ejs = require("ejs");
const path = require("path");
const fs = require("fs");
// Import mysql2/promise module for async/await support
var mysql = require("mysql2/promise");
var session = require("express-session");
var expressSanitizer = require("express-sanitizer");

// Create the express application object
const app = express();
const port = 8000;

// Create a session
app.use(
  session({
    secret: "somerandomstuff",
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: 600000,
      secure: false,
    },
  })
);

// Tell Express that we want to use EJS as the templating engine
app.set("view engine", "ejs");

// Middleware for body parsing and static files
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
app.use(expressSanitizer());

// Use an async function to handle database connection
async function connectToDatabase() {
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "portfolio",
      password: "portfolio",
      database: "portfolio",
      port: 3306,
    });

    console.log("Connected to the MySQL database!");

    global.db = db; // Make the db connection global for other parts of your app
  } catch (err) {
    console.error("Error connecting to the database:", err.message);
    process.exit(1); // Exit the process if the database connection fails
  }
}

// Call the async function to connect to the database
connectToDatabase();

// Define our application-specific data
app.locals.pageData = { owner: "Ahmet Toplu" };

// Import route handlers
const mainRoutes = require("./routes/main");
const projectRoutes = require("./routes/projects");
const loginRoutes = require("./routes/login");
const apiRoutes = require("./routes/api"); // Ensure this file exists and exports an Express router

// Use routes
app.use("/", mainRoutes);
app.use("/projects", projectRoutes);
app.use("/login", loginRoutes);
app.use("/api", apiRoutes); // Ensure apiRoutes is a router

// Start the web app listening
app.listen(port, () => console.log(`Node app listening on port ${port}!`));
