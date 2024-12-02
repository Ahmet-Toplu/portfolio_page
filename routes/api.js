const express = require("express")
const router = express.Router()

router.get('/projects', async function (req, res, next) {
    // Query database to get all the projects
    let sqlquery = "SELECT id, name, description, github FROM projects"

    // Execute the sql query
    try {
        const result = await db.query(sqlquery)
        res.json(result[0])
    } catch (err) {
        console.error('Error executing query:', err)
        res.status(500).send('Error fetching projects')
    }
});

module.exports = router