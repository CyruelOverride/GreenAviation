import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claseOnlineAPI, userAPI } from '../../services/api';
import './ClasesOnline.css';

const ClasesOnline = ({ isAuthenticated, userRole }) => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showGrabacionModal, setShowGrabacionModal] = useState(false);
  const [selectedClase, setSelectedClase] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [filterEstado, setFilterEstado] = useState('');

  // Estado del formulario
  const [formData, setFormData] = useState({
    link: '',
    fechaHoraInicio: new Date().toISOString().slice(0, 16),
    fechaHoraFin: '',
    instructorId: '',
    estado: 'Pendiente',
    linkGrabacion: '',
    codigoAcceso: ''
  });

  const [grabacionData, setGrabacionData] = useState({
    linkGrabacion: '',
    codigoAcceso: '',
    estado: 'Grabacion'
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchClases();
      if (userRole === 'admin') {
        fetchInstructors();
      }
    }
  }, [isAuthenticated, userRole, filterEstado]);

  const fetchClases = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = filterEstado ? { estado: filterEstado } : {};
      const response = await claseOnlineAPI.getAll(filters);
      if (response.success) {
        setClases(response.data.clases || []);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar las clases online');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const response = await userAPI.getAll({ role: 'admin' });
      if (response.success && response.data.users) {
        setInstructors(response.data.users);
      }
    } catch (err) {
      console.error('Error al cargar instructores:', err);
    }
  };

  const handleCreateClase = async (e) => {
    e.preventDefault();
    try {
      const claseData = {
        link: formData.link,
        fechaHoraInicio: formData.fechaHoraInicio,
        fechaHoraFin: formData.fechaHoraFin || null,
        instructorId: formData.instructorId || null,
        codigoAcceso: formData.codigoAcceso?.trim() || undefined
      };

      await claseOnlineAPI.create(claseData);
      alert('Clase online creada exitosamente!');
      setShowCreateModal(false);
      resetForm();
      fetchClases();
    } catch (err) {
      alert(`Error al crear clase: ${err.message}`);
    }
  };

  const handleUpdateClase = async (e) => {
    e.preventDefault();
    if (!selectedClase) return;

    try {
      // Clase terminada: solo publicar grabación (pasa a Grabacion)
      if (selectedClase.estado === 'Terminada') {
        const updateData = {
          estado: 'Grabacion',
          linkGrabacion: formData.linkGrabacion || selectedClase.linkGrabacion,
          codigoAcceso: formData.codigoAcceso
        };
        await claseOnlineAPI.update(selectedClase.id, updateData);
      } else {
        const updateData = {
          link: formData.link,
          fechaHoraInicio: formData.fechaHoraInicio,
          fechaHoraFin: formData.fechaHoraFin || null,
          estado: formData.estado,
          instructorId: formData.instructorId || null,
          codigoAcceso: formData.codigoAcceso
        };
        await claseOnlineAPI.update(selectedClase.id, updateData);
      }

      alert('Clase online actualizada exitosamente!');
      setShowEditModal(false);
      setSelectedClase(null);
      resetForm();
      fetchClases();
    } catch (err) {
      alert(`Error al actualizar clase: ${err.message}`);
    }
  };

  const handleDeleteClase = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
      return;
    }

    try {
      await claseOnlineAPI.delete(id);
      alert('Clase eliminada exitosamente!');
      fetchClases();
    } catch (err) {
      alert(`Error al eliminar clase: ${err.message}`);
    }
  };

  const handleChangeEstado = async (clase, nuevoEstado) => {
    try {
      await claseOnlineAPI.update(clase.id, { estado: nuevoEstado });
      alert(`Estado cambiado a "${nuevoEstado}" exitosamente!`);
      fetchClases();
    } catch (err) {
      alert(`Error al cambiar estado: ${err.message}`);
    }
  };

  const handleRegistrarAlumno = async (claseId) => {
    try {
      await claseOnlineAPI.registrarAlumno(claseId);
      alert('Te has registrado en la clase exitosamente!');
      fetchClases();
    } catch (err) {
      alert(`Error al registrarse: ${err.message}`);
    }
  };

  const handleOpenClase = async (clase) => {
    // Si el usuario no es admin, registrarse automáticamente
    if (userRole !== 'admin') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          const userId = user.id || user._id;
          const isRegistrado = clase.alumnos?.some(a => (a.id === userId) || (a._id === userId));
          if (!isRegistrado) {
            await handleRegistrarAlumno(clase.id);
          }
        } catch (err) {
          console.error('Error al parsear usuario:', err);
        }
      }
    }
    // Abrir el link en nueva pestaña
    window.open(clase.link, '_blank', 'noopener,noreferrer');
  };

  const handleOpenGrabacion = (clase) => {
    if (clase.linkGrabacion) {
      window.open(clase.linkGrabacion, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEditClick = (clase) => {
    setSelectedClase(clase);
    setFormData({
      link: clase.link || '',
      fechaHoraInicio: clase.fechaHoraInicio 
        ? new Date(clase.fechaHoraInicio).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      fechaHoraFin: clase.fechaHoraFin 
        ? new Date(clase.fechaHoraFin).toISOString().slice(0, 16)
        : '',
      instructorId: clase.instructorId || '',
      estado: clase.estado || 'Pendiente',
      linkGrabacion: clase.linkGrabacion || '',
      codigoAcceso: clase.codigoAcceso ?? ''
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (clase) => {
    setSelectedClase(clase);
    setShowDetailsModal(true);
  };

  const handleGrabacionClick = (clase) => {
    setSelectedClase(clase);
    setGrabacionData({
      linkGrabacion: clase.linkGrabacion || '',
      codigoAcceso: clase.codigoAcceso ?? '',
      estado: 'Grabacion'
    });
    setShowGrabacionModal(true);
  };

  const handleSaveGrabacion = async (e) => {
    e.preventDefault();
    if (!selectedClase) return;

    try {
      await claseOnlineAPI.update(selectedClase.id, {
        estado: 'Grabacion',
        linkGrabacion: grabacionData.linkGrabacion,
        codigoAcceso: grabacionData.codigoAcceso
      });
      alert('Grabación guardada exitosamente!');
      setShowGrabacionModal(false);
      setSelectedClase(null);
      fetchClases();
    } catch (err) {
      alert(`Error al guardar grabación: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      link: '',
      fechaHoraInicio: new Date().toISOString().slice(0, 16),
      fechaHoraFin: '',
      instructorId: '',
      estado: 'Pendiente',
      linkGrabacion: '',
      codigoAcceso: ''
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadgeClass = (estado) => {
    const estados = {
      'Pendiente': 'estado-pendiente',
      'En curso': 'estado-en-curso',
      'Terminada': 'estado-terminada',
      'Grabacion': 'estado-grabacion'
    };
    return estados[estado] || '';
  };

  if (!isAuthenticated) {
    return (
      <div className="clases-online">
        <h1 className="page-title">Clases Online</h1>
        <div className="info-card-unauthenticated">
          <h2>🎓 Clases Online</h2>
          <p>Inicia sesión para acceder a las clases online</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="clases-online">
        <div className="loading">Cargando clases online...</div>
      </div>
    );
  }

  return (
    <div className="clases-online">
      <div className="clases-header">
        <h1 className="page-title">Clases Online</h1>
        {userRole === 'admin' && (
          <button 
            className="btn-primary"
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
          >
            + Crear Nueva Clase
          </button>
        )}
      </div>

      {userRole === 'admin' && (
        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="estado-filter">Filtrar por Estado:</label>
            <select
              id="estado-filter"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En curso">En curso</option>
              <option value="Terminada">Terminada</option>
              <option value="Grabacion">Grabación</option>
            </select>
          </div>
          <div className="stats-info">
            <span>Total de clases: <strong>{clases.length}</strong></span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {clases.length === 0 ? (
        <div className="empty-message">No hay clases online disponibles.</div>
      ) : (
        <div className="classes-grid">
          {clases.map(clase => (
            <div key={clase.id} className={`class-card ${clase.estado?.toLowerCase().replace(' ', '-')}`}>
              <div className="class-header">
                <span className={`class-badge ${getEstadoBadgeClass(clase.estado)}`}>
                  {clase.estado}
                </span>
                {userRole === 'admin' && (
                  <div className="class-actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleViewDetails(clase)}
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    {clase.estado !== 'Terminada' && (
                      <button 
                        className="btn-icon"
                        onClick={() => handleEditClick(clase)}
                        title="Editar"
                      >
                        ✏️
                      </button>
                    )}
                    {clase.estado === 'Terminada' && (
                      <button 
                        className="btn-icon"
                        onClick={() => handleGrabacionClick(clase)}
                        title="Agregar grabación"
                      >
                        🎥
                      </button>
                    )}
                    <button 
                      className="btn-icon btn-danger"
                      onClick={() => handleDeleteClase(clase.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              <div className="class-details">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{formatDateTime(clase.fechaHoraInicio)}</span>
                </div>
                {clase.fechaHoraFin && (
                  <div className="detail-item">
                    <span className="detail-icon">🕐</span>
                    <span>Hasta: {formatDateTime(clase.fechaHoraFin)}</span>
                  </div>
                )}
                {clase.instructor && (
                  <div className="detail-item">
                    <span className="detail-icon">👤</span>
                    <span>Instructor: {clase.instructor.nombre} {clase.instructor.apellido}</span>
                  </div>
                )}
                {clase.alumnos && clase.alumnos.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-icon">👥</span>
                    <span>{clase.alumnos.length} alumno(s) registrado(s)</span>
                  </div>
                )}
                {clase.codigoAcceso && (
                  <div className="detail-item">
                    <span className="detail-icon">🔑</span>
                    <span className="codigo-acceso-text">Código de acceso: {clase.codigoAcceso}</span>
                  </div>
                )}
              </div>

              <div className="class-actions-bottom">
                {clase.estado === 'Pendiente' && userRole === 'admin' && (
                  <button
                    className="btn-secondary"
                    onClick={() => handleChangeEstado(clase, 'En curso')}
                  >
                    Iniciar Clase
                  </button>
                )}
                {clase.estado === 'En curso' && (
                  <button
                    className="btn-join"
                    onClick={() => handleOpenClase(clase)}
                  >
                    Unirse a la Clase
                  </button>
                )}
                {clase.estado === 'Terminada' && clase.linkGrabacion && (
                  <button
                    className="btn-watch"
                    onClick={() => handleOpenGrabacion(clase)}
                  >
                    Ver Grabación
                  </button>
                )}
                {clase.estado === 'Grabacion' && clase.linkGrabacion && (
                  <button
                    className="btn-watch"
                    onClick={() => handleOpenGrabacion(clase)}
                  >
                    Ver Grabación
                  </button>
                )}
                {clase.estado === 'Pendiente' && userRole !== 'admin' && (
                  <button
                    className="btn-join"
                    onClick={() => handleOpenClase(clase)}
                  >
                    Ver Clase
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Clase */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Crear Nueva Clase Online</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateClase} className="clase-form">
              <div className="form-group">
                <label>Link de la Clase *</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha y Hora de Inicio *</label>
                <input
                  type="datetime-local"
                  value={formData.fechaHoraInicio}
                  onChange={(e) => setFormData({ ...formData, fechaHoraInicio: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fecha y Hora de Fin</label>
                <input
                  type="datetime-local"
                  value={formData.fechaHoraFin}
                  onChange={(e) => setFormData({ ...formData, fechaHoraFin: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Instructor</label>
                <select
                  value={formData.instructorId}
                  onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                >
                  <option value="">Seleccionar instructor (opcional)</option>
                  {instructors.map(instructor => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.nombre} {instructor.apellido}
                    </option>
                  ))}
                </select>
                <small>Si no se selecciona, se usará el usuario logueado</small>
              </div>
              <div className="form-group">
                <label>Código de acceso (opcional)</label>
                <input
                  type="text"
                  className="input-codigo-acceso"
                  value={formData.codigoAcceso}
                  onChange={(e) => setFormData({ ...formData, codigoAcceso: e.target.value })}
                  placeholder="Ej. contraseña de la reunión"
                  autoComplete="off"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Clase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Clase */}
      {showEditModal && selectedClase && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Clase Online</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateClase} className="clase-form">
              {selectedClase.estado === 'Terminada' ? (
                <>
                  <div className="form-group">
                    <label>Link de Grabación *</label>
                    <input
                      type="url"
                      value={formData.linkGrabacion}
                      onChange={(e) => setFormData({ ...formData, linkGrabacion: e.target.value })}
                      placeholder="https://drive.google.com/..."
                      required
                    />
                    <small>Al guardar, la clase cambiará a estado "Grabacion"</small>
                  </div>
                  <div className="form-group">
                    <label>Código de acceso (opcional)</label>
                    <input
                      type="text"
                      className="input-codigo-acceso"
                      value={formData.codigoAcceso}
                      onChange={(e) => setFormData({ ...formData, codigoAcceso: e.target.value })}
                      placeholder="Si aplica para la grabación"
                      autoComplete="off"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Link de la Clase *</label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha y Hora de Inicio *</label>
                    <input
                      type="datetime-local"
                      value={formData.fechaHoraInicio}
                      onChange={(e) => setFormData({ ...formData, fechaHoraInicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fecha y Hora de Fin</label>
                    <input
                      type="datetime-local"
                      value={formData.fechaHoraFin}
                      onChange={(e) => setFormData({ ...formData, fechaHoraFin: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="En curso">En curso</option>
                      <option value="Terminada">Terminada</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Instructor</label>
                    <select
                      value={formData.instructorId}
                      onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                    >
                      <option value="">Seleccionar instructor</option>
                      {instructors.map(instructor => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.nombre} {instructor.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalles */}
      {showDetailsModal && selectedClase && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Clase</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="details-content">
              <div className="detail-row">
                <strong>Estado:</strong>
                <span className={`estado-badge ${getEstadoBadgeClass(selectedClase.estado)}`}>
                  {selectedClase.estado}
                </span>
              </div>
              <div className="detail-row">
                <strong>Link:</strong>
                <a href={selectedClase.link} target="_blank" rel="noopener noreferrer">
                  {selectedClase.link}
                </a>
              </div>
              {selectedClase.linkGrabacion && (
                <div className="detail-row">
                  <strong>Link de Grabación:</strong>
                  <a href={selectedClase.linkGrabacion} target="_blank" rel="noopener noreferrer">
                    {selectedClase.linkGrabacion}
                  </a>
                </div>
              )}
              {selectedClase.codigoAcceso && (
                <div className="detail-row">
                  <strong>Código de acceso:</strong>
                  <span className="codigo-acceso-text">{selectedClase.codigoAcceso}</span>
                </div>
              )}
              <div className="detail-row">
                <strong>Fecha y Hora de Inicio:</strong>
                <span>{formatDateTime(selectedClase.fechaHoraInicio)}</span>
              </div>
              {selectedClase.fechaHoraFin && (
                <div className="detail-row">
                  <strong>Fecha y Hora de Fin:</strong>
                  <span>{formatDateTime(selectedClase.fechaHoraFin)}</span>
                </div>
              )}
              {selectedClase.instructor && (
                <div className="detail-row">
                  <strong>Instructor:</strong>
                  <span>{selectedClase.instructor.nombre} {selectedClase.instructor.apellido}</span>
                </div>
              )}
              {selectedClase.alumnos && selectedClase.alumnos.length > 0 && (
                <div className="detail-row">
                  <strong>Alumnos Registrados ({selectedClase.alumnos.length}):</strong>
                  <div className="alumnos-list">
                    {selectedClase.alumnos.map(alumno => (
                      <div key={alumno.id} className="alumno-item">
                        {alumno.nombre} {alumno.apellido} ({alumno.email})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Agregar Grabación */}
      {showGrabacionModal && selectedClase && (
        <div className="modal-overlay" onClick={() => setShowGrabacionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Agregar Grabación</h2>
              <button className="close-btn" onClick={() => setShowGrabacionModal(false)}>×</button>
            </div>
            <form onSubmit={handleSaveGrabacion} className="clase-form">
              <div className="form-group">
                <label>Link de Grabación *</label>
                <input
                  type="url"
                  value={grabacionData.linkGrabacion}
                  onChange={(e) => setGrabacionData({ ...grabacionData, linkGrabacion: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  required
                />
                <small>Al guardar, la clase cambiará a estado "Grabacion"</small>
              </div>
              <div className="form-group">
                <label>Código de acceso (opcional)</label>
                <input
                  type="text"
                  className="input-codigo-acceso"
                  value={grabacionData.codigoAcceso}
                  onChange={(e) => setGrabacionData({ ...grabacionData, codigoAcceso: e.target.value })}
                  placeholder="Si aplica para ver la grabación"
                  autoComplete="off"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowGrabacionModal(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Grabación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClasesOnline;
