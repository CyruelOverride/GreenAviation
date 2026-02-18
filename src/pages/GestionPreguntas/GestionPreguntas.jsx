import React, { useState, useEffect } from 'react';
import { preguntaAPI, opcionAPI } from '../../services/api';
import './GestionPreguntas.css';

const GestionPreguntas = ({ isAuthenticated, userRole }) => {
  const [capituloSeleccionado, setCapituloSeleccionado] = useState('1');
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingPregunta, setEditingPregunta] = useState(null);
  const [editingOpcion, setEditingOpcion] = useState(null);
  const [saving, setSaving] = useState(false);

  const capitulos = Array.from({ length: 13 }, (_, i) => String(i + 1));

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin' && capituloSeleccionado) {
      loadPreguntas();
    }
  }, [capituloSeleccionado, isAuthenticated, userRole]);

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

