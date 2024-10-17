import React from 'react';
import './Menu.css'; // Ensure CSS is correctly linked

const Menu = ({ isOpen, onToggle, onNavigate }) => {
  return (
    <div className="menu-container">
      {/* Toggle Icon */}
      <div 
        className="toggle-icon"
        onMouseEnter={onToggle}  // Trigger menu on hover
      >
        &#9776; {/* Hamburger icon */}
      </div>

      {/* Side Menu */}
      <div 
        className={`side-menu ${isOpen ? 'open' : 'closed'}`} 
        onMouseLeave={onToggle}  // Retract menu when mouse leaves
      >
        <div className="menu-item" onClick={() => onNavigate('/matchup')}> {/* Correct invocation */}
          Game
        </div>
        <div className="menu-item" onClick={() => onNavigate('/leaderboard')}> {/* Correct invocation */}
          Leaderboard
        </div>
      </div>
    </div>
  );
};

export default Menu;
