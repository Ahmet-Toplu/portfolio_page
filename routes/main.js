// Create a new router
const express = require("express")
const router = express.Router()
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
    res.render('index.ejs', {
        username: req.session.username, 
        userId: req.session.userId, 
        isAdmin: req.session.isAdmin
    })
})

router.get('/contact', function(req, res, next){
    res.render('contact.ejs', {
        error: null, 
        success: null, 
        username: req.session.username, 
        userId: req.session.userId, 
        isAdmin: req.session.isAdmin
    })
})

// Handle Contact Form Submission
router.post('/contact', async (req, res) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).send('You must be logged in to send a message.');
    }

    // Sanitize input
    const name = req.sanitize(req.body.name);
    const message = req.sanitize(req.body.message);

    if (!message || message.trim() === '') {
        return res.render('contact.ejs', { 
            error: 'Message cannot be empty.', 
            success: null, 
            username: req.session.username, 
            userId: req.session.userId, 
            isAdmin: req.session.isAdmin 
        });
    }

    const displayName = name && name.trim() !== '' ? name : req.session.username;

    try {
        // Insert message into the database
        await db.query(
            'INSERT INTO messages (user_id, name, message) VALUES (?, ?, ?)', 
            [userId, displayName, message]
        );
        res.render('contact.ejs', { 
            error: null, 
            success: 'Your message has been sent!', 
            username: req.session.username, 
            userId: req.session.userId, 
            isAdmin: req.session.isAdmin 
        });
    } catch (err) {
        console.error('Error saving message:', err);
        res.render('contact.ejs', {
            error: 'An error occurred while sending your message. Please try again.',
            success: null, 
            username: req.session.username, 
            userId: req.session.userId, 
            isAdmin: req.session.isAdmin
        });
    }
});

router.get('/messages', isLoggedIn, async function(req, res, next){
    if (!req.session.isAdmin) {
        return res.status(403).send('Access denied');
    }

    try {
        const [messages] = await db.query(`
            SELECT m.id, m.name, m.message, m.created_at, u.username, u.email
            FROM messages m
            JOIN users u ON m.user_id = u.id
            ORDER BY m.created_at DESC
        `);

        // Sanitize results before sending them to the view
        const sanitizedMessages = messages.map(msg => ({
            ...msg,
            name: req.sanitize(msg.name || 'Anonymous'),
            message: req.sanitize(msg.message),
            username: req.sanitize(msg.username),
            email: req.sanitize(msg.email),
            created_at: msg.created_at, // Timestamps don't require sanitization
        }));

        res.render('messages.ejs', { 
            messages: sanitizedMessages, 
            username: req.session.username, 
            userId: req.session.userId, 
            isAdmin: req.session.isAdmin 
        });
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).send('Error fetching messages');
    }
})

// Export the router object so index.js can access it
module.exports = router