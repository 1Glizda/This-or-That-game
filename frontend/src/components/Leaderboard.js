import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MemeCard from './MemeCard';

function Leaderboard() {
    const [memes, setMemes] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard(page);
    }, [page]);

    const fetchLeaderboard = async (page) => {
        try {
            const res = await axios.get(`http://localhost:3000/leaderboard?page=${page}`);
            setMemes(res.data.memes);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        }
    };

    const renderPodium = () => {
        return (
            <div className="podium">
                {memes.slice(0, 3).map((meme, index) => (
                    <div key={meme.id} className={`podium-place place-${index + 1} `}>
                        <MemeCard meme={meme} />
                        <p>ELO: {meme.eloScore}</p>
                    </div>
                ))}
            </div>
        );
    };

    const renderList = () => {
        return memes.slice(3).map((meme, index) => (
            <div key={meme.id} className="meme-list-item">
                <span>{index + 4}. </span>
                <MemeCard meme={meme} />
                <span>ELO: {meme.eloScore}</span>
            </div>
        ));
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="leaderboard-container">
            {renderPodium()}
            <div className="meme-list">
                {renderList()}
            </div>
            <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Previous
                </button>
                <button onClick={() => setPage(page + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default Leaderboard;
