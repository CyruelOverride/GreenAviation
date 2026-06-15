import React, { useState, useEffect, useRef } from 'react';
import { recursoAPI } from '../../services/api';
import './GestionRecursos.css';

const GestionRecursos = ({ isAuthenticated, userRole }) => {
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'upload'
  const [selectedRecurso, setSelectedRecurso] = useState(null);
  const [filterCategoria, setFilterCategoria] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const fileInputRef = useRef(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'link_drive',
    categoria: 'general',
    rutaOUrl: '',
    orden: 0
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  // Estado para subida de archivo
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      fetchRecursos();
    }
  }, [isAuthenticated, userRole, filterCategoria, filterTipo]);

  const fetchRecursos = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterCategoria) filters.categoria = filterCategoria;
      if (filterTipo) filters.tipo = filterTipo;
      
      const response = await recursoAPI.getAll(filters);
      if (response.success) {
        setRecursos(response.data.recursos);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setFormData(prev => ({ ...prev, nombre: prev.nombre || file.name }));
    }
  };

  const openCreateModal = (mode = 'create') => {
    setModalMode(mode);
    setSelectedRecurso(null);
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: mode === 'upload' ? 'archivo' : 'link_drive',
      categoria: 'general',
      rutaOUrl: '',
      orden: 0
    });
    setUploadFile(null);
    setFormMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const openEditModal = (recurso) => {
    setModalMode('edit');
    setSelectedRecurso(recurso);
    setFormData({
      nombre: recurso.nombre,
      descripcion: recurso.descripcion || '',
      tipo: recurso.tipo,
      categoria: recurso.categoria,
      rutaOUrl: recurso.rutaOUrl,
      orden: recurso.orden || 0
    });
    setFormMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormMessage({ type: '', text: '' });

    try {
      if (modalMode === 'upload') {
        // Subir archivo
        if (!uploadFile) {
          setFormMessage({ type: 'error', text: 'Selecciona un archivo' });
          setFormLoading(false);
          return;
        }

        const formDataUpload = new FormData();
        formDataUpload.append('archivo', uploadFile);
        formDataUpload.append('nombre', formData.nombre);
        formDataUpload.append('descripcion', formData.descripcion);
        formDataUpload.append('categoria', formData.categoria);

        await recursoAPI.upload(formDataUpload);
        setFormMessage({ type: 'success', text: 'Archivo subido exitosamente' });
      } else if (modalMode === 'create') {
        // Crear link
        await recursoAPI.create(formData);
        setFormMessage({ type: 'success', text: 'Recurso creado exitosamente' });
      } else {
        // Editar
        await recursoAPI.update(selectedRecurso.id, formData);
        setFormMessage({ type: 'success', text: 'Recurso actualizado exitosamente' });
      }

      // Recargar recursos
      await fetchRecursos();
      
      // Cerrar modal después de un momento
      setTimeout(() => {
        setShowModal(false);
      }, 1500);
    } catch (err) {
      setFormMessage({ type: 'error', text: err.message || 'Error al guardar' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (recurso) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${recurso.nombre}"?`)) {
      return;
    }

    try {
      await recursoAPI.delete(recurso.id);
      await fetchRecursos();
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleToggleActivo = async (recurso) => {
    try {
      await recursoAPI.update(recurso.id, { activo: !recurso.activo });
      await fetchRecursos();
    } catch (err) {
      alert(err.message || 'Error al actualizar');
    }
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      'archivo': '📄 Archivo',
      'link_drive': '📁 Google Drive',
      'link_video': '🎥 Video',
      'link_externo': '🔗 Link Externo'
    };
    return tipos[tipo] || tipo;
  };

  const getTipoBadgeClass = (tipo) => {
    const clases = {
      'archivo': 'badge-archivo',
      'link_drive': 'badge-drive',
      'link_video': 'badge-video',
      'link_externo': 'badge-externo'
    };
    return clases[tipo] || '';
  };

  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <div className="gestion-recursos">
        <div className="error-message">
          <p>Acceso denegado. Solo administradores pueden gestionar recursos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-recursos">
      <div className="page-header">
        <div>
          <h1>📚 Gestión de Recursos</h1>
          <p>Administra los recursos adicionales para los alumnos</p>
        </div>
        <div className="header-actions">
          <button className="btn-upload" onClick={() => openCreateModal('upload')}>
            📤 Subir Archivo
          </button>
          <button className="btn-primary" onClick={() => openCreateModal('create')}>
            ➕ Agregar Link
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtro-group">
          <label>Categoría:</label>
          <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
            <option value="">Todas</option>
            <option value="manuales">Manuales</option>
            <option value="reglamentos">Reglamentos</option>
            <option value="videos">Videos</option>
            <option value="videoTeorico">Videos curso teórico</option>
            <option value="videoManiobra">Videos de maniobras</option>
            <option value="documentos">Documentos</option>
            <option value="general">General</option>
          </select>
        </div>
        <div className="filtro-group">
          <label>Tipo:</label>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
            <option value="">Todos</option>
            <option value="archivo">Archivos</option>
            <option value="link_drive">Google Drive</option>
            <option value="link_video">Videos</option>
            <option value="link_externo">Links Externos</option>
          </select>
        </div>
      </div>

      {/* Lista de recursos */}
      {loading ? (
        <div className="loading">Cargando recursos...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="recursos-table-container">
          <table className="recursos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>URL/Ruta</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recursos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">
                    No hay recursos. ¡Agrega el primero!
                  </td>
                </tr>
              ) : (
                recursos.map(recurso => (
                  <tr key={recurso.id} className={!recurso.activo ? 'inactivo' : ''}>
                    <td>
                      <div className="recurso-nombre">
                        <strong>{recurso.nombre}</strong>
                        {recurso.descripcion && (
                          <span className="recurso-descripcion">{recurso.descripcion}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`tipo-badge ${getTipoBadgeClass(recurso.tipo)}`}>
                        {getTipoLabel(recurso.tipo)}
                      </span>
                    </td>
                    <td>
                      <span className="categoria-tag">{recurso.categoria}</span>
                    </td>
                    <td className="url-cell">
                      <a href={recurso.rutaOUrl} target="_blank" rel="noopener noreferrer" className="url-link">
                        {recurso.rutaOUrl.length > 40 
                          ? recurso.rutaOUrl.substring(0, 40) + '...' 
                          : recurso.rutaOUrl}
                      </a>
                    </td>
                    <td>
                      <button 
                        className={`estado-toggle ${recurso.activo ? 'activo' : 'inactivo'}`}
                        onClick={() => handleToggleActivo(recurso)}
                      >
                        {recurso.activo ? '✅ Activo' : '❌ Inactivo'}
                      </button>
                    </td>
                    <td>
                      <div className="acciones">
                        <button 
                          className="btn-accion btn-editar"
                          onClick={() => openEditModal(recurso)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-accion btn-eliminar"
                          onClick={() => handleDelete(recurso)}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'upload' && '📤 Subir Archivo'}
                {modalMode === 'create' && '➕ Agregar Link'}
                {modalMode === 'edit' && '✏️ Editar Recurso'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {modalMode === 'upload' && (
                <div className="form-group">
                  <label>Archivo *</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  {uploadFile && (
                    <span className="file-selected">📄 {uploadFile.name}</span>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre del recurso"
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción opcional"
                  rows={3}
                />
              </div>

              {modalMode !== 'upload' && (
                <>
                  <div className="form-group">
                    <label>Tipo *</label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="link_drive">📁 Google Drive</option>
                      <option value="link_video">🎥 Video (YouTube, etc.)</option>
                      <option value="link_externo">🔗 Link Externo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>URL *</label>
                    <input
                      type="url"
                      name="rutaOUrl"
                      value={formData.rutaOUrl}
                      onChange={handleInputChange}
                      placeholder="https://..."
                      required
                    />
                  </div>
                </>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleInputChange}
                  >
                    <option value="general">General</option>
                    <option value="manuales">Manuales</option>
                    <option value="reglamentos">Reglamentos</option>
                    <option value="aip-gen">AIP - GEN</option>
                    <option value="aip-ad">AIP - AD</option>
                    <option value="aip-enr">AIP - ENR</option>
                    <option value="videos">Videos</option>
                    <option value="videoTeorico">Videos curso teórico</option>
                    <option value="videoManiobra">Videos de maniobras</option>
                    <option value="documentos">Documentos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Orden</label>
                  <input
                    type="number"
                    name="orden"
                    value={formData.orden}
                    onChange={handleInputChange}
                    min={0}
                  />
                </div>
              </div>

              {formMessage.text && (
                <div className={`form-message ${formMessage.type}`}>
                  {formMessage.text}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={formLoading}>
                  {formLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionRecursos;

