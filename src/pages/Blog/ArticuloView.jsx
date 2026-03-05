import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { articuloAPI } from '../../services/api';
import './Blog.css';

function getYoutubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

const ArticuloView = ({ userRole }) => {
  const { slug } = useParams();
  const [articulo, setArticulo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const isAdmin = userRole === 'admin';

  const carouselSlides = useMemo(() => {
    if (!articulo) return [];
    const slides = [];
    if (articulo.imagenPortadaUrl) {
      slides.push({ type: 'portada', url: articulo.imagenPortadaUrl, nombre: 'Portada' });
    }
    (articulo.recursos || []).forEach((r) => {
      if (r.tipo === 'link_video') {
        slides.push({ type: 'video', url: r.rutaOUrl, nombre: r.nombre });
      } else if (r.tipo === 'archivo' || r.tipo === 'link_externo') {
        slides.push({ type: 'image', url: r.rutaOUrl, nombre: r.nombre });
      }
    });
    return slides;
  }, [articulo]);

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

        {carouselSlides.length > 0 && (
          <div className="articulo-carousel">
            <div className="articulo-carousel-inner">
              {carouselSlides.map((slide, i) => (
                <div
                  key={i}
                  className={`articulo-carousel-slide ${i === carouselIndex ? 'active' : ''}`}
                  role="tabpanel"
                  aria-hidden={i !== carouselIndex}
                >
                  {slide.type === 'video' && getYoutubeEmbedUrl(slide.url) ? (
                    <div className="carousel-video-wrapper">
                      <iframe
                        title={slide.nombre || 'Video'}
                        src={getYoutubeEmbedUrl(slide.url)}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (slide.type === 'portada' || slide.type === 'image') && slide.url ? (
                    <div className="carousel-image-wrapper">
                      <img src={slide.url} alt={slide.nombre || ''} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
            {carouselSlides.length > 1 && (
              <>
                <button
                  type="button"
                  className="carousel-btn carousel-prev"
                  onClick={() => setCarouselIndex((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1))}
                  aria-label="Anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="carousel-btn carousel-next"
                  onClick={() => setCarouselIndex((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1))}
                  aria-label="Siguiente"
                >
                  ›
                </button>
                <div className="carousel-dots">
                  {carouselSlides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`carousel-dot ${i === carouselIndex ? 'active' : ''}`}
                      onClick={() => setCarouselIndex(i)}
                      aria-label={`Ir a slide ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {carouselSlides.length === 0 && articulo.imagenPortadaUrl && (
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
