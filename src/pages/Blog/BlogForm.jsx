import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { articuloAPI } from '../../services/api';
import './Blog.css';

const BlogForm = ({ userRole }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const isAdmin = userRole === 'admin';

  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    resumen: '',
    cuerpo: '',
    imagenPortadaUrl: '',
    estado: 'borrador',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/blog');
      return;
    }
    if (isEdit && id) {
      const fetchArticulo = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await articuloAPI.getById(id);
          if (response.success && response.data?.articulo) {
            const a = response.data.articulo;
            setFormData({
              titulo: a.titulo || '',
              slug: a.slug || '',
              resumen: a.resumen || '',
              cuerpo: a.cuerpo || '',
              imagenPortadaUrl: a.imagenPortadaUrl || '',
              estado: a.estado || 'borrador',
            });
          } else {
            setError('Artículo no encontrado');
          }
        } catch (err) {
          setError(err.message || 'Error al cargar');
        } finally {
          setLoading(false);
        }
      };
      fetchArticulo();
    }
  }, [isAdmin, isEdit, id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await articuloAPI.update(id, formData);
        const slug = formData.slug || formData.titulo.toLowerCase().replace(/\s+/g, '-');
        navigate(`/blog/articulo/${slug}`);
      } else {
        const response = await articuloAPI.create(formData);
        const art = response.data?.articulo;
        if (art) navigate(`/blog/articulo/${art.slug}`);
        else navigate('/blog');
      }
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) return null;
  if (loading) return <div className="blog-page"><div className="blog-loading">Cargando...</div></div>;

  return (
    <div className="blog-page blog-form-page">
      <Link to="/blog" className="btn-blog-back">← Volver al blog</Link>
      <h1 className="blog-page-title">{isEdit ? 'Editar artículo' : 'Nuevo artículo'}</h1>

      {error && <div className="blog-error">{error}</div>}

      <form className="blog-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="titulo">Título *</label>
          <input
            id="titulo"
            name="titulo"
            type="text"
            value={formData.titulo}
            onChange={handleChange}
            required
            maxLength={255}
            placeholder="Título del artículo"
          />
        </div>

        <div className="form-group">
          <label htmlFor="slug">Slug (opcional)</label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleChange}
            maxLength={255}
            placeholder="url-amigable (se genera del título si se deja vacío)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="resumen">Resumen</label>
          <textarea
            id="resumen"
            name="resumen"
            value={formData.resumen}
            onChange={handleChange}
            rows={2}
            placeholder="Breve resumen para la tarjeta del listado"
          />
        </div>

        <div className="form-group">
          <label htmlFor="cuerpo">Cuerpo</label>
          <textarea
            id="cuerpo"
            name="cuerpo"
            value={formData.cuerpo}
            onChange={handleChange}
            rows={12}
            placeholder="Contenido del artículo (los saltos de línea se conservan)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="imagenPortadaUrl">URL imagen de portada</label>
          <input
            id="imagenPortadaUrl"
            name="imagenPortadaUrl"
            type="url"
            value={formData.imagenPortadaUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
          >
            <option value="borrador">Borrador</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-blog-submit" disabled={saving}>
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear artículo'}
          </button>
          <Link to="/blog" className="btn-blog-cancel">Cancelar</Link>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
