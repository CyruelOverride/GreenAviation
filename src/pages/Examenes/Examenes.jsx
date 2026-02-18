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

  // Capítulos disponibles (1-13)
  const capitulos = Array.from({ length: 13 }, (_, i) => i + 1);

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
  if (examFinished && examen) {
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
        </p>
        <div className="exams-grid">
          {capitulos.map(capitulo => (
            <div key={capitulo} className="exam-card">
              <div className="exam-icon">📝</div>
              <h3>Capítulo {capitulo}</h3>
              <div className="exam-info">
                <span>Duración: 60 minutos</span>
                <span>Preguntas: 15</span>
              </div>
              <button
                className="btn-primary"
                onClick={() => handleStartExam(capitulo)}
                disabled={loading}
              >
                {loading && capituloSeleccionado === capitulo ? 'Creando...' : 'Hacer Examen'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Examenes;
