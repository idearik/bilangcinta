const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const ejs = require('ejs');

const app = express();
const db = new sqlite3.Database(':memory:');

// Set up database
db.serialize(() => {
    db.run("CREATE TABLE confessions (id INTEGER PRIMARY KEY, toWhom TEXT, confession TEXT, date TEXT)");
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
            return console.error(err.message);
        }
        res.redirect('/');
    });
});

// Fetch all confessions
app.get('/confessions', (req, res) => {
    db.all("SELECT * FROM confessions ORDER BY id DESC", (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.json(rows);
    });
});

// Search confessions
app.get('/search', (req, res) => {
    const searchTerm = req.query.q;
    db.all("SELECT * FROM confessions WHERE toWhom LIKE ? OR confession LIKE ? ORDER BY id DESC", [`%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        res.json(rows);
    });
});

module.exports = app;
