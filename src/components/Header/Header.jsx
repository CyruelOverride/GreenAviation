import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ isAuthenticated, setIsAuthenticated, userRole, toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${sidebarOpen ? 'active' : ''}`}></span>
          <span className={`hamburger-line ${sidebarOpen ? 'active' : ''}`}></span>
          <span className={`hamburger-line ${sidebarOpen ? 'active' : ''}`}></span>
        </button>
        <Link to="/" className="logo">
          <img 
            src="/Imagenes/Green Aviation logo negro.png" 
            alt="GreenAviation Logo" 
            className="logo-image"
          />
        </Link>
      </div>
      <nav className="header-nav">
        <Link to="/estudio-teorico" className="nav-link">Mi Curso</Link>
        <Link to="/examenes" className="nav-link">Exámenes</Link>
        <Link to="/clases-online" className="nav-link">Clases Online</Link>
      </nav>
      <div className="header-right">
        {isAuthenticated ? (
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        ) : (
          <Link to="/login" className="btn-login">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;

