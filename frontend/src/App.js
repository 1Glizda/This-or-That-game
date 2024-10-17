import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom'; // Ensure useNavigate is correctly imported
import Menu from './components/Menu'; // Adjust path if necessary
import GamePage from './pages/GamePage'; // Ensure path is correct
import LeaderboardPage from './pages/LeaderboardPage'; // Ensure path is correct
import './App.css';

const App = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu starts closed
    const navigate = useNavigate(); // Hook to handle navigation

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState); // Toggle menu open/close
    };

    const handleNavigation = (path) => {
        navigate(path); // Navigate to the given path
        setIsMenuOpen(false); // Optionally close the menu after navigation
    };

    return (
        <div className="app-background">
            <Menu isOpen={isMenuOpen} onToggle={toggleMenu} onNavigate={handleNavigation} /> {/* Pass handleNavigation */}
            <div className="main-content">
                <Routes>
                    <Route path="/matchup" element={<GamePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route path="/" element={<h1>Welcome to Meme Ranking Battle!</h1>} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
