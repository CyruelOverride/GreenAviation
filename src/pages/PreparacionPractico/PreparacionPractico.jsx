import React from 'react';
import { Link } from 'react-router-dom';
import './PreparacionPractico.css';

const PreparacionPractico = ({ isAuthenticated }) => {
  const resources = [
    {
      id: 1,
      title: 'Manual de Preparación para Examen Práctico',
      type: 'PDF',
      description: 'Guía completa para el examen práctico de piloto privado'
    },
    {
      id: 2,
      title: 'Checklist de Maniobras',
      type: 'PDF',
      description: 'Lista de verificación para todas las maniobras requeridas'
    },
    {
      id: 3,
      title: 'Guía de Evaluación',
      type: 'PDF',
      description: 'Criterios y estándares de evaluación del examen práctico'
    },
  ];

  const videos = [
    {
      id: 1,
      title: 'Maniobras Básicas de Vuelo',
      thumbnail: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=Video+Maniobras',
      duration: '15:30'
    },
    {
      id: 2,
      title: 'Procedimientos de Aterrizaje',
      thumbnail: 'https://via.placeholder.com/300x200/10b981/ffffff?text=Video+Aterrizaje',
      duration: '12:45'
    },
    {
      id: 3,
      title: 'Navegación y Planificación',
      thumbnail: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Video+Navegacion',
      duration: '18:20'
    },
    {
      id: 4,
      title: 'Emergencias y Procedimientos',
      thumbnail: 'https://via.placeholder.com/300x200/f59e0b/ffffff?text=Video+Emergencias',
      duration: '20:10'
    },
  ];

  const tips = [
    'Practica todas las maniobras antes del examen',
    'Revisa el checklist completo antes de cada vuelo',
    'Familiarízate con el área de examen',
    'Mantén la calma y sigue los procedimientos',
    'Comunica claramente con el examinador',
  ];

  if (!isAuthenticated) {
    return (
      <div className="preparacion-practico">
        <h1 className="page-title">Preparación para Examen Práctico</h1>
        <div className="info-card-unauthenticated">
          <h2>✈️ Preparación Examen Práctico</h2>
          <p>En esta sección encontrarás:</p>
          <ul>
            <li>Manuales descargables para el examen práctico</li>
            <li>Videos explicativos de maniobras</li>
            <li>Tips y recomendaciones para la evaluación práctica</li>
            <li>Checklist de maniobras</li>
            <li>Guía de evaluación y criterios</li>
            <li>Integración con Google Drive para videos</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder a la preparación del examen práctico</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="preparacion-practico">
      <h1 className="page-title">Preparación para Examen Práctico</h1>
      <p className="page-description">
        Todo lo que necesitas para prepararte y aprobar tu examen práctico de piloto privado.
      </p>

      <div className="manuals-section">
        <h2 className="section-title">Manuales Descargables</h2>
        <div className="manuals-grid">
          {resources.map(resource => (
            <div key={resource.id} className="manual-card">
              <div className="manual-icon">📘</div>
              <div className="manual-content">
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div className="manual-meta">
                  <span className="resource-type">{resource.type}</span>
                </div>
                <button className="btn-download">Descargar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="videos-section">
        <h2 className="section-title">Videos Explicativos</h2>
        <p className="section-note">
          * Los videos se integran con Google Drive para almacenamiento
        </p>
        <div className="videos-grid">
          {videos.map(video => (
            <div key={video.id} className="video-card">
              <div className="video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
                <div className="play-overlay">
                  <span className="play-icon">▶</span>
                </div>
                <div className="video-duration">{video.duration}</div>
              </div>
              <h3>{video.title}</h3>
            </div>
          ))}
        </div>
      </div>

      <div className="tips-section">
        <h2 className="section-title">Tips y Recomendaciones</h2>
        <div className="tips-list">
          {tips.map((tip, index) => (
            <div key={index} className="tip-card">
              <div className="tip-number">{index + 1}</div>
              <p>{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreparacionPractico;

