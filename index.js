// Import express and ejs
var express = require("express");
var ejs = require("ejs");
const path = require("path");
const fs = require("fs");
var session = require("express-session");
var expressSanitizer = require("express-sanitizer");
require("./db");

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
