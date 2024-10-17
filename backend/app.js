const express = require('express');
const cors = require('cors');
const { getImagesFromDrive } = require('./google-drive');
const { uploadFile, addMeme } = require('./firebase-upload');
const { db } = require('./firebase-admin');  // Firestore database
const { calculateElo } = require('./elo-calculation');  // Import the ELO calculation function

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration for development and production
const allowedOrigins = ['http://localhost:3001'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
    res.send('Hello, World! Your server is running!');
});

// Route to fetch all memes for the leaderboard
app.get('/memes', async (req, res) => {
    try {
        const memesSnapshot = await db.collection('memes')
            .orderBy('eloScore', 'desc')
            .get();

        const memes = memesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(memes);
    } catch (error) {
        console.error('Error fetching memes:', error);
        res.status(500).json({ message: 'Error fetching memes.' });
    }
});

// Route to fetch media from Google Drive, upload to Firebase, and store metadata in Firestore
app.get('/media', async (req, res) => {
    try {
        const mediaFiles = await getImagesFromDrive();
        console.log('Media files fetched from Google Drive');

        // Upload each file to Firebase Storage, then store metadata in Firestore
        for (const file of mediaFiles) {
            const fileUrl = await uploadFile(file.path, file.id); // Upload image/video
            await addMeme(file.id, fileUrl, 400, file.mimeType); // Store meme metadata with ELO score
        }

        res.send('Media files uploaded to Firebase and metadata stored.');
    } catch (error) {
        console.error('Error fetching and uploading media files:', error);
        res.status(500).send('Error uploading media files.');
    }
});

// Route to handle match results and update ELO scores
app.post('/match-result', async (req, res) => {
    const { winnerId, loserId } = req.body;

    try {
        // Fetch the current ELO scores for both the winner and loser memes
        const winnerRef = db.collection('memes').doc(winnerId);
        const loserRef = db.collection('memes').doc(loserId);

        const winnerDoc = await winnerRef.get();
        const loserDoc = await loserRef.get();

        if (!winnerDoc.exists || !loserDoc.exists) {
            return res.status(404).json({ message: 'One or both memes not found.' });
        }

        const winnerElo = winnerDoc.data().eloScore;
        const loserElo = loserDoc.data().eloScore;

        // Calculate new ELO scores
        const { newWinnerElo, newLoserElo } = calculateElo(winnerElo, loserElo);

        // Update the ELO scores in Firestore
        await winnerRef.update({ eloScore: newWinnerElo });
        await loserRef.update({ eloScore: newLoserElo });

        res.json({
            message: 'ELO scores updated successfully!',
            winnerId,
            newWinnerElo,
            loserId,
            newLoserElo
        });
    } catch (error) {
        console.error('Error updating ELO scores:', error);
        res.status(500).json({ message: 'Error updating ELO scores.' });
    }
});

// Route to get leaderboard data with pagination
app.get('/leaderboard', async (req, res) => {
    try {
        const { page = 1, limit = 30 } = req.query;  // Default to page 1, 30 memes per page
        const memesRef = db.collection('memes').orderBy('eloScore', 'desc');
        const snapshot = await memesRef.offset((page - 1) * limit).limit(limit).get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'No memes found.' });
        }

        const memes = [];
        snapshot.forEach(doc => {
            memes.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        res.json({
            currentPage: parseInt(page),
            memes,
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard.' });
    }
});

// Route to get two random memes for a matchup
app.get('/matchup', async (req, res) => {
    try {
        const memesRef = db.collection('memes');
        const snapshot = await memesRef.get();

        if (snapshot.size < 2) {
            return res.status(404).json({ message: 'Not enough memes available.' });
        }

        // Get random documents from Firestore
        const randomIndexes = [];
        while (randomIndexes.length < 2) {
            const randomIndex = Math.floor(Math.random() * snapshot.size);
            if (!randomIndexes.includes(randomIndex)) {
                randomIndexes.push(randomIndex);
            }
        }

        const selectedMemes = randomIndexes.map(index => ({
            id: snapshot.docs[index].id,
            ...snapshot.docs[index].data(),
        }));

        res.json(selectedMemes);
    } catch (error) {
        console.error('Error fetching matchup memes:', error);
        res.status(500).json({ message: 'Error fetching matchup.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
