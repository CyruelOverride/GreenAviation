import React from 'react';
import { Link } from 'react-router-dom';
import './RecursosAdicionales.css';

const RecursosAdicionales = ({ isAuthenticated }) => {
  const resources = [
    { 
      id: 1, 
      name: 'Código Aeronáutico', 
      type: 'PDF', 
      size: '0.13 MB',
      filePath: '/documentos/CODIGO AERONAUTICO.pdf'
    },
    { 
      id: 2, 
      name: 'LAR 61 - Licencias', 
      type: 'PDF', 
      size: '1.96 MB',
      filePath: '/documentos/LAR 61 LICENCIAS.pdf'
    },
    { 
      id: 3, 
      name: 'Manual del Piloto Privado', 
      type: 'PDF', 
      size: '18.89 MB',
      filePath: '/documentos/MANUAL DEL PILOTO PRIVADO.pdf'
    },
  ];

  const handleDownload = (resource) => {
    // Codificar la URL para manejar espacios y caracteres especiales
    const encodedPath = encodeURI(resource.filePath);
    // Crear un link temporal para descargar el archivo
    const link = document.createElement('a');
    link.href = encodedPath;
    link.download = `${resource.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="recursos-adicionales">
        <h1 className="page-title">Recursos Adicionales</h1>
        <div className="info-card-unauthenticated">
          <h2>📚 Biblioteca de Recursos</h2>
          <p>En esta sección encontrarás:</p>
          <ul>
            <li>Código Aeronáutico</li>
            <li>LAR 61 - Licencias</li>
            <li>Manual del Piloto Privado</li>
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
                <a 
                  href={encodeURI(resource.filePath)}
                  download={`${resource.name}.pdf`}
                  className="btn-download"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(resource);
                  }}
                >
                  Descargar
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecursosAdicionales;
