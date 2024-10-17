import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GamePage.css';

const GamePage = () => {
  const [currentMatchup, setCurrentMatchup] = useState([]);
  const [eloChange, setEloChange] = useState({ winner: 0, loser: 0 });
  const [showEloChange, setShowEloChange] = useState(false);
  const [winnerId, setWinnerId] = useState(null);
  const [selectedMeme, setSelectedMeme] = useState(null); // For meme preview
  const [votingId, setVotingId] = useState(null); // Track the ID of the currently voting meme

  // Fetch matchup memes on component mount
  const fetchMatchup = async () => {
    try {
      const response = await axios.get('http://localhost:3000/matchup');
      setCurrentMatchup(response.data);
      setShowEloChange(false);
      setEloChange({ winner: 0, loser: 0 });
      setWinnerId(null);
      setSelectedMeme(null); // Reset meme preview when a new matchup loads
      setVotingId(null); // Reset voting state
    } catch (error) {
      console.error('Error fetching matchup:', error);
    }
  };

  useEffect(() => {
    fetchMatchup();
  }, []);

  // Handle meme click for preview
  const handleMemeClick = (meme) => {
    setSelectedMeme(meme); // Open the preview modal
  };

  // Close the meme preview
  const handleExitPreview = () => {
    setSelectedMeme(null);
  };

  // Handle voting logic
  const handleVote = async (selectedWinnerId) => {
    const loserId = currentMatchup[0].id === selectedWinnerId ? currentMatchup[1].id : currentMatchup[0].id;

    try {
      const response = await axios.post('http://localhost:3000/match-result', {
        winnerId: selectedWinnerId,
        loserId,
      });

      const { newWinnerElo, newLoserElo } = response.data;

      const winnerEloChange = newWinnerElo - currentMatchup.find(meme => meme.id === selectedWinnerId).eloScore;
      const loserEloChange = newLoserElo - currentMatchup.find(meme => meme.id === loserId).eloScore;

      setEloChange({ winner: winnerEloChange, loser: loserEloChange });
      setCurrentMatchup(currentMatchup.map(meme => 
        meme.id === selectedWinnerId ? { ...meme, eloScore: newWinnerElo } : { ...meme, eloScore: newLoserElo }
      ));
      setWinnerId(selectedWinnerId);
      setShowEloChange(true);

      // After 1 second, fetch a new matchup
      setTimeout(() => {
        fetchMatchup();
      }, 1000);

    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  // Handle the initial vote button click
  const handleVoteClick = (memeId) => {
    if (votingId === memeId) {
      // If the same meme is clicked, reset votingId (remove Sure?)
      setVotingId(null);
    } else {
      // Set the votingId to the clicked meme
      setVotingId(memeId);
    }
  };

  // Confirm vote
  const confirmVoteHandler = () => {
    handleVote(votingId);
    setVotingId(null); // Reset the voting ID after confirming the vote
  };

  return (
    <div className="game-container">
      {currentMatchup.length === 2 ? (
        <>
          <div className="matchup">
            {currentMatchup.map((meme) => {
              const isWinner = meme.id === winnerId;
              const isLoser = meme.id !== winnerId && showEloChange;

              return (
                <div key={meme.id} className="meme-box" onClick={() => handleMemeClick(meme)}>
                  {meme.fileType === 'image' ? (
                    <img src={meme.fileUrl} alt={`Meme ${meme.id}`} />
                  ) : (
                    <video
                      src={meme.fileUrl}
                      controls={false}
                      autoPlay
                      loop
                      muted={true}
                      className="video-meme"
                    />
                  )}
                  <p>
                    ELO: {meme.eloScore}
                    {showEloChange && (
                      <span className={isWinner ? 'elo-up' : isLoser ? 'elo-down' : ''}>
                        {isWinner ? `+${eloChange.winner}` : isLoser ? `${eloChange.loser}` : ''}
                      </span>
                    )}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Voting Buttons for each Meme */}
          <div className="vote-container">
            {currentMatchup.map((meme) => (
              <div className="vote-wrapper" key={meme.id}>
                <button
                  className="vote-button"
                  onClick={() => handleVoteClick(meme.id)}
                >
                  VOTE!
                </button>
                {/* Show Sure? button only if this meme is selected for voting */}
                {votingId === meme.id && (
                  <button
                    className="confirm-button"
                    onClick={confirmVoteHandler}
                  >
                    Sure?
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <h2>Loading Matchup...</h2>
      )}

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

export default GamePage;
