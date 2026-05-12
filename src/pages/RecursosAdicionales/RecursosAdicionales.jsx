import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { recursoAPI } from '../../services/api';
import './RecursosAdicionales.css';

const CATEGORIA_LABELS = {
  todos: 'Todos',
  general: 'General',
  manuales: 'Manuales',
  reglamentos: 'Reglamentos',
  videos: 'Videos',
  documentos: 'Documentos',
  'aip-gen': 'AIP - GEN',
  'aip-ad': 'AIP - AD',
  'aip-enr': 'AIP - ENR'
};

const RecursosAdicionales = ({ isAuthenticated }) => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchRecursos = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await recursoAPI.getAll({
            soloActivos: 'true',
            excludeCategoria: 'videoTeorico',
          });
          if (response.success && response.data?.recursos) {
            setRecursos(response.data.recursos);
          } else {
            setRecursos([]);
          }
        } catch (err) {
          setError(err.message || 'Error al cargar recursos');
          setRecursos([]);
        } finally {
          setLoading(false);
        }
      };
      fetchRecursos();
    }
  }, [isAuthenticated]);

  const recursosNormalizados = recursos.map((r) => ({
    id: r.id,
    name: r.nombre,
    type: r.tipo || 'link',
    size: r.tamano || 'N/A',
    filePath: r.rutaOUrl,
    category: r.categoria || 'general'
  }));

  const categoriasUnicas = ['todos', ...new Set(recursosNormalizados.map((r) => r.category))];

  const getResources = () => {
    if (activeCategory === 'todos') return recursosNormalizados;
    return recursosNormalizados.filter((r) => r.category === activeCategory);
  };

  const handleDownload = (resource) => {
    const url = resource.filePath;
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const link = document.createElement('a');
      link.href = encodeURI(url || '#');
      link.download = resource.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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

      {loading && <div className="loading">Cargando recursos...</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Filtros por categoría */}
      <div className="category-filters">
        {categoriasUnicas.map((cat) => {
          const count = cat === 'todos' ? recursosNormalizados.length : recursosNormalizados.filter((r) => r.category === cat).length;
          return (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {CATEGORIA_LABELS[cat] || cat} ({count})
            </button>
          );
        })}
      </div>

      <div className="resources-container">
        <div className="resources-section">
          <div className="resources-list">
            {!loading && resources.length === 0 ? (
              <div className="no-resources">
                <p>No hay recursos en esta categoría</p>
              </div>
            ) : (
              resources.map((resource) => (
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
                    href={resource.filePath?.startsWith('http') ? resource.filePath : '#'}
                    target={resource.filePath?.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="btn-download"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownload(resource);
                    }}
                  >
                    {resource.filePath?.startsWith('http') ? 'Ver / Descargar' : 'Descargar'}
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
