import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { articuloAPI } from '../../services/api';
import './Blog.css';

const Blog = ({ isAuthenticated, userRole }) => {
  const [articulos, setArticulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    const fetchArticulos = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (!isAdmin) params.estado = 'publicado';
        const response = await articuloAPI.list(params);
        if (response.success && response.data?.articulos) {
          setArticulos(response.data.articulos);
        } else {
          setArticulos([]);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar artículos');
        setArticulos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchArticulos();
  }, [isAdmin]);

  const handleDelete = async (e, id, titulo) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`¿Eliminar el artículo "${titulo}"?`)) return;
    try {
      await articuloAPI.delete(id);
      setArticulos((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="blog-page">
      <div className="blog-header">
        <h1 className="blog-page-title">Blog</h1>
        <p className="blog-page-description">
          Artículos, noticias y recursos del campus Green Aviation.
        </p>
        {isAdmin && (
          <Link to="/blog/nuevo" className="btn-blog-new">
            Nuevo artículo
          </Link>
        )}
      </div>

      {loading && <div className="blog-loading">Cargando artículos...</div>}
      {error && <div className="blog-error">{error}</div>}

      {!loading && !error && articulos.length === 0 && (
        <div className="blog-empty">
          <p>Aún no hay artículos publicados.</p>
          {isAdmin && (
            <Link to="/blog/nuevo" className="btn-blog-new">Crear el primero</Link>
          )}
        </div>
      )}

      {!loading && !error && articulos.length > 0 && (
        <div className="blog-grid">
          {articulos.map((art) => (
            <article
              key={art.id}
              className={`blog-card ${art.estado === 'borrador' ? 'blog-card-draft' : ''}`}
            >
              <Link to={`/blog/articulo/${art.slug}`} className="blog-card-link">
                {art.imagenPortadaUrl && (
                  <div className="blog-card-image">
                    <img src={art.imagenPortadaUrl} alt="" />
                  </div>
                )}
                <div className="blog-card-body">
                  {art.estado === 'borrador' && (
                    <span className="blog-badge-draft">Borrador</span>
                  )}
                  <h2 className="blog-card-title">{art.titulo}</h2>
                  {art.resumen && (
                    <p className="blog-card-resumen">{art.resumen}</p>
                  )}
                  <div className="blog-card-meta">
                    {art.autor && (
                      <span className="blog-card-author">
                        {art.autor.nombre} {art.autor.apellido}
                      </span>
                    )}
                    <span className="blog-card-date">{formatDate(art.createdAt)}</span>
                  </div>
                </div>
              </Link>
              {isAdmin && (
                <div className="blog-card-actions">
                  <Link
                    to={`/blog/editar/${art.id}`}
                    className="btn-blog-action btn-blog-edit"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="btn-blog-action btn-blog-delete"
                    onClick={(e) => handleDelete(e, art.id, art.titulo)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;
