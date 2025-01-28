const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // استبدال هذا بالرابط الفعلي للخادم إذا كان متاحًا

// Array to store quotes (loaded from localStorage if available)
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Function to save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  const response = await fetch(SERVER_URL);
  const data = await response.json();
  return data;
}

// Function to send a new quote to the server via POST request
async function postQuoteToServer(newQuote) {
  const response = await fetch(SERVER_URL, {
    method: 'POST', // تحديد أن الطلب هو POST
    headers: {
      'Content-Type': 'application/json', // تحديد نوع المحتوى
    },
    body: JSON.stringify(newQuote), // تحويل الاقتباس الجديد إلى JSON
  });

  const data = await response.json();
  console.log('Quote added to server:', data);
  return data;
}

// Function to synchronize local data with the server
async function syncQuotes() {
  // 1. جلب الاقتباسات من الخادم
  const serverQuotes = await fetchQuotesFromServer();
  
  // 2. تحديث الاقتباسات المحلية بناءً على بيانات الخادم
  serverQuotes.forEach(serverQuote => {
    const index = quotes.findIndex(localQuote => localQuote.id === serverQuote.id);
    if (index === -1) {
      // إذا لم يكن هناك اقتباس محلي مطابق، نضيفه
      quotes.push(serverQuote);
    } else {
      // إذا كان هناك اقتباس محلي مطابق، نحل التعارض بتفضيل بيانات الخادم
      quotes[index] = resolveConflict(quotes[index], serverQuote);
    }
  });

  // 3. حفظ الاقتباسات المحدثة في localStorage
  saveQuotes();
}

// Function to resolve conflict between local and server quotes
function resolveConflict(localQuote, serverQuote) {
  // في حالة وجود تعارض، نفضل بيانات الخادم
  return serverQuote;
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

// Function to add a new quote to the array, update the DOM, and sync with the server
async function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText && newQuoteCategory) {
    // Add new quote to the quotes array
    const newQuote = { text: newQuoteText, category: newQuoteCategory };

    // Save quote locally
    quotes.push(newQuote);
    saveQuotes();

    // Post the new quote to the server
    const serverQuote = await postQuoteToServer(newQuote);

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

// Function to export quotes as JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'quotes.json';
  downloadLink.textContent = 'Export Quotes';
  document.body.appendChild(downloadLink);

  URL.revokeObjectURL(url);
}

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert('Quotes imported successfully!');
  };
  fileReader.readAsText(event.target.files[0]);
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

  // Create input for JSON import
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.id = 'importFile';
  importInput.accept = '.json';
  importInput.addEventListener('change', importFromJsonFile);
  document.body.appendChild(importInput);

  // Add Export Quotes button to the DOM
  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export Quotes';
  exportButton.addEventListener('click', exportToJsonFile);
  document.body.appendChild(exportButton);

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

  // Sync quotes with the server
  syncQuotes();

  // Set an interval to sync quotes with the server every 30 seconds
  setInterval(syncQuotes, 30000); // 30,000 ms = 30 seconds
};
