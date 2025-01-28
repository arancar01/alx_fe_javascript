// script.js

// Array to store quotes
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Clear previous content and display new quote
  quoteDisplay.innerHTML = `
    <p><strong>Quote:</strong> ${randomQuote.text}</p>
    <p><strong>Category:</strong> ${randomQuote.category}</p>
  `;
}

// Function to create and handle the Add Quote form
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteButton">Add Quote</button>
  `;

  document.body.appendChild(formContainer);

  // Add event listener to the Add Quote button
  document.getElementById('addQuoteButton').addEventListener('click', addQuote);
}

// Function to add a new quote to the array and update the DOM
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText && newQuoteCategory) {
    // Add new quote to the quotes array
    quotes.push({ text: newQuoteText, category: newQuoteCategory });

    // Clear the input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    alert('New quote added successfully!');
  } else {
    alert('Please fill out both fields.');
  }
}

// Attach event listeners
window.onload = function () {
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  createAddQuoteForm();
};
