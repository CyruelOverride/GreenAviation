import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { examenAPI } from '../../services/api';
import './Examenes.css';

const Examenes = ({ isAuthenticated, userRole }) => {
  const [examen, setExamen] = useState(null);
  const [examenStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [examFinished, setExamFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [capituloSeleccionado, setCapituloSeleccionado] = useState(null);
  const [habilitaciones, setHabilitaciones] = useState({});
  const [loadingHabilitaciones, setLoadingHabilitaciones] = useState(true);

  // Capítulos disponibles (1-13)
  const capitulos = Array.from({ length: 13 }, (_, i) => i + 1);

  // Cargar habilitaciones de exámenes por capítulo
  useEffect(() => {
    const fetchHabilitaciones = async () => {
      if (!isAuthenticated) {
        setLoadingHabilitaciones(false);
        return;
      }

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
        console.error('Error al cargar habilitaciones de exámenes:', err);
      } finally {
        setLoadingHabilitaciones(false);
      }
    };

    fetchHabilitaciones();
  }, [isAuthenticated]);

  // Verificar si un examen está desbloqueado por configuración admin
  const isExamenDesbloqueado = (capitulo) => {
    // Admin tiene acceso a todo
    if (userRole === 'admin') return true;

    return habilitaciones[String(capitulo)] === true;
  };

  // Obtener mensaje de bloqueo para un examen
  const getMensajeBloqueoExamen = (capitulo) => {
    if (userRole === 'admin') return null;

    if (habilitaciones[String(capitulo)] !== true) {
      return 'Examen bloqueado por administración';
    }

    return null;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishExam = useCallback(async () => {
    if (!examen) return;
    try {
      const response = await examenAPI.finalizar(examen.id);
      if (response.success) {
        setExamFinished(true);
        setExamStarted(false);
        setExamen(response.data.examen);
      }
    } catch (err) {
      setError(err.message || 'Error al finalizar el examen');
      console.error('Error al finalizar examen:', err);
    }
  }, [examen]);

  useEffect(() => {
    if (examenStarted && timeRemaining > 0 && examen) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examenStarted, timeRemaining, examen, handleFinishExam]);

  // Sincronizar selectedAnswer con userAnswers cuando cambia la pregunta
  useEffect(() => {
    if (examen && examen.preguntas && examen.preguntas[currentQuestion]) {
      const pregunta = examen.preguntas[currentQuestion];
      const savedAnswer = userAnswers[pregunta.id];
      setSelectedAnswer(savedAnswer || null);
    }
  }, [currentQuestion, examen, userAnswers]);

  const handleStartExam = async (capitulo) => {
    setLoading(true);
    setError(null);
    try {
      const response = await examenAPI.create({
        nombre: `Examen Capítulo ${capitulo}`,
        capitulo: String(capitulo),
        numPreguntas: 15,
        tiempoLimite: 60
      });

      if (response.success) {
        const nuevoExamen = response.data.examen;
        setExamen(nuevoExamen);
        setExamStarted(true);
        setCapituloSeleccionado(capitulo);
        // Convertir tiempo límite de minutos a segundos
        setTimeRemaining((nuevoExamen.tiempoLimite || 60) * 60);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setUserAnswers({});
        setExamFinished(false);
      }
    } catch (err) {
      setError(err.message || 'Error al crear el examen');
      console.error('Error al crear examen:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = async (preguntaId, opcionId) => {
    if (!examen) return;
    setSelectedAnswer(opcionId);
    setUserAnswers(prev => ({
      ...prev,
      [preguntaId]: opcionId
    }));

    // Guardar respuesta en el backend
    try {
      await examenAPI.responderPregunta(examen.id, preguntaId, opcionId);
    } catch (err) {
      console.error('Error al guardar respuesta:', err);
    }
  };

  const resetExam = () => {
    setExamen(null);
    setExamStarted(false);
    setTimeRemaining(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserAnswers({});
    setExamFinished(false);
    setCapituloSeleccionado(null);
    setError(null);
  };

  // Vista de resultados
  if (examFinished && examen && examen.preguntas) {
    // Calcular estadísticas
    const totalPreguntas = examen.preguntas.length;
    const respuestasCorrectas = examen.preguntas.filter(p => {
      const opcionSeleccionada = p.opciones.find(o => o.id === p.opcionSeleccionadaId);
      return opcionSeleccionada && opcionSeleccionada.esCorrecta;
    }).length;
    const respuestasIncorrectas = totalPreguntas - respuestasCorrectas;

    return (
      <div className="examenes">
        <div className="exam-results">
          <h1 className="page-title">Resultados del Examen</h1>
          <div className="results-summary">
            <div className="summary-card">
              <h2>Resumen</h2>
              <div className="summary-stats">
                <div className="stat-item score">
                  <span className="stat-label">Calificación:</span>
                  <span className="stat-value">{examen.puntaje?.toFixed(2) || 0}%</span>
                </div>
                <div className="stat-item correct">
                  <span className="stat-label">Correctas:</span>
                  <span className="stat-value">{respuestasCorrectas} / {totalPreguntas}</span>
                </div>
                <div className="stat-item incorrect">
                  <span className="stat-label">Incorrectas:</span>
                  <span className="stat-value">{respuestasIncorrectas} / {totalPreguntas}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Capítulo:</span>
                  <span className="stat-value">{examen.capitulo}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Estado:</span>
                  <span className="stat-value">{examen.estado}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="results-details">
            <h2>Correcciones</h2>
            <p className="corrections-intro">
              Revisa tus respuestas. Las preguntas incorrectas muestran tu respuesta y la respuesta correcta.
            </p>
            {examen.preguntas.map((pregunta, index) => {
              const opcionSeleccionada = pregunta.opciones.find(o => o.id === pregunta.opcionSeleccionadaId);
              const opcionCorrecta = pregunta.opciones.find(o => o.esCorrecta);
              const isCorrect = opcionSeleccionada && opcionSeleccionada.esCorrecta;

              return (
                <div key={pregunta.id} className={`result-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-question-header">
                    <span className="question-number">Pregunta {index + 1}</span>
                    <span className={`result-badge ${isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>
                      {isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                    </span>
                  </div>
                  <p className="result-question">{pregunta.enunciado}</p>
                  <div className="result-answers">
                    <div className="answer-row">
                      <span className="answer-label">Tu respuesta:</span>
                      <span className={`answer-value ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {opcionSeleccionada 
                          ? opcionSeleccionada.texto
                          : 'Sin responder'}
                      </span>
                    </div>
                    {!isCorrect && opcionCorrecta && (
                      <div className="answer-row">
                        <span className="answer-label">Respuesta correcta:</span>
                        <span className="answer-value correct">
                          {opcionCorrecta.texto}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="results-actions">
            <button className="btn-primary" onClick={resetExam}>
              Volver a Exámenes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista del examen en progreso
  if (examenStarted && examen && examen.preguntas) {
    const pregunta = examen.preguntas[currentQuestion];
    if (!pregunta) {
      return <div>Cargando pregunta...</div>;
    }

    const savedAnswer = userAnswers[pregunta.id] || selectedAnswer;

    return (
      <div className="examenes">
        <div className="exam-header">
          <h1>{examen.nombre}</h1>
          <div className="timer">
            <span className="timer-label">Tiempo restante:</span>
            <span className={`timer-value ${timeRemaining < 300 ? 'timer-warning' : ''}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="exam-content">
          <div className="question-card">
            <div className="question-number">
              Pregunta {currentQuestion + 1} de {examen.preguntas.length}
            </div>
            <h2>{pregunta.enunciado}</h2>
            <div className="answers">
              {pregunta.opciones.map((opcion, index) => {
                const isSelected = savedAnswer === opcion.id;
                return (
                  <label key={opcion.id} className={`answer-option ${isSelected ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`answer-${pregunta.id}`}
                      value={opcion.id}
                      checked={isSelected}
                      onChange={() => handleAnswerChange(pregunta.id, opcion.id)}
                    />
                    <span>{opcion.texto}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div className="exam-actions">
            <button
              className="btn-secondary"
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1);
                }
              }}
              disabled={currentQuestion === 0}
            >
              Anterior
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                if (currentQuestion < examen.preguntas.length - 1) {
                  setCurrentQuestion(currentQuestion + 1);
                }
              }}
              disabled={currentQuestion === examen.preguntas.length - 1}
            >
              Siguiente
            </button>
            <button className="btn-danger" onClick={handleFinishExam}>
              Finalizar Examen
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista no autenticada
  if (!isAuthenticated) {
    return (
      <div className="examenes">
        <h1 className="page-title">Exámenes Online</h1>
        <div className="info-card-unauthenticated">
          <h2>📝 Sistema de Exámenes</h2>
          <p>En esta sección encontrarás:</p>
          <ul>
            <li>Exámenes por capítulo del curso</li>
            <li>Temporizador automático durante cada evaluación</li>
            <li>Resultados detallados con correcciones</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder a los exámenes</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  // Vista principal con exámenes por capítulo
  return (
    <div className="examenes">
      <h1 className="page-title">Exámenes Online</h1>
      
      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading-message">Creando examen...</div>}

      <div className="exams-section">
        <h2>Exámenes por Capítulo</h2>
        <p className="section-description">
          Selecciona un capítulo para realizar un examen con 15 preguntas aleatorias.
          <br />
          <strong>Nota:</strong> La disponibilidad de cada examen la define administración.
        </p>
        {loadingHabilitaciones ? (
          <div className="loading-message">Cargando disponibilidad...</div>
        ) : (
          <div className="exams-grid">
            {capitulos.map(capitulo => {
              const desbloqueado = isExamenDesbloqueado(capitulo);
              const mensajeBloqueo = getMensajeBloqueoExamen(capitulo);
              
              return (
                <div key={capitulo} className={`exam-card ${!desbloqueado ? 'locked' : ''}`}>
                  <div className="exam-icon">{desbloqueado ? '📝' : '🔒'}</div>
                  <h3>Capítulo {capitulo}</h3>
                  <div className="exam-info">
                    <span>Duración: 60 minutos</span>
                    <span>Preguntas: 15</span>
                  </div>
                  {mensajeBloqueo && (
                    <p className="exam-lock-message">{mensajeBloqueo}</p>
                  )}
                  <button
                    className={desbloqueado ? "btn-primary" : "btn-disabled"}
                    onClick={() => desbloqueado && handleStartExam(capitulo)}
                    disabled={loading || !desbloqueado}
                  >
                    {loading && capituloSeleccionado === capitulo 
                      ? 'Creando...' 
                      : desbloqueado 
                        ? 'Hacer Examen' 
                        : 'Bloqueado'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Examenes;
