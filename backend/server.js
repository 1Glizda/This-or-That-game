const express = require('express');
const { google } = require('googleapis');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Hello, World! Your server is running!');
});

// Route to handle OAuth callback
app.get('/oauth2callback', (req, res) => {
    // Process the code received from Google
    const code = req.query.code; // Get the code from query parameters
    console.log('Code received:', code);
    // Here, you would typically exchange the code for tokens
    res.send('OAuth callback received!'); // Send a response back to the browser
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
