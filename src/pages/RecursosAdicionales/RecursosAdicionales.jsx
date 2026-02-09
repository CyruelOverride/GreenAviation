import React from 'react';
import { Link } from 'react-router-dom';
import './RecursosAdicionales.css';

const RecursosAdicionales = ({ isAuthenticated }) => {
  const resources = [
    { id: 1, name: 'AIP', type: 'PDF', size: '2.5 MB' },
    { id: 2, name: 'Manual Operativo', type: 'PDF', size: '4.2 MB' },
    { id: 3, name: 'Manual del Avión', type: 'PDF', size: '3.8 MB' },
    { id: 4, name: 'Manual de Maniobras', type: 'PDF', size: '2.1 MB' },
    { id: 5, name: 'LAR 91 y 61', type: 'PDF', size: '1.5 MB' },
    { id: 6, name: 'Otros', type: 'PDF', size: '1.0 MB' },
  ];

  const handleDownload = (resourceName) => {
    // Función para manejar la descarga
    alert(`Descargando ${resourceName}...`);
  };

  if (!isAuthenticated) {
    return (
      <div className="recursos-adicionales">
        <h1 className="page-title">Recursos Adicionales</h1>
        <div className="info-card-unauthenticated">
          <h2>📚 Biblioteca de Recursos</h2>
          <p>En esta sección encontrarás:</p>
          <ul>
            <li>AIP</li>
            <li>Manual Operativo</li>
            <li>Manual del Avión</li>
            <li>Manual de Maniobras</li>
            <li>LAR 91 y 61</li>
            <li>Otros recursos</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder a los recursos adicionales</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="recursos-adicionales">
      <h1 className="page-title">Recursos Adicionales</h1>
      <p className="page-description">
        Accede a los recursos y manuales complementarios para tu formación.
      </p>

      <div className="resources-container">
        <div className="resources-section">
          <div className="resources-list">
            {resources.map(resource => (
              <div key={resource.id} className="resource-card">
                <div className="resource-icon">📄</div>
                <div className="resource-info">
                  <h3>{resource.name}</h3>
                  <div className="resource-meta">
                    <span className="resource-type">{resource.type}</span>
                    <span className="resource-size">{resource.size}</span>
                  </div>
                </div>
                <button 
                  className="btn-download"
                  onClick={() => handleDownload(resource.name)}
                >
                  Descargar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecursosAdicionales;
