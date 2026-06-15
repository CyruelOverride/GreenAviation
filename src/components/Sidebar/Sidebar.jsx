import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userRole, isAuthenticated, isOpen, onClose }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    video: true,
    test: true,
    recursos: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => location.pathname === path;

  // Cerrar sidebar cuando se hace clic en un link en móvil
  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <Link 
            to="/" 
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <span className="nav-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" width="18" height="18">
                <path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-17 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/>
              </svg>
            </span>
            <span>Inicio</span>
          </Link>

          <div className="nav-section">
            <button 
              className="nav-section-header"
              onClick={() => toggleSection('video')}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <span className="nav-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" width="18" height="18">
                  <path d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zM128 240c0-8.8 7.2-16 16-16H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 64H304c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
                </svg>
              </span>
              <span>Estudio Teórico</span>
              <span className="expand-icon">{expandedSections.video ? '▼' : '▶'}</span>
            </button>
            {expandedSections.video && (
              <div className="nav-submenu">
                <Link to="/estudio-teorico" className="nav-subitem" onClick={handleLinkClick}>
                  <span className="subitem-icon">{isAuthenticated ? '•' : '🔒'}</span>
                  <span>Iniciar Próxima Lección</span>
                </Link>
                <Link to="/estudio-teorico" className="nav-subitem" onClick={handleLinkClick}>
                  <span className="subitem-icon">{isAuthenticated ? '•' : '🔒'}</span>
                  <span>Videos Teoricos del Curso</span>
                </Link>
                <Link to="/video-maniobras" className={`nav-subitem ${isActive('/video-maniobras') ? 'active' : ''}`} onClick={handleLinkClick}>
                  <span className="subitem-icon">{isAuthenticated ? '•' : '🔒'}</span>
                  <span>Videos de maniobras</span>
                </Link>
              </div>
            )}
          </div>

          <div className="nav-section">
            <button 
              className="nav-section-header"
              onClick={() => toggleSection('test')}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <span className="nav-icon">📄</span>
              <span>Preparación de Exámenes</span>
              <span className="expand-icon">{expandedSections.test ? '▼' : '▶'}</span>
            </button>
            {expandedSections.test && (
              <div className="nav-submenu">
                <Link to="/examenes" className="nav-subitem" onClick={handleLinkClick}>
                  <span className="subitem-icon">•</span>
                  <span>Iniciar nueva sesión de estudio</span>
                </Link>
                <Link to="/examenes" className="nav-subitem" onClick={handleLinkClick}>
                  <span className="subitem-icon">{isAuthenticated ? '•' : '🔒'}</span>
                  <span>Tomar examen de práctica</span>
                </Link>
                <Link to="/examenes" className="nav-subitem" onClick={handleLinkClick}>
                  <span className="subitem-icon">{isAuthenticated ? '•' : '🔒'}</span>
                  <span>Historial de Estudio</span>
                </Link>
              </div>
            )}
          </div>

          <div className="nav-section">
            <button 
              className="nav-section-header"
              onClick={() => toggleSection('recursos')}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <span className="nav-icon">✈</span>
              <span>Recursos de Entrenamiento</span>
              <span className="expand-icon">{expandedSections.recursos ? '▼' : '▶'}</span>
            </button>
            {expandedSections.recursos && (
              <div className="nav-submenu">
                <Link to="/recursos-adicionales" className="nav-subitem" onClick={handleLinkClick}>
                  <span className="subitem-icon">•</span>
                  <span>Plan de Curso (TCO)</span>
                </Link>
                <Link to="/examenes" className="nav-subitem" onClick={handleLinkClick}>
                  <span className="subitem-icon">{isAuthenticated ? '•' : '🔒'}</span>
                  <span>Examen Pre-Solo</span>
                </Link>
                <Link to="/recursos-adicionales" className="nav-subitem" onClick={handleLinkClick}>
                  <span className="subitem-icon">•</span>
                  <span>Ver Todo</span>
                </Link>
              </div>
            )}
          </div>

          {userRole === 'admin' && (
            <>
              <Link 
                to="/gestion-alumnos" 
                className={`nav-item ${isActive('/gestion-alumnos') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">👥</span>
                <span>Gestión de Alumnos</span>
              </Link>
              <Link 
                to="/gestion-vuelos" 
                className={`nav-item ${isActive('/gestion-vuelos') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">✈️</span>
                <span>Gestión de Vuelos</span>
              </Link>
              <Link 
                to="/gestion-preguntas" 
                className={`nav-item ${isActive('/gestion-preguntas') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">📝</span>
                <span>Gestión de Preguntas</span>
              </Link>
              <Link 
                to="/gestion-recursos" 
                className={`nav-item ${isActive('/gestion-recursos') ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <span className="nav-icon">📚</span>
                <span>Gestión de Recursos</span>
              </Link>
            </>
          )}

          {userRole === 'alumno' && (
            <Link 
              to="/mi-perfil" 
              className={`nav-item ${isActive('/mi-perfil') ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <span className="nav-icon">👤</span>
              <span>Mi Perfil</span>
            </Link>
          )}

          <Link 
            to="/clases-online" 
            className={`nav-item ${isActive('/clases-online') ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <span className="nav-icon">🎓</span>
            <span>Clases Online</span>
          </Link>
        </nav>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;

