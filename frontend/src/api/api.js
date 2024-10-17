// api.js (if applicable)
import axios from 'axios';

const API_URL = 'http://localhost:3000';  // Adjust if needed

export const fetchMemes = async () => {
    try {
        const response = await axios.get(`${API_URL}/memes`);
        return response.data;
    } catch (error) {
        console.error('Error fetching memes:', error);
        throw error; // Allow caller to handle error
    }
};
