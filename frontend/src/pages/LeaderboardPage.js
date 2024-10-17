import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const [memes, setMemes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMeme, setSelectedMeme] = useState(null); // State for meme preview
  const memesPerPage = 33;

  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await axios.get('http://localhost:3000/memes');
        setMemes(response.data);
      } catch (error) {
        console.error('Error fetching memes:', error);
      }
    };

    fetchMemes();
  }, []);

  // Pagination logic
  const indexOfLastMeme = currentPage * memesPerPage;
  const indexOfFirstMeme = indexOfLastMeme - memesPerPage;
  const currentMemes = memes.slice(indexOfFirstMeme, indexOfLastMeme);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to get the ordinal suffix for the rank
  const getOrdinal = (num) => {
    const suffixes = ["th", "st", "nd", "rd"];
    const value = num % 100;
    return num + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  };

  // Handle meme click to preview
  const handleMemeClick = (meme) => {
    setSelectedMeme(meme); // Set the meme for zoomed-in preview
  };

  // Handle exiting the meme preview
  const handleExitPreview = () => {
    setSelectedMeme(null); // Exit preview mode
  };

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>

      {/* Podium */}
      <div className="podium-container">
        {memes.slice(0, 3).map((meme, index) => (
          <div key={meme.id} className={`podium podium-${index + 1}`} onClick={() => handleMemeClick(meme)}>
            <div className="podium-step">
              <div className="image-container">
                {meme.fileType === 'video' ? (
                  <video src={meme.fileUrl} className="podium-image" controls={false} autoPlay loop muted />
                ) : (
                  <img src={meme.fileUrl} alt={meme.name} className="podium-image" />
                )}
                <p className="elo-score">{getOrdinal(index + 1)} - ELO : {meme.eloScore}</p>
              </div>
              <p>{meme.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Meme Grid */}
      <h2>Other Memes</h2>
      <div className="meme-grid">
        {currentMemes.slice(3).map((meme, index) => (
          <div key={meme.id} className="meme-item" onClick={() => handleMemeClick(meme)}>
            <div className="image-container">
              {meme.fileType === 'video' ? (
                <video src={meme.fileUrl} className="meme-image" controls={false} autoPlay loop muted />
              ) : (
                <img src={meme.fileUrl} alt={meme.name} className="meme-image" />
              )}
              <p className="elo-score">
                {getOrdinal(indexOfFirstMeme + index + 4)} - ELO : {meme.eloScore}
              </p>
            </div>
            <p>{meme.name}</p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: Math.ceil(memes.length / memesPerPage) }, (_, i) => (
          <button key={i} onClick={() => paginate(i + 1)} className={currentPage === i + 1 ? 'active' : ''}>
            {i + 1}
          </button>
        ))}
      </div>

      {/* Meme Preview Modal */}
      {selectedMeme && (
        <div className="meme-preview-overlay" onClick={handleExitPreview}>
          <div className="meme-preview-content" onClick={(e) => e.stopPropagation()}>
            {selectedMeme.fileType === 'video' ? (
              <video src={selectedMeme.fileUrl} className="preview-meme" controls autoPlay />
            ) : (
              <img src={selectedMeme.fileUrl} alt={selectedMeme.name} className="preview-meme" />
            )}
          </div>
          <div className="preview-elo-score">ELO: {selectedMeme.eloScore}</div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
