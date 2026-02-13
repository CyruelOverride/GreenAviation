import React from 'react';
import { Link } from 'react-router-dom';
import './EstudioTeorico.css';

const EstudioTeorico = ({ isAuthenticated, userRole }) => {
  // Admin tiene el curso completo, alumnos tienen progreso variable
  // Leer progreso de localStorage si existe, sino usar valor por defecto
  const getInitialProgress = () => {
    if (userRole === 'admin') return 100;
    const savedProgress = localStorage.getItem('userProgress');
    return savedProgress ? parseInt(savedProgress) : 35;
  };
  
  const [progress, setProgress] = React.useState(getInitialProgress);

  // Actualizar progreso cuando cambie el userRole o se cargue la página
  React.useEffect(() => {
    if (userRole === 'admin') {
      setProgress(100);
    } else {
      const savedProgress = localStorage.getItem('userProgress');
      if (savedProgress) {
        setProgress(parseInt(savedProgress));
      }
    }
  }, [userRole]);

  // Links de Google Drive para videos
  const driveLinks = [
    { 
      id: 1, 
      title: 'Videos Curso Teórico', 
      driveLink: 'https://drive.google.com/drive/folders/11LNAVWA0G2FrWJO6gB0UbA-EDIoODQJn?usp=drive_link',
      icon: '📚'
    },
    { 
      id: 2, 
      title: 'Videos Maniobras y Vuelo', 
      driveLink: 'https://drive.google.com/drive/folders/TU_FOLDER_ID_MANIOBRAS',
      icon: '✈️'
    },
    { 
      id: 3, 
      title: 'Otros Videos', 
      driveLink: 'https://drive.google.com/drive/folders/TU_FOLDER_ID_OTROS',
      icon: '🎥'
    },
  ];

  if (!isAuthenticated) {
    return (
      <div className="estudio-teorico">
        <h1 className="page-title">Estudio Teórico</h1>
        <div className="info-card-unauthenticated">
          <h2>📚 Contenido del Curso</h2>
          <p>En esta sección encontrarás:</p>
          <ul>
            <li>Manual de Piloto Privado en formato digital</li>
            <li>Videos del curso organizados por categorías</li>
            <li>Material integrado con Google Drive</li>
            <li>Seguimiento de tu progreso académico</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder al contenido completo</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="estudio-teorico">
      <h1 className="page-title">Estudio Teórico</h1>
      
      <div className="progress-section">
        <div className="progress-header">
          <h2>Tu Progreso</h2>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="content-section">
        <div className="manual-section">
          <h2>Manual de Piloto</h2>
          <div className="manual-card">
            <div className="manual-icon">
              <img 
                src="/Imagenes/Logo manual.png" 
                alt="Logo Manual Piloto Privado"
                className="manual-logo"
              />
            </div>
            <div className="manual-info">
              <h3>Manual de Piloto Privado</h3>
              <p>Accede al manual completo en formato digital</p>
            </div>
            <div className="manual-button-container">
              <a 
                href="/documentos/MANUAL PILOTO PRIVADO 2026-CON VIDEOS FINAL.pdf"
                download="MANUAL-PILOTO-PRIVADO-2026-CON-VIDEOS-FINAL.pdf"
                className="btn-primary"
              >
                Descargar Manual
              </a>
            </div>
          </div>
        </div>

        <div className="drive-links-section">
          <h2>Videos en Google Drive</h2>
          <div className="drive-links-list">
            {driveLinks.map(link => (
              <div key={link.id} className="drive-link-card">
                <div className="drive-link-icon">{link.icon}</div>
                <div className="drive-link-content">
                  <h3>{link.title}</h3>
                  <a 
                    href={link.driveLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-drive-link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}>
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.414 1.414-3.154-3.154-3.154 3.154-1.414-1.414L12 4.586l5.568 5.574zM6.432 15.84l1.414-1.414 3.154 3.154 3.154-3.154 1.414 1.414L12 19.414l-5.568-5.574z"/>
                    </svg>
                    Abrir en Google Drive
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstudioTeorico;

