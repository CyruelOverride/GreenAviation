import React, { useState, useEffect } from 'react';
import { examenAPI } from '../../services/api';
import './Examenes.css';

const DetalleExamen = ({
  examenId,
  onVolver,
  volverLabel = 'Volver a Exámenes',
  embedded = false,
  alumnoNombre = null
}) => {
  const [examen, setExamen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExamen = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await examenAPI.getById(examenId);
        if (response.success) {
          setExamen(response.data.examen);
        } else {
          setError('No se pudo cargar el detalle del examen.');
        }
      } catch (err) {
        setError(err.message || 'Error al cargar el examen.');
      } finally {
        setLoading(false);
      }
    };

    if (examenId) fetchExamen();
  }, [examenId]);

  const wrapperClass = embedded ? 'detalle-examen-embedded' : 'examenes';

  if (loading) {
    return (
      <div className={wrapperClass}>
        <div className="loading-message">Cargando resultado del examen...</div>
      </div>
    );
  }

  if (error || !examen) {
    return (
      <div className={wrapperClass}>
        <div className="error-message">{error || 'Examen no encontrado.'}</div>
        <button className="btn-secondary" style={{ marginTop: 20 }} onClick={onVolver}>
          {volverLabel}
        </button>
      </div>
    );
  }

  const totalPreguntas = examen.preguntas?.length ?? 0;
  const respuestasCorrectas = (examen.preguntas ?? []).filter((p) => {
    const seleccionada = p.opciones.find((o) => o.id === p.opcionSeleccionadaId);
    return seleccionada?.esCorrecta === true;
  }).length;
  const respuestasIncorrectas = totalPreguntas - respuestasCorrectas;
  const fechaFormateada = examen.fechaFinalizacion
    ? new Date(examen.fechaFinalizacion).toLocaleString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '—';

  const titulo = alumnoNombre
    ? `Resultado — ${alumnoNombre}: ${examen.nombre}`
    : `Resultado: ${examen.nombre}`;

  return (
    <div className={wrapperClass}>
      <div className="exam-results">
        <h1 className={`page-title ${embedded ? 'page-title-embedded' : ''}`}>{titulo}</h1>

        <div className="results-summary">
          <div className="summary-card">
            <h2>Resumen</h2>
            <div className="summary-stats">
              <div className="stat-item score">
                <span className="stat-label">Calificación</span>
                <span className="stat-value">{examen.puntaje?.toFixed(2) ?? 0}%</span>
              </div>
              <div className="stat-item correct">
                <span className="stat-label">Correctas</span>
                <span className="stat-value">
                  {respuestasCorrectas} / {totalPreguntas}
                </span>
              </div>
              <div className="stat-item incorrect">
                <span className="stat-label">Incorrectas</span>
                <span className="stat-value">
                  {respuestasIncorrectas} / {totalPreguntas}
                </span>
              </div>
            </div>
            <div className="detalle-meta">
              <span>
                <strong>Capítulo:</strong> {examen.capitulo}
              </span>
              <span>
                <strong>Fecha:</strong> {fechaFormateada}
              </span>
            </div>
          </div>
        </div>

        {totalPreguntas > 0 && (
          <div className="results-details">
            <h2>Correcciones</h2>
            <p className="corrections-intro">
              {alumnoNombre
                ? 'Revisa las respuestas del alumno. Las preguntas incorrectas muestran la respuesta elegida y la correcta.'
                : 'Revisa tus respuestas. Las preguntas incorrectas muestran tu respuesta y la respuesta correcta.'}
            </p>
            {examen.preguntas.map((pregunta, index) => {
              const opcionSeleccionada = pregunta.opciones.find(
                (o) => o.id === pregunta.opcionSeleccionadaId
              );
              const opcionCorrecta = pregunta.opciones.find((o) => o.esCorrecta);
              const isCorrect = opcionSeleccionada?.esCorrecta === true;

              return (
                <div
                  key={pregunta.id}
                  className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}
                >
                  <div className="result-question-header">
                    <span className="question-number">Pregunta {index + 1}</span>
                    <span className={`result-badge ${isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>
                      {isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                    </span>
                  </div>
                  <p className="result-question">{pregunta.enunciado}</p>
                  <div className="result-answers">
                    <div className="answer-row">
                      <span className="answer-label">
                        {alumnoNombre ? 'Respuesta del alumno:' : 'Tu respuesta:'}
                      </span>
                      <span className={`answer-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {opcionSeleccionada ? opcionSeleccionada.texto : 'Sin responder'}
                      </span>
                    </div>
                    {!isCorrect && opcionCorrecta && (
                      <div className="answer-row">
                        <span className="answer-label">Respuesta correcta:</span>
                        <span className="answer-value correct">{opcionCorrecta.texto}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="results-actions">
          <button className="btn-secondary detalle-btn-volver" onClick={onVolver}>
            {volverLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleExamen;
