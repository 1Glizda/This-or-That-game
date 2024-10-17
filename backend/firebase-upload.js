const { db, bucket } = require('./firebase-admin');

// Upload the file (image or video) to Firebase Storage
async function uploadFile(filePath, memeId, retries = 3) {
    const fileExtension = filePath.split('.').pop().toLowerCase();
    
    let contentType = '';
    if (fileExtension === 'jpg' || fileExtension === 'jpeg') contentType = 'image/jpeg';
    else if (fileExtension === 'png') contentType = 'image/png';
    else if (fileExtension === 'gif') contentType = 'image/gif';
    else if (fileExtension === 'mp4') contentType = 'video/mp4';
    else if (fileExtension === 'mov') contentType = 'video/quicktime';
    else throw new Error(`Unsupported file type: ${fileExtension}`);

    const destination = `memes/${memeId}.${fileExtension}`;
    let attempt = 0;

    while (attempt < retries) {
        try {
            console.log(`Uploading file: ${filePath}`);
            
            // Check if the file is already uploaded
            const exists = await bucket.file(destination).exists();
            if (exists[0]) {
                console.log(`File ${filePath} already exists in Firebase Storage. Skipping upload.`);
                return `https://storage.googleapis.com/${bucket.name}/memes/${memeId}.${fileExtension}`;
            }

            // Upload the file
            await bucket.upload(filePath, {
                destination: destination,
                metadata: { contentType: contentType },
            });

            console.log(`File ${filePath} uploaded successfully.`);

            // Delete the local file after uploading
            try {
                fs.unlinkSync(filePath);  // Delete the local file
                console.log(`Deleted local file: ${filePath}`);
            } catch (err) {
                console.error(`Failed to delete local file ${filePath}:`, err);
            }

            return `https://storage.googleapis.com/${bucket.name}/memes/${memeId}.${fileExtension}`;
        } catch (error) {
            attempt++;
            console.error(`Error uploading file ${filePath}. Attempt ${attempt} of ${retries}`);
            if (attempt === retries) throw error;
        }
    }
}

// Add meme details (ELO score, file URL, and type) to Firestore
async function addMeme(memeId, fileUrl, eloScore, mimeType) {
    const memeRef = db.collection('memes').doc(memeId);

    const doc = await memeRef.get();
    if (doc.exists) {
        console.log(`Meme with ID ${memeId} already exists. Skipping addition.`);
        return; // Skip adding the meme if it already exists
    }

    // Determine fileType based on mimeType
    const fileType = mimeType.startsWith('image/') ? 'image' : mimeType.startsWith('video/') ? 'video' : null;

    if (!fileType) {
        throw new Error(`Unsupported file type: ${mimeType}`);
    }

    await memeRef.set({
        id: memeId,
        eloScore: eloScore,
        fileUrl: fileUrl,
        fileType: fileType,  // Store 'image' or 'video'
    });
}


module.exports = {uploadFile, addMeme };