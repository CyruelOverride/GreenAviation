import React, { useState, useEffect } from 'react';
import { capituloAPI, examenAPI } from '../../services/api';
import './GestionCapitulos.css';

const emptyForm = {
  nombre: '',
  numeroCurso: '',
  maxPreguntas: 15,
  instancias: 1,
  orden: '',
  habilitado: false,
};

const GestionCapitulos = ({ isAuthenticated, userRole }) => {
  const [capitulos, setCapitulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingHabilitacion, setSavingHabilitacion] = useState(null);

  const [nuevoCapitulo, setNuevoCapitulo] = useState({ ...emptyForm });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCapitulo, setEditingCapitulo] = useState(null);
  const [editForm, setEditForm] = useState({ ...emptyForm });
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState({ type: '', text: '' });

  const loadCapitulos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await capituloAPI.list();
      if (response.success) {
        setCapitulos(response.data.capitulos || []);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar capítulos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      loadCapitulos();
    }
  }, [isAuthenticated, userRole]);

  const handleToggleHabilitacion = async (capituloId, nextValue) => {
    setSavingHabilitacion(capituloId);
    setError(null);
    try {
      const response = await examenAPI.updateHabilitacion(capituloId, nextValue);
      if (response.success) {
        await loadCapitulos();
      }
    } catch (err) {
      setError(err.message || 'Error al actualizar habilitación');
      console.error(err);
    } finally {
      setSavingHabilitacion(null);
    }
  };

  const handleCreateCapitulo = async (e) => {
    e.preventDefault();
    setCreateError(null);
    const nombre = nuevoCapitulo.nombre.trim();
    if (!nombre) {
      setCreateError('El nombre del capítulo es requerido');
      return;
    }

    setCreating(true);
    try {
      const payload = {
        nombre,
        maxPreguntas: parseInt(nuevoCapitulo.maxPreguntas, 10) || 15,
        habilitado: nuevoCapitulo.habilitado,
      };
      if (nuevoCapitulo.numeroCurso !== '' && nuevoCapitulo.numeroCurso != null) {
        payload.numeroCurso = parseInt(nuevoCapitulo.numeroCurso, 10);
      }
      if (nuevoCapitulo.orden !== '' && nuevoCapitulo.orden != null) {
        payload.orden = parseInt(nuevoCapitulo.orden, 10);
      }
      if (nuevoCapitulo.instancias !== '' && nuevoCapitulo.instancias != null) {
        payload.instancias = parseInt(nuevoCapitulo.instancias, 10);
      }

      const response = await capituloAPI.create(payload);
      if (response.success) {
        setNuevoCapitulo({ ...emptyForm });
        await loadCapitulos();
      }
    } catch (err) {
      setCreateError(err.message || 'Error al crear capítulo');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (cap) => {
    setEditingCapitulo(cap);
    setEditForm({
      nombre: cap.nombre || '',
      numeroCurso: cap.numeroCurso != null ? String(cap.numeroCurso) : '',
      maxPreguntas: cap.maxPreguntas ?? 15,
      instancias: cap.instancias ?? 1,
      orden: cap.orden != null ? String(cap.orden) : '',
      habilitado: cap.habilitado === true,
    });
    setEditMessage({ type: '', text: '' });
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNuevoInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoCapitulo((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCapitulo) return;

    const nombre = editForm.nombre.trim();
    if (!nombre) {
      setEditMessage({ type: 'error', text: 'El nombre es requerido' });
      return;
    }

    setEditLoading(true);
    setEditMessage({ type: '', text: '' });

    try {
      const payload = {
        nombre,
        maxPreguntas: parseInt(editForm.maxPreguntas, 10) || 15,
        instancias: parseInt(editForm.instancias, 10) || 1,
        habilitado: editForm.habilitado,
      };

      if (editForm.numeroCurso === '' || editForm.numeroCurso == null) {
        payload.numeroCurso = null;
      } else {
        payload.numeroCurso = parseInt(editForm.numeroCurso, 10);
      }

      if (editForm.orden !== '' && editForm.orden != null) {
        payload.orden = parseInt(editForm.orden, 10);
      }

      const response = await capituloAPI.patch(editingCapitulo.id, payload);
      if (response.success) {
        setEditMessage({ type: 'success', text: 'Capítulo actualizado' });
        await loadCapitulos();
        setTimeout(() => {
          setShowEditModal(false);
          setEditingCapitulo(null);
        }, 1000);
      }
    } catch (err) {
      setEditMessage({ type: 'error', text: err.message || 'Error al guardar' });
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <div className="gestion-capitulos">
        <div className="error-message">
          <p>Acceso denegado. Solo administradores pueden gestionar capítulos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-capitulos">
      <div className="page-header">
        <div>
          <h1>Gestión de Capítulos</h1>
          <p>Administrá los exámenes por capítulo: nombre, reglas de acceso y cantidad de preguntas.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={loadCapitulos} disabled={loading}>
          {loading ? '…' : '↻ Actualizar'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="gc-create-section">
        <h2>Nuevo capítulo de examen</h2>
        <p className="section-description">
          El número de tema del curso (1–13) es opcional: sirve para desbloqueo por videos y el progreso del alumno.
        </p>
        {createError && <div className="error-message">{createError}</div>}
        <form onSubmit={handleCreateCapitulo} className="gc-form">
          <div className="gc-form-row">
            <div className="form-group">
              <label>Nombre del examen / capítulo *</label>
              <input
                type="text"
                name="nombre"
                value={nuevoCapitulo.nombre}
                onChange={handleNuevoInputChange}
                placeholder="Ej. Aerodinámica"
                required
              />
            </div>
            <div className="form-group">
              <label>N.º tema curso (opcional)</label>
              <input
                type="number"
                name="numeroCurso"
                min={1}
                max={13}
                value={nuevoCapitulo.numeroCurso}
                onChange={handleNuevoInputChange}
                placeholder="1–13"
              />
            </div>
          </div>
          <div className="gc-form-row">
            <div className="form-group">
              <label>Máx. preguntas en examen</label>
              <input
                type="number"
                name="maxPreguntas"
                min={1}
                max={100}
                value={nuevoCapitulo.maxPreguntas}
                onChange={handleNuevoInputChange}
              />
            </div>
            <div className="form-group">
              <label>Intentos permitidos</label>
              <input
                type="number"
                name="instancias"
                min={1}
                max={20}
                value={nuevoCapitulo.instancias}
                onChange={handleNuevoInputChange}
              />
            </div>
            <div className="form-group">
              <label>Orden (opcional)</label>
              <input
                type="number"
                name="orden"
                min={1}
                value={nuevoCapitulo.orden}
                onChange={handleNuevoInputChange}
                placeholder="Auto"
              />
            </div>
          </div>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="habilitado"
              checked={nuevoCapitulo.habilitado}
              onChange={handleNuevoInputChange}
            />
            Habilitado para alumnos al crear
          </label>
          <button type="submit" className="btn-primary" disabled={creating}>
            {creating ? 'Creando…' : 'Crear capítulo'}
          </button>
        </form>
      </section>

      <section className="gc-list-section">
        <h2>Capítulos configurados</h2>
        {loading ? (
          <div className="loading-message">Cargando capítulos…</div>
        ) : capitulos.length === 0 ? (
          <div className="empty-message">No hay capítulos. Creá el primero arriba.</div>
        ) : (
          <div className="capitulos-table-container">
            <table className="capitulos-table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Nombre</th>
                  <th>Tema curso</th>
                  <th>Máx. preguntas</th>
                  <th>Intentos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {capitulos.map((c) => {
                  const habilitado = c.habilitado === true;
                  const bloqueado = savingHabilitacion === c.id;
                  return (
                    <tr key={c.id}>
                      <td>{c.orden ?? '—'}</td>
                      <td>
                        <strong>{c.nombre}</strong>
                      </td>
                      <td>{c.numeroCurso != null ? c.numeroCurso : '—'}</td>
                      <td>{c.maxPreguntas ?? 15}</td>
                      <td>{c.instancias ?? 1}</td>
                      <td>
                        <button
                          type="button"
                          className={`estado-toggle ${habilitado ? 'activo' : 'inactivo'}`}
                          onClick={() => handleToggleHabilitacion(c.id, !habilitado)}
                          disabled={bloqueado}
                        >
                          {bloqueado ? '…' : habilitado ? 'Habilitado' : 'Bloqueado'}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-accion btn-editar"
                          onClick={() => openEditModal(c)}
                          title="Editar capítulo"
                        >
                          ✏️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Editar capítulo</h2>
              <button type="button" className="modal-close" onClick={() => setShowEditModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="modal-form">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={editForm.nombre}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              <div className="gc-form-row">
                <div className="form-group">
                  <label>N.º tema curso</label>
                  <input
                    type="number"
                    name="numeroCurso"
                    min={1}
                    max={13}
                    value={editForm.numeroCurso}
                    onChange={handleEditInputChange}
                    placeholder="Vacío = sin tema"
                  />
                </div>
                <div className="form-group">
                  <label>Orden</label>
                  <input
                    type="number"
                    name="orden"
                    min={1}
                    value={editForm.orden}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>
              <div className="gc-form-row">
                <div className="form-group">
                  <label>Máx. preguntas</label>
                  <input
                    type="number"
                    name="maxPreguntas"
                    min={1}
                    max={100}
                    value={editForm.maxPreguntas}
                    onChange={handleEditInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Intentos permitidos</label>
                  <input
                    type="number"
                    name="instancias"
                    min={1}
                    max={20}
                    value={editForm.instancias}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="habilitado"
                  checked={editForm.habilitado}
                  onChange={handleEditInputChange}
                />
                Habilitado para alumnos
              </label>

              {editMessage.text && (
                <div className={`form-message ${editMessage.type}`}>{editMessage.text}</div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setShowEditModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={editLoading}>
                  {editLoading ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCapitulos;
