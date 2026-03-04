import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { articuloAPI } from '../../services/api';
import './Blog.css';

const ArticuloView = ({ userRole }) => {
  const { slug } = useParams();
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (!slug) return;
    const fetchArticulo = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await articuloAPI.getBySlug(slug);
        if (response.success && response.data?.articulo) {
          setArticulo(response.data.articulo);
        } else {
          setError('Artículo no encontrado');
        }
      } catch (err) {
        setError(err.message || 'Error al cargar el artículo');
        setArticulo(null);
      } finally {
        setLoading(false);
      }
    };
    fetchArticulo();
  }, [slug]);

  const handleDelete = async () => {
    if (!articulo || !window.confirm(`¿Eliminar "${articulo.titulo}"?`)) return;
    try {
      await articuloAPI.delete(articulo.id);
      window.location.href = '/blog';
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-UY', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) return <div className="blog-page"><div className="blog-loading">Cargando...</div></div>;
  if (error || !articulo) {
    return (
      <div className="blog-page">
        <div className="blog-error">{error || 'Artículo no encontrado'}</div>
        <Link to="/blog" className="btn-blog-back">Volver al blog</Link>
      </div>
    );
  }

  return (
    <div className="blog-page blog-articulo-view">
      <Link to="/blog" className="btn-blog-back">← Volver al blog</Link>

      <article className="articulo-full">
        {articulo.estado === 'borrador' && (
          <span className="blog-badge-draft articulo-badge">Borrador</span>
        )}
        <header className="articulo-full-header">
          <h1 className="articulo-full-title">{articulo.titulo}</h1>
          <div className="articulo-full-meta">
            {articulo.autor && (
              <span className="articulo-author">
                {articulo.autor.nombre} {articulo.autor.apellido}
              </span>
            )}
            <span className="articulo-date">{formatDate(articulo.createdAt)}</span>
          </div>
        </header>

        {articulo.imagenPortadaUrl && (
          <div className="articulo-full-image">
            <img src={articulo.imagenPortadaUrl} alt="" />
          </div>
        )}

        {articulo.resumen && (
          <p className="articulo-resumen">{articulo.resumen}</p>
        )}

        <div
          className="articulo-cuerpo"
          dangerouslySetInnerHTML={{
            __html: articulo.cuerpo
              ? articulo.cuerpo.replace(/\n/g, '<br />')
              : '',
          }}
        />

        {articulo.recursos && articulo.recursos.length > 0 && (
          <section className="articulo-recursos">
            <h3>Recursos relacionados</h3>
            <ul>
              {articulo.recursos.map((r) => (
                <li key={r.id}>
                  <a
                    href={r.rutaOUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {r.nombre}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {isAdmin && (
          <div className="articulo-admin-actions">
            <Link to={`/blog/editar/${articulo.id}`} className="btn-blog-action btn-blog-edit">
              Editar
            </Link>
            <button
              type="button"
              className="btn-blog-action btn-blog-delete"
              onClick={handleDelete}
            >
              Eliminar
            </button>
          </div>
        )}
      </article>
    </div>
  );
};

export default ArticuloView;
