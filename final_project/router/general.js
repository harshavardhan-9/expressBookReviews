const express = require('express');
const axios = require('axios'); // Still required by instruction
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// User registration
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "User already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
});

// Task 10: Get the book list using async-await (simulated with Axios)
public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                resolve(books);
            });
        };

        const bookList = await getBooks();
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list" });
    }
});

// Task 11: Get book details based on ISBN using Promises
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject("Book not found");
        }
    })
        .then(book => res.status(200).send(JSON.stringify(book, null, 4)))
        .catch(err => res.status(404).json({ message: err }));
});

// Task 12: Get book details based on Author using async-await
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();

    const getBooksByAuthor = () => {
        return new Promise((resolve, reject) => {
            const filtered = [];

            for (let isbn in books) {
                if (books[isbn].author.toLowerCase() === author) {
                    filtered.push({ isbn, ...books[isbn] });
                }
            }

            filtered.length > 0 ? resolve(filtered) : reject("No books found for this author");
        });
    };

    try {
        const result = await getBooksByAuthor();
        return res.status(200).send(JSON.stringify(result, null, 4));
    } catch (err) {
        return res.status(404).json({ message: err });
    }
});

// Task 13: Get book details based on Title using Promises
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();

    new Promise((resolve, reject) => {
        const result = [];

        for (let isbn in books) {
            if (books[isbn].title.toLowerCase() === title) {
                result.push({ isbn, ...books[isbn] });
            }
        }

        result.length > 0 ? resolve(result) : reject("No books found with this title");
    })
        .then(data => res.status(200).send(JSON.stringify(data, null, 4)))
        .catch(err => res.status(404).json({ message: err }));
});

// Book reviews
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
