const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json'); // Path to your Firebase service account

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "meme-ranking.appspot.com",  // Your Firebase Storage bucket name
    databaseURL: "https://meme-ranking-default-rtdb.europe-west1.firebasedatabase.app"  // Your Firestore database URL
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket };
