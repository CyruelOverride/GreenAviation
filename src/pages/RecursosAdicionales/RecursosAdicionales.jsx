import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './RecursosAdicionales.css';

const RecursosAdicionales = ({ isAuthenticated }) => {
  const [activeCategory, setActiveCategory] = useState('todos');

  // Organizar recursos por categorías
  const recursosPorCategoria = {
    manuales: [
    { 
      id: 1, 
        name: 'Manual del Piloto Privado', 
        type: 'PDF', 
        size: '18.89 MB',
        filePath: '/documentos/MANUAL DEL PILOTO PRIVADO.pdf',
        category: 'manuales'
      },
      { 
        id: 2, 
        name: 'Manual Piloto Privado 2026 (con Videos)', 
        type: 'PDF', 
        size: '25 MB',
        filePath: '/documentos/MANUAL PILOTO PRIVADO 2026-CON VIDEOS FINAL.pdf',
        category: 'manuales'
      },
      { 
        id: 3, 
        name: 'Manual Piloto Privado 2026 (con Videos) - Word', 
        type: 'DOCX', 
        size: '30 MB',
        filePath: '/documentos/MANUAL PILOTO PRIVADO 2026-CON VIDEOS FINAL.docx',
        category: 'manuales'
      },
    ],
    reglamentos: [
      { 
        id: 4, 
      name: 'Código Aeronáutico', 
      type: 'PDF', 
      size: '0.13 MB',
        filePath: '/documentos/CODIGO AERONAUTICO.pdf',
        category: 'reglamentos'
    },
    { 
        id: 5, 
      name: 'LAR 61 - Licencias', 
      type: 'PDF', 
      size: '1.96 MB',
        filePath: '/documentos/LAR 61 LICENCIAS.pdf',
        category: 'reglamentos'
      },
      { 
        id: 6, 
        name: 'LAR 91 - Operaciones de Vuelo', 
        type: 'PDF', 
        size: '2.5 MB',
        filePath: '/documentos/LAR 91 OPERACIONES DE VUELO.pdf',
        category: 'reglamentos'
      },
    ],
    aip: {
      gen: [
        { 
          id: 7, 
          name: 'AIP GEN 0', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/1 GEN/Gen0 (3).pdf',
          category: 'aip'
        },
        { 
          id: 8, 
          name: 'AIP GEN 1', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/1 GEN/Gen1.pdf',
          category: 'aip'
        },
        { 
          id: 9, 
          name: 'AIP GEN 4', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/1 GEN/Gen4.pdf',
          category: 'aip'
        },
      ],
      ad: [
        { 
          id: 10, 
          name: 'AIP AD 0', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad0.pdf',
          category: 'aip'
        },
        { 
          id: 11, 
          name: 'AIP AD 1', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad1 (2).pdf',
          category: 'aip'
        },
        { 
          id: 12, 
          name: 'AIP AD 2-1', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-1.pdf',
          category: 'aip'
        },
        { 
          id: 13, 
          name: 'AIP AD 2-2', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-2 (2).pdf',
          category: 'aip'
        },
        { 
          id: 14, 
          name: 'AIP AD 2-3', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-3.pdf',
          category: 'aip'
        },
        { 
          id: 15, 
          name: 'AIP AD 2-4', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-4.pdf',
          category: 'aip'
        },
        { 
          id: 16, 
          name: 'AIP AD 2-5', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-5 (2).pdf',
          category: 'aip'
        },
        { 
          id: 17, 
          name: 'AIP AD 2-6', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-6 (2).pdf',
          category: 'aip'
        },
        { 
          id: 18, 
          name: 'AIP AD 2-7', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-7.pdf',
          category: 'aip'
        },
        { 
          id: 19, 
          name: 'AIP AD 2-8', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-8 (2).pdf',
          category: 'aip'
        },
        { 
          id: 20, 
          name: 'AIP AD 2-9', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-9 (4).pdf',
          category: 'aip'
        },
        { 
          id: 21, 
          name: 'AIP AD 2-10', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-10 (2).pdf',
          category: 'aip'
        },
        { 
          id: 22, 
          name: 'AIP AD 2-11', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-11.pdf',
          category: 'aip'
        },
        { 
          id: 23, 
          name: 'AIP AD 2-12', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-12.pdf',
          category: 'aip'
        },
        { 
          id: 24, 
          name: 'AIP AD 2-13', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-13 (2).pdf',
          category: 'aip'
        },
        { 
          id: 25, 
          name: 'AIP AD 2-14 SALTO', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-14 SALTO.pdf',
          category: 'aip'
        },
        { 
          id: 26, 
          name: 'AIP AD 2-15', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-15.pdf',
          category: 'aip'
        },
        { 
          id: 27, 
          name: 'AIP AD 2-16', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-16.pdf',
          category: 'aip'
        },
        { 
          id: 28, 
          name: 'AIP AD 2-17', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/2 AD/Ad2-17.pdf',
          category: 'aip'
        },
      ],
      enr: [
        { 
          id: 29, 
          name: 'AIP ENR 0', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/3 ENR/Enr0.pdf',
          category: 'aip'
        },
        { 
          id: 30, 
          name: 'AIP ENR 1', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/3 ENR/Enr1 (2).pdf',
          category: 'aip'
        },
        { 
          id: 31, 
          name: 'AIP ENR 2', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/3 ENR/Enr2.pdf',
          category: 'aip'
        },
        { 
          id: 32, 
          name: 'AIP ENR 3', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/3 ENR/Enr3 (2).pdf',
          category: 'aip'
        },
        { 
          id: 33, 
          name: 'AIP ENR 4', 
          type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/3 ENR/Enr4 (2).pdf',
          category: 'aip'
        },
        { 
          id: 34, 
          name: 'AIP ENR 5', 
      type: 'PDF', 
          size: 'N/A',
          filePath: '/documentos/AIP/3 ENR/Enr5 (2).pdf',
          category: 'aip'
        },
      ],
    }
  };

  // Obtener todos los recursos según la categoría activa
  const getResources = () => {
    if (activeCategory === 'todos') {
      return [
        ...recursosPorCategoria.manuales,
        ...recursosPorCategoria.reglamentos,
        ...recursosPorCategoria.aip.gen,
        ...recursosPorCategoria.aip.ad,
        ...recursosPorCategoria.aip.enr,
      ];
    } else if (activeCategory === 'manuales') {
      return recursosPorCategoria.manuales;
    } else if (activeCategory === 'reglamentos') {
      return recursosPorCategoria.reglamentos;
    } else if (activeCategory === 'aip-gen') {
      return recursosPorCategoria.aip.gen;
    } else if (activeCategory === 'aip-ad') {
      return recursosPorCategoria.aip.ad;
    } else if (activeCategory === 'aip-enr') {
      return recursosPorCategoria.aip.enr;
    }
    return [];
  };

  const handleDownload = (resource) => {
    const encodedPath = encodeURI(resource.filePath);
    const link = document.createElement('a');
    link.href = encodedPath;
    const fileExtension = resource.filePath.split('.').pop().toLowerCase();
    link.download = `${resource.name}.${fileExtension}`;
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
            <li>Manuales de Piloto Privado</li>
            <li>Reglamentos Aeronáuticos (LAR 61, LAR 91, Código Aeronáutico)</li>
            <li>Publicaciones de Información Aeronáutica (AIP)</li>
            <li>Documentos organizados por categorías</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder a los recursos adicionales</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  const resources = getResources();

  return (
    <div className="recursos-adicionales">
      <h1 className="page-title">Recursos Adicionales</h1>
      <p className="page-description">
        Accede a los recursos y manuales complementarios para tu formación.
      </p>

      {/* Filtros por categoría */}
      <div className="category-filters">
        <button 
          className={`category-btn ${activeCategory === 'todos' ? 'active' : ''}`}
          onClick={() => setActiveCategory('todos')}
        >
          Todos ({resources.length})
        </button>
        <button 
          className={`category-btn ${activeCategory === 'manuales' ? 'active' : ''}`}
          onClick={() => setActiveCategory('manuales')}
        >
          Manuales ({recursosPorCategoria.manuales.length})
        </button>
        <button 
          className={`category-btn ${activeCategory === 'reglamentos' ? 'active' : ''}`}
          onClick={() => setActiveCategory('reglamentos')}
        >
          Reglamentos ({recursosPorCategoria.reglamentos.length})
        </button>
        <button 
          className={`category-btn ${activeCategory === 'aip-gen' ? 'active' : ''}`}
          onClick={() => setActiveCategory('aip-gen')}
        >
          AIP - GEN ({recursosPorCategoria.aip.gen.length})
        </button>
        <button 
          className={`category-btn ${activeCategory === 'aip-ad' ? 'active' : ''}`}
          onClick={() => setActiveCategory('aip-ad')}
        >
          AIP - AD ({recursosPorCategoria.aip.ad.length})
        </button>
        <button 
          className={`category-btn ${activeCategory === 'aip-enr' ? 'active' : ''}`}
          onClick={() => setActiveCategory('aip-enr')}
        >
          AIP - ENR ({recursosPorCategoria.aip.enr.length})
        </button>
      </div>

      <div className="resources-container">
        <div className="resources-section">
          <div className="resources-list">
            {resources.length === 0 ? (
              <div className="no-resources">
                <p>No hay recursos en esta categoría</p>
              </div>
            ) : (
              resources.map(resource => (
              <div key={resource.id} className="resource-card">
                <div className="resource-icon">📄</div>
                <div className="resource-info">
                  <h3>{resource.name}</h3>
                  <div className="resource-meta">
                    <span className="resource-type">{resource.type}</span>
                      {resource.size !== 'N/A' && (
                    <span className="resource-size">{resource.size}</span>
                      )}
                    </div>
                </div>
                <a 
                  href={encodeURI(resource.filePath)}
                    download={`${resource.name}.${resource.filePath.split('.').pop().toLowerCase()}`}
                  className="btn-download"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(resource);
                  }}
                >
                  Descargar
                </a>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecursosAdicionales;
