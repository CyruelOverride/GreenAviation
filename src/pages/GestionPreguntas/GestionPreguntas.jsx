import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { preguntaAPI, opcionAPI, capituloAPI } from '../../services/api';
import './GestionPreguntas.css';

const GestionPreguntas = ({ isAuthenticated, userRole }) => {
  const [capitulos, setCapitulos] = useState([]);
  const [capituloSeleccionadoId, setCapituloSeleccionadoId] = useState('');
  const [preguntas, setPreguntas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingCapitulos, setLoadingCapitulos] = useState(false);
  const [error, setError] = useState(null);
  const [editingPregunta, setEditingPregunta] = useState(null);
  const [editingOpcion, setEditingOpcion] = useState(null);
  const [saving, setSaving] = useState(false);
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
  const loadCapitulos = async () => {
    setLoadingCapitulos(true);
    try {
      const response = await capituloAPI.list();
      if (response.success) {
        const list = response.data.capitulos || [];
        setCapitulos(list);
        setCapituloSeleccionadoId((prev) => {
          if (prev && list.some((c) => String(c.id) === String(prev))) return prev;
          return list[0] ? String(list[0].id) : '';
        });
      }
    } catch (err) {
      setError(err.message || 'Error al cargar capítulos');
      console.error(err);
    } finally {
      setLoadingCapitulos(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      loadCapitulos();
    }
  }, [isAuthenticated, userRole]);

  useEffect(() => {
    if (isAuthenticated && userRole === 'admin' && capituloSeleccionadoId) {
      loadPreguntas();
    }
  }, [capituloSeleccionadoId, isAuthenticated, userRole]);

  const loadPreguntas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await preguntaAPI.getByCapituloId(capituloSeleccionadoId);
      if (response.success) {
        setPreguntas(response.data.preguntas);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar preguntas');
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
        capituloId: parseInt(capituloSeleccionadoId, 10),
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
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const capituloActivo = capitulos.find((c) => String(c.id) === String(capituloSeleccionadoId));

  const preguntasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return preguntas;
    return preguntas.filter(
      (p) =>
        (p.enunciado || '').toLowerCase().includes(q) ||
        String(p.id).includes(q)
    );
  }, [preguntas, busqueda]);

  const totalActivas = useMemo(
    () => preguntas.filter((p) => p.activa).length,
    [preguntas]
  );

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
      <header className="gp-page-header">
        <h1 className="page-title">Gestión de preguntas</h1>
        <p className="gp-lead">
          Elegí un capítulo y sumá o editá preguntas del banco. Para crear capítulos o cambiar su configuración, usá{' '}
          <Link to="/gestion-capitulos">Gestión de Capítulos</Link>.
        </p>
      </header>

      <section className="gp-toolbar" aria-label="Capítulo y búsqueda">
        <div className="gp-toolbar-row gp-toolbar-row--main">
          <div className="gp-field gp-field--grow">
            <label htmlFor="capitulo-select" className="gp-field-label">
              Capítulo / examen activo
            </label>
            <select
              id="capitulo-select"
              value={capituloSeleccionadoId}
              onChange={(e) => setCapituloSeleccionadoId(e.target.value)}
              className="capitulo-select gp-select"
              disabled={loadingCapitulos || capitulos.length === 0}
            >
              {capitulos.length === 0 ? (
                <option value="">No hay capítulos</option>
              ) : (
                capitulos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.numeroCurso != null ? ` · tema curso ${c.numeroCurso}` : ''}
                  </option>
                ))
              )}
            </select>
          </div>
          <div className="gp-toolbar-actions">
            <button
              type="button"
              className="btn-secondary gp-btn-icon"
              onClick={() => {
                loadCapitulos();
                loadPreguntas();
              }}
              disabled={loading || loadingCapitulos}
              title="Recargar capítulos y preguntas"
            >
              {loading || loadingCapitulos ? '…' : '↻ Actualizar'}
            </button>
          </div>
        </div>
        <div className="gp-toolbar-row gp-toolbar-row--meta">
          <div className="gp-stat-chips" role="status">
            <span className="gp-chip">
              <strong>{preguntas.length}</strong> preguntas
            </span>
            <span className="gp-chip gp-chip--success">
              <strong>{totalActivas}</strong> activas
            </span>
            {busqueda.trim() && (
              <span className="gp-chip gp-chip--muted">
                Mostrando <strong>{preguntasFiltradas.length}</strong> de {preguntas.length}
              </span>
            )}
          </div>
          <div className="gp-field gp-field--search">
            <label htmlFor="gp-busqueda" className="gp-sr-only">
              Buscar en enunciados
            </label>
            <input
              id="gp-busqueda"
              type="search"
              className="gp-input-search"
              placeholder="Buscar por texto o ID de pregunta…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoComplete="off"
            />
            {busqueda && (
              <button
                type="button"
                className="gp-search-clear"
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="gp-context-card" role="region" aria-label="Contexto del capítulo seleccionado">
        <div className="gp-context-card__accent" aria-hidden />
        <div className="gp-context-card__body">
          <span className="gp-context-card__label">Estás trabajando en</span>
          <p className="gp-context-card__title">
            {capituloActivo ? capituloActivo.nombre : 'Seleccioná un capítulo'}
          </p>
          <ul className="gp-context-card__meta">
            {capituloActivo?.numeroCurso != null && (
              <li>Tema del curso: <strong>{capituloActivo.numeroCurso}</strong></li>
            )}
            {capituloActivo && (
              <li>
                Hasta <strong>{capituloActivo.maxPreguntas}</strong> preguntas por examen aleatorio
              </li>
            )}
            {capituloActivo && (
              <li>
                Examen para alumnos:{' '}
                <strong>{capituloActivo.habilitado ? 'Habilitado' : 'Bloqueado'}</strong>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="create-question-section gp-create-section">
        <h2 className="gp-section-heading">Nueva pregunta en este capítulo</h2>
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
            <button type="submit" className="btn-primary" disabled={creating || !capituloSeleccionadoId}>
              {creating ? 'Creando...' : 'Crear pregunta'}
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      <section className="gp-list-section" aria-label="Listado de preguntas">
        <div className="gp-list-heading">
          <h2 className="gp-section-heading">Preguntas del banco</h2>
          {!loading && preguntas.length > 0 && (
            <p className="gp-list-sub">
              {preguntasFiltradas.length === preguntas.length
                ? `${preguntas.length} en total`
                : `${preguntasFiltradas.length} coincidencias`}
            </p>
          )}
        </div>

      {loading && preguntas.length === 0 ? (
        <div className="loading-message">Cargando preguntas…</div>
      ) : preguntas.length === 0 ? (
        <div className="no-data gp-empty">
          <p className="gp-empty-title">Todavía no hay preguntas</p>
          <p className="gp-empty-text">Creá la primera con el formulario de arriba.</p>
        </div>
      ) : preguntasFiltradas.length === 0 ? (
        <div className="no-data gp-empty">
          <p className="gp-empty-title">Sin resultados</p>
          <p className="gp-empty-text">Probá otra búsqueda o borrá el filtro.</p>
          <button type="button" className="btn-secondary" onClick={() => setBusqueda('')}>
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="preguntas-list">
          {preguntasFiltradas.map((pregunta) => (
            <article key={pregunta.id} className="pregunta-card">
              <div className="pregunta-header">
                <div className="pregunta-header__titles">
                  <span className="pregunta-id-chip">ID {pregunta.id}</span>
                  <h3 className="pregunta-card-title">Pregunta</h3>
                </div>
                <div className="pregunta-status">
                  <span className={`status-badge ${pregunta.activa ? 'active' : 'inactive'}`}>
                    {pregunta.activa ? 'Activa' : 'Inactiva'}
                  </span>
                  {pregunta.opciones?.length > 0 && (
                    <span className="gp-chip gp-chip--muted">{pregunta.opciones.length} opciones</span>
                  )}
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
            </article>
          ))}
        </div>
      )}
      </section>
    </div>
  );
};

export default GestionPreguntas;
