const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const prompt = require('prompt-sync')(); // For user input


const CREDENTIALS_PATH = './config/credentials.json'; // Path to your credentials file
const TOKEN_PATH = './config/token.json'; // Path to your token file
const FOLDER_ID = '1g8VnsQj3NgHjg1cPa745bhHKebpilWNV'; // Replace with your Google Drive folder ID

// Load client secrets from a local file
async function loadCredentials() {
    const content = fs.readFileSync(CREDENTIALS_PATH);
    return JSON.parse(content);
}

// Authorize a client with credentials, returning an authorized client
async function authorize() {
    const credentials = await loadCredentials();
    const { client_secret, client_id, auth_uri, token_uri } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        'http://localhost:3000' // Update to match your redirect URI
    );

    // Check if we have previously stored a token
    if (fs.existsSync(TOKEN_PATH)) {
        const token = fs.readFileSync(TOKEN_PATH);
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    } else {
        await getAccessToken(oAuth2Client); // Generate a new token
        return oAuth2Client;
    }
}

// Get and store new token after prompting for user authorization
async function getAccessToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const code = prompt('Enter the code from that page here: '); // Get code from user
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens)); // Save token to file
    console.log('Token stored to', TOKEN_PATH);
}

// Fetch images from Google Drive
async function getImagesFromDrive() {
    const auth = await authorize();
    const drive = google.drive({ version: 'v3', auth });
    
    let allFiles = [];
    let pageToken = null;

    do {
        const res = await drive.files.list({
            q: `'${FOLDER_ID}' in parents and (mimeType contains 'image/' or mimeType contains 'video/')`,
            fields: 'files(id, name, mimeType), nextPageToken',
            pageToken: pageToken,
        });

        const files = res.data.files;
        allFiles = allFiles.concat(files); // Append new files to the list
        pageToken = res.data.nextPageToken; // Get the token for the next page
    } while (pageToken); // Continue until there are no more pages

    console.log(`Total files retrieved: ${allFiles.length}`);
    return await downloadFiles(drive, allFiles); // Download in batches
}

async function downloadSingleFile(drive, fileId, fileName) {
    const destPath = path.join(__dirname, 'media', fileName); // Path to save files in the 'media' folder

    // Check if the file already exists
    if (fs.existsSync(destPath)) {
        console.log(`File ${fileName} already exists. Skipping download.`);
        return true; // File already exists, return true
    }

    const dest = fs.createWriteStream(destPath); // Create a writable stream for the new file

    try {
        // Get the file stream from Google Drive
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        }, { responseType: 'stream' });

        // Check the response status
        if (response.status !== 200) {
            console.error(`Error downloading ${fileName}: HTTP status ${response.status}`);
            return false; // Return false on HTTP error
        }

        // Pipe the response stream to the destination file
        response.data
            .on('end', () => {
                console.log(`Downloaded ${fileName}`);
            })
            .on('error', (err) => {
                console.error(`Error downloading ${fileName}:`, err);
            })
            .pipe(dest);

        // Wait for the download to complete
        return new Promise((resolve, reject) => {
            dest.on('finish', () => resolve(true));
            dest.on('error', (err) => reject(err));
        });
        
    } catch (error) {
        console.error(`Error during file download for ${fileName}: ${error.message}`);
        return false; // Return false on error
    }
}

// Function to download a batch of files from Google Drive
async function downloadFiles(drive, files, batchSize = 20) {
    if (!Array.isArray(files) || files.length === 0) {
        console.log('No files to download.');
        return []; // Return early if files is not an array or is empty
    }

    console.log(`Total files to download: ${files.length}`); // Log the total count of files
    const downloadedFiles = [];
    const failedDownloads = [];

    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1} with ${batch.length} files.`);

        try {
            // Process each file in the batch
            const results = await Promise.all(batch.map(async (file) => {
                const success = await downloadSingleFile(drive, file.id, file.name);
                if (success) {
                    downloadedFiles.push({
                        id: file.id,
                        path: path.join(__dirname, 'media', file.name),
                        mimeType: file.mimeType,
                    });
                } else {
                    failedDownloads.push(file); // Keep track of failed downloads
                }
            }));

            console.log(`Batch ${Math.floor(i / batchSize) + 1} processed successfully.`);
        } catch (error) {
            console.error(`Error processing batch ${Math.floor(i / batchSize) + 1}:`, error);
        }

        // Optional: Add a delay between batches to avoid hitting API limits
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 second
    }

    // Log total downloaded and failed files
    console.log(`Successfully downloaded ${downloadedFiles.length} files.`);
    if (failedDownloads.length > 0) {
        console.log(`Failed to download ${failedDownloads.length} files:`, failedDownloads.map(f => f.name));
    }

    return downloadedFiles;
}



module.exports = { getImagesFromDrive };