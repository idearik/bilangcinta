const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const ejs = require('ejs');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const db = new sqlite3.Database(isProduction ? ':memory:' : './database.db');

// Set up database
db.serialize(() => {
    console.log("Initializing database...");
    db.run("CREATE TABLE IF NOT EXISTS confessions (id INTEGER PRIMARY KEY, toWhom TEXT, confession TEXT, date TEXT)");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Serve the main page
app.get('/', (req, res) => {
    res.render('index');
});

// Handle form submission
app.post('/confess', (req, res) => {
    const { to, confession } = req.body;
    const date = new Date().toLocaleDateString();
    db.run("INSERT INTO confessions (toWhom, confession, date) VALUES (?, ?, ?)", [to, confession, date], (err) => {
        if (err) {
            console.error("Error inserting confession:", err.message);
            return res.status(500).send("Internal Server Error");
        }
        res.redirect('/');
    });
});

// Fetch all confessions
app.get('/confessions', (req, res) => {
    db.all("SELECT * FROM confessions ORDER BY id DESC", (err, rows) => {
        if (err) {
            console.error("Error fetching confessions:", err.message);
            return res.status(500).send("Internal Server Error");
        }
        res.json(rows);
    });
});

// Search confessions
app.get('/search', (req, res) => {
    const searchTerm = req.query.q;
    db.all("SELECT * FROM confessions WHERE toWhom LIKE ? OR confession LIKE ? ORDER BY id DESC", [`%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
        if (err) {
            console.error("Error searching confessions:", err.message);
            return res.status(500).send("Internal Server Error");
        }
        res.json(rows);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
