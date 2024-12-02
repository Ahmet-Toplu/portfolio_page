// Create a new router
const express = require("express")
const router = express.Router()
const path = require("path");
const fs = require("fs");
const axios = require("axios");
require('dotenv').config();

const GITHUB_API_BASE = "https://api.github.com/repos";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Middleware to check if the user is logged in
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

async function fetchProjectLanguages(githubUrl) {
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return {};

    const owner = match[1];
    const repo = match[2];

    try {
        const response = await axios.get(`${GITHUB_API_BASE}/${owner}/${repo}/languages`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`
            }
        });
        return response.data || {};
    } catch (error) {
        console.error(`Error fetching languages for ${owner}/${repo}:`, error.message);
        return {};
    }
}

// Handle our routes
router.get('/', async (req, res) => {
    // Query database for all projects
    try {
        const [projects] = await db.query("SELECT * FROM projects");

        // Process project data (e.g., images)
        const updatedProjects = await Promise.all(projects.map(async (project) => {
        const projectFolderPath = path.join(__dirname, "../public", project.folder);
        let selectedImage = "";

        try {
            const files = fs.readdirSync(projectFolderPath);
            selectedImage = files.find(file => file.startsWith("0_")) || files[0];
        } catch (error) {
            console.error(`Error reading folder for project ${project.name}:`, error);
        }

        // Fetch languages from GitHub API
        let languages = {};
        if (project.github) {
            languages = await fetchProjectLanguages(project.github);
        }

        return {
            ...project,
            image: selectedImage ? `${project.folder}/${selectedImage}` : "/images/default.jpg",
            languages,
        };
        }));

        // Render the updated projects page
        res.render('projects.ejs', { projects: updatedProjects, username: req.session.username, isAdmin: req.session.isAdmin, userId: req.session.userId });
    } catch (err) {
        console.error('Error fetching projects from database:', err);
        res.status(500).send('Error fetching projects');
    }
});

router.get('/search', async (req, res) => {
    const searchQuery = req.query.query;

    try {
        // Query the database to find projects matching the search term
        const [results] = await db.query(
            "SELECT * FROM projects WHERE name LIKE ? OR description LIKE ?", 
            [`%${searchQuery}%`, `%${searchQuery}%`]
        );

        // Process the projects (e.g., add images)
        const updatedProjects = await Promise.all(results.map(async (project) => {
            const projectFolderPath = path.join(__dirname, "../public", project.folder);
            let selectedImage = "";

            try {
                const files = fs.readdirSync(projectFolderPath);
                selectedImage = files.find(file => file.startsWith("0_")) || files[0];
            } catch (error) {
                console.error(`Error reading folder for project ${project.name}:`, error);
            }

            return {
                ...project,
                image: selectedImage ? `${project.folder}/${selectedImage}` : "/images/default.jpg",
            };
        }));

        // Render the projects page with search results
        res.render('projects.ejs', {
            projects: updatedProjects,
            username: req.session.username,
            isAdmin: req.session.isAdmin,
            userId: req.session.userId
        });
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).send('Error searching for projects');
    }
});

  
// Route for viewing project details with comments
router.get('/:id', async (req, res) => {
    const projectId = parseInt(req.params.id, 10);

    // Query the database for the project by ID
    try {
        const [projects] = await db.query("SELECT * FROM projects WHERE id = ?", [projectId]);
        const project = projects[0];

        if (!project) {
            return res.status(404).send('Project not found');
        }

        const projectFolderPath = path.join(__dirname, "../public", project.folder);
        let images = [];
        let comments = [];
        let languages = {};

        try {
            const files = fs.readdirSync(projectFolderPath);
            images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
                            .map(file => `${project.folder}/${file}`);
        } catch (error) {
            console.error(`Error reading images for project ${project.name}:`, error);
        }

        // Fetch comments for this project from the database
        try {
            const [rows, fields] = await db.query(
                `SELECT comments.comment, comments.created_at, users.username 
                 FROM comments
                 JOIN users ON comments.user_id = users.id
                 WHERE comments.project_id = ?`, 
                [projectId]
              );
            comments = rows;
        } catch (error) {
            console.error("Error fetching comments:", error);
        }

        // Fetch languages from GitHub API
        if (project.github) {
            languages = await fetchProjectLanguages(project.github);
        }

        res.render('project.ejs', {
            project,
            images,
            languages,
            comments,
            username: req.session.username,
            isAdmin: req.session.isAdmin,
            userId: req.session.userId
        });



    } catch (err) {
        console.error('Error fetching project details:', err);
        res.status(500).send('Error fetching project details');
    }
});
  
router.post('/comment', isLoggedIn, async (req, res) => {
    const { comment, projectId } = req.body; // projectId is now in req.body
    const userId = req.session.userId;

    // Check if projectId and comment are provided
    if (!projectId || !comment) {
        return res.status(400).send('Missing projectId or comment');
    }

    try {
        // Insert the comment into the database
        await db.query('INSERT INTO comments (user_id, project_id, comment) VALUES (?, ?, ?)', [userId, projectId, comment]);
        res.redirect(`/projects/${projectId}`); // Redirect to the project page after posting the comment
    } catch (error) {
        console.error('Error posting comment:', error);
        res.status(500).send('Error posting comment');
    }
});
  

// Export the router object so index.js can access it
module.exports = router