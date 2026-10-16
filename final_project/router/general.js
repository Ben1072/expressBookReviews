const express = require('express');
const axios = require('axios'); // Required for Tasks 10-13
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL for the running server instance to process local Axios requests
const BASE_URL = "http://localhost:5000";

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ "username": username, "password": password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Helper raw-data route so Axios has an endpoint to call internally
public_users.get('/raw-books', (req, res) => {
  return res.status(200).json(books);
});

// Task 10: Get the book list available in the shop using Async-Await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/raw-books`);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving book list", error: error.message });
  }
});

// Task 11: Get book details based on ISBN using Promise Callbacks with Axios (.then)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  axios.get(`${BASE_URL}/raw-books`)
    .then((response) => {
      const allBooks = response.data;
      if (allBooks[isbn]) {
        return res.status(200).send(JSON.stringify(allBooks[isbn], null, 4));
      } else {
        return res.status(404).json({ message: "Book not found" });
      }
    })
    .catch((error) => {
      return res.status(500).json({ message: "Error retrieving book by ISBN", error: error.message });
    });
});
  
// Task 12: Get book details based on author using Async-Await with Axios
public_users.get('/author/:author', async function (req, res) {
  try {
    const authorParam = req.params.author.toLowerCase();
    const response = await axios.get(`${BASE_URL}/raw-books`);
    const allBooks = response.data;
    const bookKeys = Object.keys(allBooks);
    let filteredBooks = [];

    bookKeys.forEach((key) => {
      if (allBooks[key].author.toLowerCase() === authorParam) {
        filteredBooks.push({ isbn: key, ...allBooks[key] });
      }
    });

    if (filteredBooks.length > 0) {
      return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by author", error: error.message });
  }
});

// Task 13: Get all books based on title using Async-Await with Axios
public_users.get('/title/:title', async function (req, res) {
  try {
    const titleParam = req.params.title.toLowerCase();
    const response = await axios.get(`${BASE_URL}/raw-books`);
    const allBooks = response.data;
    const bookKeys = Object.keys(allBooks);
    let filteredBooks = [];

    bookKeys.forEach((key) => {
      if (allBooks[key].title.toLowerCase() === titleParam) {
        filteredBooks.push({ isbn: key, ...allBooks[key] });
      }
    });

    if (filteredBooks.length > 0) {
      return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books by title", error: error.message });
  }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
