import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { articuloAPI, recursoAPI } from '../../services/api';
import './Blog.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

// Convierte recurso del API a item del carrusel (al editar ya tienen recursoId)
const recursoToContentItem = (r) => ({
  type: r.tipo === 'link_video' ? 'video' : 'image_url',
  url: r.rutaOUrl,
  nombre: r.nombre,
  recursoId: r.id,
});

const BlogForm = ({ userRole }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const isAdmin = userRole === 'admin';
  const initialRecursoIdsRef = useRef([]);

  const [formData, setFormData] = useState({
    titulo: '',
    slug: '',
    resumen: '',
    cuerpo: '',
    imagenPortadaUrl: '',
    estado: 'borrador',
  });
  const [contentItems, setContentItems] = useState([]);
  const [showAddContent, setShowAddContent] = useState(false);
  const [addType, setAddType] = useState('video');
  const [addUrl, setAddUrl] = useState('');
  const [addFile, setAddFile] = useState(null);
  const [addNombre, setAddNombre] = useState('');
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
            if (a.recursos && a.recursos.length) {
              const items = a.recursos.map(recursoToContentItem);
              setContentItems(items);
              initialRecursoIdsRef.current = a.recursos.map((r) => r.id);
            }
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

  const handleAddContent = () => {
    if (addType === 'video' && addUrl.trim()) {
      setContentItems((prev) => [...prev, { type: 'video', url: addUrl.trim(), nombre: addNombre.trim() || 'Video' }]);
      setAddUrl('');
      setAddNombre('');
      setShowAddContent(false);
      return;
    }
    if (addType === 'image_url' && addUrl.trim()) {
      setContentItems((prev) => [...prev, { type: 'image_url', url: addUrl.trim(), nombre: addNombre.trim() || 'Imagen' }]);
      setAddUrl('');
      setAddNombre('');
      setShowAddContent(false);
      return;
    }
    if (addType === 'image_file' && addFile) {
      setContentItems((prev) => [...prev, { type: 'image_file', file: addFile, nombre: addNombre.trim() || addFile.name }]);
      setAddFile(null);
      setAddNombre('');
      setShowAddContent(false);
      return;
    }
    setError('Completa el campo requerido (URL o archivo).');
  };

  const removeContentItem = (index) => {
    setContentItems((prev) => prev.filter((_, i) => i !== index));
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
      let articleId = id;
      if (isEdit) {
        await articuloAPI.update(id, formData);
      } else {
        const response = await articuloAPI.create(formData);
        const art = response.data?.articulo;
        if (!art) {
          setError('No se pudo crear el artículo');
          setSaving(false);
          return;
        }
        articleId = art.id;
      }

      const recursoIdsToKeep = contentItems.filter((c) => c.recursoId).map((c) => c.recursoId);
      if (isEdit) {
        const toRemove = initialRecursoIdsRef.current.filter((rid) => !recursoIdsToKeep.includes(rid));
        for (const rid of toRemove) {
          await articuloAPI.removeRecurso(articleId, rid);
        }
      }

      const orderedIds = [];
      for (const item of contentItems) {
        if (item.recursoId) {
          orderedIds.push(item.recursoId);
          continue;
        }
        if (item.type === 'video' && item.url) {
          const res = await recursoAPI.create({
            nombre: item.nombre || 'Video',
            tipo: 'link_video',
            rutaOUrl: item.url,
            categoria: 'blog',
            esParaBlog: true,
          });
          if (res.success && res.data?.recurso) orderedIds.push(res.data.recurso.id);
        } else if (item.type === 'image_url' && item.url) {
          const res = await recursoAPI.create({
            nombre: item.nombre || 'Imagen',
            tipo: 'link_externo',
            rutaOUrl: item.url,
            categoria: 'blog',
            esParaBlog: true,
          });
          if (res.success && res.data?.recurso) orderedIds.push(res.data.recurso.id);
        } else if (item.type === 'image_file' && item.file) {
          const fd = new FormData();
          fd.append('archivo', item.file);
          fd.append('nombre', item.nombre || item.file.name);
          fd.append('categoria', 'blog');
          fd.append('esParaBlog', 'true');
          const res = await recursoAPI.upload(fd);
          if (res.success && res.data?.recurso) orderedIds.push(res.data.recurso.id);
        }
      }

      if (orderedIds.length) {
        await articuloAPI.addRecursos(articleId, orderedIds, 0);
      }

      let slug = formData.slug || formData.titulo.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (!isEdit) {
        const artRes = await articuloAPI.getById(articleId);
        if (artRes.success && artRes.data?.articulo?.slug) slug = artRes.data.articulo.slug;
      }
      navigate(`/blog/articulo/${slug}`);
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
          <span className="form-hint">La portada aparece primero en el carrusel del artículo.</span>
        </div>

        <div className="form-group content-carrousel-group">
          <label>Contenido del carrusel</label>
          <p className="form-hint">Videos (YouTube), imágenes (enlace o subir archivo). Se muestran arriba del artículo junto a la portada.</p>
          <div className="content-items-list">
            {contentItems.map((item, index) => (
              <div key={index} className="content-item-pill">
                {item.type === 'video' && <span className="content-pill-icon">🎥</span>}
                {(item.type === 'image_url' || item.type === 'image_file') && <span className="content-pill-icon">🖼</span>}
                <span className="content-pill-label">{item.nombre || item.url || (item.file && item.file.name) || 'Sin nombre'}</span>
                <button type="button" className="content-pill-remove" onClick={() => removeContentItem(index)} aria-label="Quitar">×</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn-add-content" onClick={() => { setShowAddContent(true); setAddUrl(''); setAddFile(null); setAddNombre(''); setError(null); }}>
            Agregar contenido
          </button>
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

      {showAddContent && (
        <div className="modal-overlay" onClick={() => setShowAddContent(false)}>
          <div className="modal-content modal-add-content" onClick={(e) => e.stopPropagation()}>
            <h3>Agregar contenido al carrusel</h3>
            <div className="add-content-tabs">
              <button type="button" className={addType === 'video' ? 'active' : ''} onClick={() => setAddType('video')}>Video (YouTube)</button>
              <button type="button" className={addType === 'image_url' ? 'active' : ''} onClick={() => setAddType('image_url')}>Link a imagen</button>
              <button type="button" className={addType === 'image_file' ? 'active' : ''} onClick={() => setAddType('image_file')}>Subir imagen</button>
            </div>
            <div className="add-content-fields">
              <div className="form-group">
                <label>Nombre (opcional)</label>
                <input type="text" value={addNombre} onChange={(e) => setAddNombre(e.target.value)} placeholder="Ej: Video explicativo" />
              </div>
              {addType === 'video' && (
                <div className="form-group">
                  <label>URL del video (YouTube)</label>
                  <input type="url" value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
                </div>
              )}
              {addType === 'image_url' && (
                <div className="form-group">
                  <label>URL de la imagen</label>
                  <input type="url" value={addUrl} onChange={(e) => setAddUrl(e.target.value)} placeholder="https://..." />
                </div>
              )}
              {addType === 'image_file' && (
                <div className="form-group">
                  <label>Seleccionar imagen</label>
                  <input type="file" accept="image/*" onChange={(e) => setAddFile(e.target.files?.[0] || null)} />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-blog-submit" onClick={handleAddContent}>Agregar</button>
              <button type="button" className="btn-blog-cancel" onClick={() => setShowAddContent(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogForm;
