// script.js

// Array to store quotes (loaded from localStorage if available)
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Server URL (replace with your actual API URL if needed)
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Example mock API

// Function to save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to fetch quotes from the server and merge them with local data
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();

    // Merge server quotes with local quotes
    mergeQuotes(serverQuotes);

    // Notify user of successful sync
    notifyUser('Quotes successfully synced with the server!');
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
    notifyUser('Failed to sync with the server. Please try again later.');
  }
}

// Function to sync local quotes to the server
async function syncQuotesToServer() {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quotes)
    });

    if (response.ok) {
      notifyUser('Local quotes successfully synced to the server!');
    } else {
      notifyUser('Failed to sync local quotes to the server.');
    }
  } catch (error) {
    console.error('Error syncing quotes to server:', error);
  }
}

// Function to merge server quotes with local quotes
function mergeQuotes(serverQuotes) {
  const mergedQuotes = [...quotes];

  serverQuotes.forEach(serverQuote => {
    if (!quotes.some(localQuote => localQuote.text === serverQuote.text)) {
      mergedQuotes.push(serverQuote);
    }
  });

  quotes = mergedQuotes;
  saveQuotes();
  populateCategories();
  filterQuotes();
}

// Function to notify the user of actions
function notifyUser(message) {
  alert(message);
}

// Function to display quotes based on a category filter
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const quoteDisplay = document.getElementById('quoteDisplay');

  // Save selected category to localStorage
  localStorage.setItem('selectedCategory', selectedCategory);

  // Filter quotes by selected category
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

  // Clear previous content and display filtered quotes
  quoteDisplay.innerHTML = filteredQuotes.map(quote => `
    <p><strong>Quote:</strong> ${quote.text}</p>
    <p><strong>Category:</strong> ${quote.category}</p>
  `).join('');
}

// Function to populate category filter dropdown dynamically
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');

  // Extract unique categories from quotes
  const categories = ['all', ...new Set(quotes.map(quote => quote.category))];

  // Populate dropdown options
  categoryFilter.innerHTML = categories.map(category => `
    <option value="${category}">${category}</option>
  `).join('');

  // Restore last selected category filter from localStorage
  const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
  categoryFilter.value = selectedCategory;
  filterQuotes();
}

// Function to display a random quote
function showRandomQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(randomQuote));

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

    // Save quotes to localStorage
    saveQuotes();

    // Sync quotes to the server
    syncQuotesToServer();

    // Update category dropdown if new category is added
    populateCategories();

    // Clear the input fields
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    alert('New quote added successfully!');
  } else {
    alert('Please fill out both fields.');
  }
}

// Attach event listeners and initialize application
window.onload = function () {
  document.getElementById('newQuote').addEventListener('click', showRandomQuote);
  createAddQuoteForm();

  // Create category filter dropdown
  const categoryFilter = document.createElement('select');
  categoryFilter.id = 'categoryFilter';
  categoryFilter.addEventListener('change', filterQuotes);
  document.body.insertBefore(categoryFilter, document.getElementById('quoteDisplay'));

  // Add Sync with Server button
  const syncButton = document.createElement('button');
  syncButton.textContent = 'Sync with Server';
  syncButton.addEventListener('click', fetchQuotesFromServer);
  document.body.appendChild(syncButton);

  // Display last viewed quote from sessionStorage if available
  const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastViewedQuote) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    const quote = JSON.parse(lastViewedQuote);
    quoteDisplay.innerHTML = `
      <p><strong>Quote:</strong> ${quote.text}</p>
      <p><strong>Category:</strong> ${quote.category}</p>
    `;
  }

  // Populate categories in dropdown
  populateCategories();
};
