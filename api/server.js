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

const badWords = [
    "anjing", "babi", "bangsat", "bajingan", "brengsek", "kampret", 
    "kontol", "memek", "ngentot", "perek", "setan", "tolol", "asu", 
    "jancuk", "pepek"
];

// Set up database
db.serialize(() => {
    console.log("Initializing database...");
    db.run("CREATE TABLE IF NOT EXISTS confessions (id INTEGER PRIMARY KEY, toWhom TEXT, confession TEXT, date TEXT, upvotes INTEGER DEFAULT 0)", (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Table 'confessions' created or already exists.");
        }
    });
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
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

    const toLower = to.toLowerCase();
    const confessionLower = confession.toLowerCase();
    let containsBadWord = false;

    badWords.forEach(word => {
        if (toLower.includes(word) || confessionLower.includes(word)) {
            containsBadWord = true;
        }
    });

    if (containsBadWord) {
        res.status(400).send("Your confession contains inappropriate language. Please remove the bad words.");
    } else {
        db.run("INSERT INTO confessions (toWhom, confession, date, upvotes) VALUES (?, ?, ?, 0)", [to, confession, date], (err) => {
            if (err) {
                console.error("Error inserting confession:", err.message);
                return res.status(500).send("Internal Server Error");
            }
            console.log("Confession added successfully.");
            res.redirect('/');
        });
    }
});

// Handle upvote
app.post('/upvote', (req, res) => {
    const { id } = req.body;
    db.run("UPDATE confessions SET upvotes = upvotes + 1 WHERE id = ?", [id], function(err) {
        if (err) {
            console.error("Error updating upvote:", err.message);
            return res.status(500).send("Internal Server Error");
        }
        res.send("Upvote successful");
    });
});

// Handle unvote
app.post('/unvote', (req, res) => {
    const { id } = req.body;
    db.run("UPDATE confessions SET upvotes = upvotes - 1 WHERE id = ?", [id], function(err) {
        if (err) {
            console.error("Error updating unvote:", err.message);
            return res.status(500).send("Internal Server Error");
        }
        res.send("Unvote successful");
    });
});

// Fetch all confessions
app.get('/confessions', (req, res) => {
    console.log("Fetching all confessions.");
    db.all("SELECT * FROM confessions ORDER BY upvotes DESC, id DESC", (err, rows) => {
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
    db.all("SELECT * FROM confessions WHERE toWhom LIKE ? OR confession LIKE ? ORDER BY upvotes DESC, id DESC", [`%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
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
