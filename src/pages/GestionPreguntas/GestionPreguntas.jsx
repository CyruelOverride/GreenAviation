import React, { useState, useEffect } from 'react';
import { preguntaAPI, opcionAPI, examenAPI } from '../../services/api';
import './GestionPreguntas.css';

const GestionPreguntas = ({ isAuthenticated, userRole }) => {
  const [capituloSeleccionado, setCapituloSeleccionado] = useState('1');
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPregunta, setEditingPregunta] = useState(null);
  const [editingOpcion, setEditingOpcion] = useState(null);
  const [saving, setSaving] = useState(false);
  const [habilitaciones, setHabilitaciones] = useState({});
  const [loadingHabilitaciones, setLoadingHabilitaciones] = useState(false);
  const [savingHabilitacion, setSavingHabilitacion] = useState(null);
  const [habilitacionesError, setHabilitacionesError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [newPregunta, setNewPregunta] = useState({
    enunciado: '',
    activa: true,
    opciones: [
      { texto: '', esCorrecta: true },
      { texto: '', esCorrecta: false }
    ]
  });

  const capitulos = Array.from({ length: 13 }, (_, i) => String(i + 1));

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin' && capituloSeleccionado) {
      loadPreguntas();
      loadHabilitaciones();
    }
  }, [capituloSeleccionado, isAuthenticated, userRole]);

  const loadHabilitaciones = async () => {
    setLoadingHabilitaciones(true);
    setHabilitacionesError(null);
    try {
      const response = await examenAPI.getHabilitaciones();
      if (response.success) {
        const mapa = {};
        (response.data.habilitaciones || []).forEach((item) => {
          mapa[String(item.capitulo)] = item.habilitado === true;
        });
        setHabilitaciones(mapa);
      }
    } catch (err) {
      setHabilitacionesError(err.message || 'Error al cargar habilitaciones de exámenes');
      console.error('Error al cargar habilitaciones:', err);
    } finally {
      setLoadingHabilitaciones(false);
    }
  };

  const handleToggleHabilitacion = async (capitulo, nextValue) => {
    setSavingHabilitacion(capitulo);
    setHabilitacionesError(null);
    try {
      const response = await examenAPI.updateHabilitacion(capitulo, nextValue);
      if (response.success) {
        setHabilitaciones((prev) => ({
          ...prev,
          [String(capitulo)]: nextValue
        }));
      }
    } catch (err) {
      setHabilitacionesError(err.message || 'Error al actualizar habilitación');
      console.error('Error al actualizar habilitación:', err);
    } finally {
      setSavingHabilitacion(null);
    }
  };

  const loadPreguntas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await preguntaAPI.getByCapitulo(capituloSeleccionado);
      if (response.success) {
        setPreguntas(response.data.preguntas);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar preguntas');
      console.error('Error al cargar preguntas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPregunta = (pregunta) => {
    setEditingPregunta({ ...pregunta });
  };

  const handleEditOpcion = (opcion, preguntaId) => {
    setEditingOpcion({ ...opcion, preguntaId });
  };

  const handleSavePregunta = async () => {
    if (!editingPregunta) return;

    setSaving(true);
    setError(null);
    try {
      const response = await preguntaAPI.update(editingPregunta.id, {
        enunciado: editingPregunta.enunciado,
        activa: editingPregunta.activa
      });

      if (response.success) {
        await loadPreguntas();
        setEditingPregunta(null);
      }
    } catch (err) {
      setError(err.message || 'Error al guardar pregunta');
      console.error('Error al guardar pregunta:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOpcion = async () => {
    if (!editingOpcion) return;

    setSaving(true);
    setError(null);
    try {
      const response = await opcionAPI.update(editingOpcion.id, {
        texto: editingOpcion.texto,
        esCorrecta: editingOpcion.esCorrecta
      });

      if (response.success) {
        await loadPreguntas();
        setEditingOpcion(null);
      }
    } catch (err) {
      setError(err.message || 'Error al guardar opción');
      console.error('Error al guardar opción:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingPregunta(null);
    setEditingOpcion(null);
  };

  const handleNewPreguntaChange = (field, value) => {
    setNewPregunta((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionTextChange = (index, texto) => {
    setNewPregunta((prev) => ({
      ...prev,
      opciones: prev.opciones.map((opcion, idx) =>
        idx === index ? { ...opcion, texto } : opcion
      )
    }));
  };

  const handleCorrectOptionChange = (index) => {
    setNewPregunta((prev) => ({
      ...prev,
      opciones: prev.opciones.map((opcion, idx) => ({
        ...opcion,
        esCorrecta: idx === index
      }))
    }));
  };

  const handleAddOption = () => {
    setNewPregunta((prev) => ({
      ...prev,
      opciones: [...prev.opciones, { texto: '', esCorrecta: false }]
    }));
  };

  const handleRemoveOption = (index) => {
    setNewPregunta((prev) => {
      if (prev.opciones.length <= 2) {
        return prev;
      }

      const opciones = prev.opciones.filter((_, idx) => idx !== index);
      const tieneCorrecta = opciones.some((opcion) => opcion.esCorrecta);

      if (!tieneCorrecta && opciones.length > 0) {
        opciones[0].esCorrecta = true;
      }

      return {
        ...prev,
        opciones
      };
    });
  };

  const validateNewPregunta = () => {
    const enunciadoValido = newPregunta.enunciado.trim().length > 0;
    if (!enunciadoValido) return 'El enunciado es requerido';

    if (!Array.isArray(newPregunta.opciones) || newPregunta.opciones.length < 2) {
      return 'Debe ingresar al menos 2 opciones';
    }

    const opcionesVacias = newPregunta.opciones.some((opcion) => !opcion.texto.trim());
    if (opcionesVacias) return 'Todas las opciones deben tener texto';

    const correctas = newPregunta.opciones.filter((opcion) => opcion.esCorrecta).length;
    if (correctas !== 1) return 'Debe seleccionar exactamente una opción correcta';

    return null;
  };

  const resetNewPreguntaForm = () => {
    setNewPregunta({
      enunciado: '',
      activa: true,
      opciones: [
        { texto: '', esCorrecta: true },
        { texto: '', esCorrecta: false }
      ]
    });
  };

  const handleCreatePregunta = async (e) => {
    e.preventDefault();
    setCreateError(null);

    const errorValidacion = validateNewPregunta();
    if (errorValidacion) {
      setCreateError(errorValidacion);
      return;
    }

    setCreating(true);
    try {
      const response = await preguntaAPI.create({
        enunciado: newPregunta.enunciado.trim(),
        capitulo: capituloSeleccionado,
        activa: newPregunta.activa,
        opciones: newPregunta.opciones.map((opcion) => ({
          texto: opcion.texto.trim(),
          esCorrecta: opcion.esCorrecta
        }))
      });

      if (response.success) {
        resetNewPreguntaForm();
        await loadPreguntas();
      }
    } catch (err) {
      setCreateError(err.message || 'Error al crear pregunta');
      console.error('Error al crear pregunta:', err);
    } finally {
      setCreating(false);
    }
  };

  // Verificar acceso admin
  if (!isAuthenticated || userRole !== 'admin') {
    return (
      <div className="gestion-preguntas">
        <div className="access-denied">
          <h1>Acceso Denegado</h1>
          <p>Esta página es solo para administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gestion-preguntas">
      <h1 className="page-title">Gestión de Preguntas</h1>

      <div className="filters-section">
        <label htmlFor="capitulo-select">Seleccionar Capítulo:</label>
        <select
          id="capitulo-select"
          value={capituloSeleccionado}
          onChange={(e) => setCapituloSeleccionado(e.target.value)}
          className="capitulo-select"
        >
          {capitulos.map(cap => (
            <option key={cap} value={cap}>Capítulo {cap}</option>
          ))}
        </select>
        <button className="btn-secondary" onClick={loadPreguntas} disabled={loading}>
          {loading ? 'Cargando...' : 'Recargar'}
        </button>
      </div>

      <div className="exam-access-section">
        <h2>Habilitación de Exámenes por Capítulo</h2>
        <p className="exam-access-description">
          Define qué capítulos están habilitados para que los alumnos puedan rendir examen.
        </p>
        {habilitacionesError && <div className="error-message">{habilitacionesError}</div>}
        {loadingHabilitaciones ? (
          <div className="loading-message">Cargando habilitaciones...</div>
        ) : (
          <div className="exam-access-grid">
            {capitulos.map((capitulo) => {
              const habilitado = habilitaciones[capitulo] === true;
              const bloqueado = savingHabilitacion === capitulo;

              return (
                <div key={`habilitacion-${capitulo}`} className="exam-access-item">
                  <span className="exam-access-title">Capítulo {capitulo}</span>
                  <button
                    type="button"
                    className={`toggle-btn ${habilitado ? 'enabled' : 'disabled'}`}
                    onClick={() => handleToggleHabilitacion(capitulo, !habilitado)}
                    disabled={bloqueado}
                  >
                    {bloqueado ? 'Guardando...' : habilitado ? 'Habilitado' : 'Bloqueado'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="create-question-section">
        <h2>Crear Nueva Pregunta</h2>
        {createError && <div className="error-message">{createError}</div>}
        <form onSubmit={handleCreatePregunta} className="create-question-form">
          <label className="form-label">
            Enunciado
            <textarea
              value={newPregunta.enunciado}
              onChange={(e) => handleNewPreguntaChange('enunciado', e.target.value)}
              className="edit-textarea"
              rows="3"
              placeholder="Escribe el enunciado de la pregunta"
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={newPregunta.activa}
              onChange={(e) => handleNewPreguntaChange('activa', e.target.checked)}
            />
            Pregunta activa
          </label>

          <div className="new-options-container">
            <div className="new-options-header">
              <h3>Opciones</h3>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddOption}
                disabled={newPregunta.opciones.length >= 6}
              >
                Agregar opción
              </button>
            </div>

            {newPregunta.opciones.map((opcion, index) => (
              <div key={`new-option-${index}`} className="new-option-row">
                <input
                  type="radio"
                  name="new-correct-option"
                  checked={opcion.esCorrecta}
                  onChange={() => handleCorrectOptionChange(index)}
                  title="Marcar como correcta"
                />
                <textarea
                  value={opcion.texto}
                  onChange={(e) => handleOptionTextChange(index, e.target.value)}
                  className="edit-textarea"
                  rows="2"
                  placeholder={`Opción ${index + 1}`}
                />
                <button
                  type="button"
                  className="btn-remove-option"
                  onClick={() => handleRemoveOption(index)}
                  disabled={newPregunta.opciones.length <= 2}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="edit-actions">
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? 'Creando...' : 'Crear pregunta'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && preguntas.length === 0 ? (
        <div className="loading-message">Cargando preguntas...</div>
      ) : preguntas.length === 0 ? (
        <div className="no-data">No hay preguntas para este capítulo</div>
      ) : (
        <div className="preguntas-list">
          {preguntas.map((pregunta) => (
            <div key={pregunta.id} className="pregunta-card">
              <div className="pregunta-header">
                <h3>Pregunta #{pregunta.id}</h3>
                <div className="pregunta-status">
                  <span className={`status-badge ${pregunta.activa ? 'active' : 'inactive'}`}>
                    {pregunta.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>

              {editingPregunta?.id === pregunta.id ? (
                <div className="edit-form">
                  <textarea
                    value={editingPregunta.enunciado}
                    onChange={(e) =>
                      setEditingPregunta({ ...editingPregunta, enunciado: e.target.value })
                    }
                    className="edit-textarea"
                    rows="3"
                  />
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={editingPregunta.activa}
                      onChange={(e) =>
                        setEditingPregunta({ ...editingPregunta, activa: e.target.checked })
                      }
                    />
                    Pregunta activa
                  </label>
                  <div className="edit-actions">
                    <button
                      className="btn-primary"
                      onClick={handleSavePregunta}
                      disabled={saving}
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button className="btn-secondary" onClick={handleCancelEdit}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="pregunta-enunciado">{pregunta.enunciado}</p>
                  <button
                    className="btn-edit"
                    onClick={() => handleEditPregunta(pregunta)}
                  >
                    Editar Pregunta
                  </button>
                </>
              )}

              <div className="opciones-list">
                <h4>Opciones de Respuesta:</h4>
                {pregunta.opciones && pregunta.opciones.length > 0 ? (
                  pregunta.opciones.map((opcion) => (
                    <div
                      key={opcion.id}
                      className={`opcion-item ${opcion.esCorrecta ? 'correct' : ''}`}
                    >
                      {editingOpcion?.id === opcion.id ? (
                        <div className="edit-opcion-form">
                          <textarea
                            value={editingOpcion.texto}
                            onChange={(e) =>
                              setEditingOpcion({ ...editingOpcion, texto: e.target.value })
                            }
                            className="edit-textarea"
                            rows="2"
                          />
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={editingOpcion.esCorrecta}
                              onChange={(e) =>
                                setEditingOpcion({
                                  ...editingOpcion,
                                  esCorrecta: e.target.checked
                                })
                              }
                            />
                            Respuesta correcta
                          </label>
                          <div className="edit-actions">
                            <button
                              className="btn-primary"
                              onClick={handleSaveOpcion}
                              disabled={saving}
                            >
                              {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button className="btn-secondary" onClick={handleCancelEdit}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="opcion-content">
                            <span className="opcion-texto">{opcion.texto}</span>
                            {opcion.esCorrecta && (
                              <span className="correct-badge">✓ Correcta</span>
                            )}
                          </div>
                          <button
                            className="btn-edit-small"
                            onClick={() => handleEditOpcion(opcion, pregunta.id)}
                          >
                            Editar
                          </button>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-opciones">No hay opciones para esta pregunta</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GestionPreguntas;

