const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const ejs = require('ejs');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const dbPath = isProduction ? ':memory:' : './database.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

// Set up database
db.serialize(() => {
    console.log("Initializing database...");
    db.run("CREATE TABLE IF NOT EXISTS confessions (id INTEGER PRIMARY KEY, toWhom TEXT, confession TEXT, date TEXT)", (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Table 'confessions' created or already exists.");
        }
    });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Serve the main page
app.get('/', (req, res) => {
    console.log("Serving the main page.");
    res.render('index');
});

// Handle form submission
app.post('/confess', (req, res) => {
    console.log("Received confession form submission:", req.body);
    const { to, confession } = req.body;
    const date = new Date().toLocaleDateString();
    db.run("INSERT INTO confessions (toWhom, confession, date) VALUES (?, ?, ?)", [to, confession, date], (err) => {
        if (err) {
            console.error("Error inserting confession:", err.message);
            return res.status(500).send("Internal Server Error");
        }
        console.log("Confession added successfully.");
        res.redirect('/');
    });
});

// Fetch all confessions
app.get('/confessions', (req, res) => {
    console.log("Fetching all confessions.");
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
    console.log("Searching confessions with term:", searchTerm);
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
