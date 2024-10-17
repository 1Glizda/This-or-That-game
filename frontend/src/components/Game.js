import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MemeCard from './MemeCard';

function Game() {
    const [memes, setMemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemes();
    }, []);

    const fetchMemes = async () => {
        try {
            const res = await axios.get('http://localhost:3000/matchup');
            setMemes(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching memes:', error);
        }
    };

    const handleVote = async (winnerId, loserId) => {
        try {
            await axios.post('http://localhost:3000/match-result', {
                winnerId,
                loserId
            });
            fetchMemes(); // Fetch next matchup
        } catch (error) {
            console.error('Error submitting vote:', error);
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="game-container">
            {memes.length === 2 && (
                <>
                    <div className="meme-box" onClick={() => handleVote(memes[0].id, memes[1].id)}>
                        <MemeCard meme={memes[0]} />
                    </div>
                    <div className="meme-box" onClick={() => handleVote(memes[1].id, memes[0].id)}>
                        <MemeCard meme={memes[1]} />
                    </div>
                </>
            )}
        </div>
    );
}

export default Game;
