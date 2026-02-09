import React from 'react';
import { Link } from 'react-router-dom';
import './ClasesOnline.css';

const ClasesOnline = ({ isAuthenticated }) => {
  const upcomingClasses = [
    {
      id: 1,
      title: 'Clase: Introducción a la Meteorología',
      date: '2024-02-15',
      time: '18:00',
      platform: 'Zoom',
      link: 'https://zoom.us/j/123456789',
      module: 'Módulo 3'
    },
    {
      id: 2,
      title: 'Clase: Navegación y Planificación',
      date: '2024-02-20',
      time: '18:00',
      platform: 'Google Meet',
      link: 'https://meet.google.com/abc-defg-hij',
      module: 'Módulo 4'
    },
    {
      id: 3,
      title: 'Clase: Regulaciones y Procedimientos',
      date: '2024-02-25',
      time: '18:00',
      platform: 'Zoom',
      link: 'https://zoom.us/j/987654321',
      module: 'Módulo 5'
    },
  ];

  const pastClasses = [
    {
      id: 4,
      title: 'Clase: Principios de Vuelo',
      date: '2024-02-10',
      time: '18:00',
      platform: 'Zoom',
      recording: 'https://drive.google.com/recording1',
      module: 'Módulo 2'
    },
    {
      id: 5,
      title: 'Clase: Introducción a la Aviación',
      date: '2024-02-05',
      time: '18:00',
      platform: 'Google Meet',
      recording: 'https://drive.google.com/recording2',
      module: 'Módulo 1'
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="clases-online">
        <h1 className="page-title">Clases Online</h1>
        <div className="info-card-unauthenticated">
          <h2>🎓 Clases Online</h2>
          <p>En esta sección encontrarás:</p>
          <ul>
            <li>Acceso a enlaces de plataformas de aula virtual (Zoom, Google Meet)</li>
            <li>Organización por fechas o módulos</li>
            <li>Acceso rápido desde el panel del alumno</li>
            <li>Grabaciones de clases anteriores</li>
            <li>Calendario de próximas clases</li>
            <li>Información de plataformas y horarios</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder a las clases online</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="clases-online">
      <h1 className="page-title">Clases Online</h1>
      <p className="page-description">
        Accede a las clases en vivo y grabaciones de sesiones anteriores.
      </p>

      <div className="upcoming-section">
        <h2 className="section-title">Próximas Clases</h2>
        <div className="classes-grid">
          {upcomingClasses.map(classItem => (
            <div key={classItem.id} className="class-card upcoming">
              <div className="class-header">
                <div className="class-badge upcoming-badge">Próxima</div>
                <span className="class-module">{classItem.module}</span>
              </div>
              <h3>{classItem.title}</h3>
              <div className="class-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{formatDate(classItem.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span>{classItem.time} (GMT-3)</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💻</span>
                  <span>{classItem.platform}</span>
                </div>
              </div>
              <a 
                href={classItem.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-join"
              >
                Unirse a la Clase
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="past-section">
        <h2 className="section-title">Clases Anteriores</h2>
        <div className="classes-grid">
          {pastClasses.map(classItem => (
            <div key={classItem.id} className="class-card past">
              <div className="class-header">
                <div className="class-badge past-badge">Finalizada</div>
                <span className="class-module">{classItem.module}</span>
              </div>
              <h3>{classItem.title}</h3>
              <div className="class-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{formatDate(classItem.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">💻</span>
                  <span>{classItem.platform}</span>
                </div>
              </div>
              <a 
                href={classItem.recording} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-watch"
              >
                Ver Grabación
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="info-section">
        <div className="info-card">
          <h3>Plataformas de Videoconferencia</h3>
          <p>
            Las clases se realizan a través de Zoom o Google Meet. Los enlaces de acceso 
            estarán disponibles antes de cada sesión. Las grabaciones se almacenan en 
            Google Drive y estarán disponibles después de cada clase.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClasesOnline;

