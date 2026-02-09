import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Examenes.css';

const Examenes = ({ isAuthenticated, userRole }) => {
  const [selectedExam, setSelectedExam] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(3600);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState({});
  const [examFinished, setExamFinished] = useState(false);
  const [examResults, setExamResults] = useState(null);

  // Obtener progreso del usuario
  const getProgress = () => {
    if (userRole === 'admin') return 100;
    const savedProgress = localStorage.getItem('userProgress');
    return savedProgress ? parseInt(savedProgress) : 35;
  };

  const userProgress = getProgress();

  // Exámenes por capítulo
  const capituloExams = [
    { id: 'capitulo-1', title: 'Examen Capítulo 1: Introducción', available: false },
    { id: 'capitulo-2', title: 'Examen Capítulo 2: Aerodinámica', available: false },
    { id: 'capitulo-3', title: 'Examen Capítulo 3: Meteorología', available: false },
    { id: 'capitulo-4', title: 'Examen Capítulo 4: Navegación', available: false },
    { id: 'capitulo-5', title: 'Examen Capítulo 5: Regulaciones', available: false },
  ];

  // Examen Final
  const finalExams = [
    { id: 'final-1', title: 'Examen Final', available: false },
  ];

  // Pre Solo - requiere 100% de progreso
  const preSoloExams = [
    { id: 'pre-solo-1', title: 'Examen Pre Solo', available: userProgress === 100 },
  ];

  // Examen de Prueba 1 - único examen funcional
  const pruebaExam = {
    id: 'prueba-1',
    title: 'Examen de Prueba 1',
    available: true,
    duration: 30
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining]);

  // Preguntas del Examen de Prueba 1
  const testQuestions = [
    {
      id: 1,
      question: '¿Cuánto es 2 + 2?',
      answers: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
      correct: 'B'
    },
    {
      id: 2,
      question: '¿Cuánto es 5 × 3?',
      answers: ['A) 10', 'B) 15', 'C) 20', 'D) 25'],
      correct: 'B'
    },
    {
      id: 3,
      question: '¿Cuánto es 10 - 4?',
      answers: ['A) 4', 'B) 5', 'C) 6', 'D) 7'],
      correct: 'C'
    },
    {
      id: 4,
      question: '¿Cuánto es 8 ÷ 2?',
      answers: ['A) 2', 'B) 3', 'C) 4', 'D) 5'],
      correct: 'C'
    },
    {
      id: 5,
      question: '¿Cuánto es 3 + 7?',
      answers: ['A) 8', 'B) 9', 'C) 10', 'D) 11'],
      correct: 'C'
    },
    {
      id: 6,
      question: '¿Cuánto es 6 × 4?',
      answers: ['A) 20', 'B) 22', 'C) 24', 'D) 26'],
      correct: 'C'
    },
    {
      id: 7,
      question: '¿Cuánto es 15 - 8?',
      answers: ['A) 5', 'B) 6', 'C) 7', 'D) 8'],
      correct: 'C'
    },
    {
      id: 8,
      question: '¿Cuánto es 12 ÷ 3?',
      answers: ['A) 3', 'B) 4', 'C) 5', 'D) 6'],
      correct: 'B'
    },
    {
      id: 9,
      question: '¿Cuánto es 9 + 6?',
      answers: ['A) 13', 'B) 14', 'C) 15', 'D) 16'],
      correct: 'C'
    },
    {
      id: 10,
      question: '¿Cuánto es 7 × 2?',
      answers: ['A) 12', 'B) 13', 'C) 14', 'D) 15'],
      correct: 'C'
    }
  ];

  const handleAnswerChange = (questionId, answer) => {
    setSelectedAnswer(answer);
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateResults = () => {
    let correct = 0;
    const results = testQuestions.map(question => {
      const userAnswer = userAnswers[question.id] || '';
      const isCorrect = userAnswer === question.correct;
      if (isCorrect) {
        correct++;
      }
      return {
        ...question,
        userAnswer,
        isCorrect,
        correctAnswer: question.correct
      };
    });

    const score = Math.round((correct / testQuestions.length) * 100);
    
    return {
      total: testQuestions.length,
      correct,
      incorrect: testQuestions.length - correct,
      score,
      details: results
    };
  };

  const handleFinishExam = () => {
    const results = calculateResults();
    setExamResults(results);
    setExamFinished(true);
  };

  const handleStartExam = (exam) => {
    if (exam.id === 'prueba-1') {
      setSelectedExam(exam);
      setExamStarted(true);
      setTimeRemaining(exam.duration * 60);
      setCurrentQuestion(0);
      setSelectedAnswer('');
      setUserAnswers({});
      setExamFinished(false);
      setExamResults(null);
    }
  };

  const handleDisabledButton = () => {
    // Botones que no hacen nada
    alert('Este examen aún no está disponible.');
  };

  // Sincronizar selectedAnswer con userAnswers cuando cambia la pregunta
  React.useEffect(() => {
    if (examStarted && selectedExam) {
      const question = testQuestions[currentQuestion];
      if (question) {
        const savedAnswer = userAnswers[question.id];
        setSelectedAnswer(savedAnswer || '');
      }
    }
  }, [currentQuestion, examStarted, selectedExam, userAnswers]);

  // Vista de resultados
  if (examFinished && examResults) {
    return (
      <div className="examenes">
        <div className="exam-results">
          <h1 className="page-title">Resultados del Examen</h1>
          <div className="results-summary">
            <div className="summary-card">
              <h2>Resumen</h2>
              <div className="summary-stats">
                <div className="stat-item correct">
                  <span className="stat-label">Correctas:</span>
                  <span className="stat-value">{examResults.correct} / {examResults.total}</span>
                </div>
                <div className="stat-item incorrect">
                  <span className="stat-label">Incorrectas:</span>
                  <span className="stat-value">{examResults.incorrect} / {examResults.total}</span>
                </div>
                <div className="stat-item score">
                  <span className="stat-label">Calificación:</span>
                  <span className="stat-value">{examResults.score}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="results-details">
            <h2>Correcciones</h2>
            <p className="corrections-intro">
              Revisa tus respuestas. Las preguntas incorrectas muestran tu respuesta y la respuesta correcta.
            </p>
            {examResults.details.map((result, index) => (
              <div key={result.id} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                <div className="result-question-header">
                  <span className="question-number">Pregunta {index + 1}</span>
                  <span className={`result-badge ${result.isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>
                    {result.isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
                  </span>
                </div>
                <p className="result-question">{result.question}</p>
                <div className="result-answers">
                  <div className="answer-row">
                    <span className="answer-label">Tu respuesta:</span>
                    <span className={`answer-value ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                      {result.userAnswer 
                        ? `${result.userAnswer}) ${result.answers[result.userAnswer.charCodeAt(0) - 65].substring(3)}`
                        : 'Sin responder'}
                    </span>
                  </div>
                  {!result.isCorrect && (
                    <div className="answer-row">
                      <span className="answer-label">Respuesta correcta:</span>
                      <span className="answer-value correct">
                        {result.correctAnswer}) {result.answers[result.correctAnswer.charCodeAt(0) - 65].substring(3)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="results-actions">
            <button 
              className="btn-primary"
              onClick={() => {
                setExamFinished(false);
                setExamResults(null);
                setExamStarted(false);
                setSelectedExam(null);
                setCurrentQuestion(0);
                setSelectedAnswer('');
                setUserAnswers({});
              }}
            >
              Volver a Exámenes
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vista del examen en progreso
  if (examStarted && selectedExam) {
    const question = testQuestions[currentQuestion];
    const savedAnswer = userAnswers[question.id] || selectedAnswer;
    
    return (
      <div className="examenes">
        <div className="exam-header">
          <h1>{selectedExam.title}</h1>
          <div className="timer">
            <span className="timer-label">Tiempo restante:</span>
            <span className="timer-value">{formatTime(timeRemaining)}</span>
          </div>
        </div>
        <div className="exam-content">
          <div className="question-card">
            <div className="question-number">Pregunta {currentQuestion + 1} de {testQuestions.length}</div>
            <h2>{question.question}</h2>
            <div className="answers">
              {question.answers.map((answer, index) => {
                const option = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = savedAnswer === option;
                return (
                  <label key={index} className="answer-option">
                    <input 
                      type="radio" 
                      name={`answer-${question.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                    <span>{answer}</span>
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
                  const prevQuestion = testQuestions[currentQuestion - 1];
                  setCurrentQuestion(currentQuestion - 1);
                  setSelectedAnswer(userAnswers[prevQuestion.id] || '');
                }
              }}
              disabled={currentQuestion === 0}
            >
              Anterior
            </button>
            <button 
              className="btn-primary"
              onClick={() => {
                if (currentQuestion < testQuestions.length - 1) {
                  const nextQuestion = testQuestions[currentQuestion + 1];
                  setCurrentQuestion(currentQuestion + 1);
                  setSelectedAnswer(userAnswers[nextQuestion.id] || '');
                }
              }}
              disabled={currentQuestion === testQuestions.length - 1}
            >
              Siguiente
            </button>
            <button 
              className="btn-danger"
              onClick={handleFinishExam}
            >
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
            <li>Examen Pre-Solo (requiere 100% de progreso)</li>
            <li>Examen General Final</li>
            <li>Temporizador automático durante cada evaluación</li>
            <li>Resultados detallados con correcciones</li>
          </ul>
          <p className="auth-prompt">Inicia sesión para acceder a los exámenes</p>
          <Link to="/login" className="btn-primary">Iniciar Sesión</Link>
        </div>
      </div>
    );
  }

  // Vista principal con las 3 secciones
  return (
    <div className="examenes">
      <h1 className="page-title">Exámenes Online</h1>
      
      {/* Examen de Prueba 1 */}
      <div className="exams-section">
        <h2>Examen de Prueba</h2>
        <p className="section-description">
          Examen de práctica para familiarizarte con el sistema.
        </p>
        <div className="exams-grid">
          <div className="exam-card">
            <div className="exam-icon">📝</div>
            <h3>{pruebaExam.title}</h3>
            <div className="exam-info">
              <span>Duración: {pruebaExam.duration} minutos</span>
              <span>Tipo: Práctica</span>
            </div>
            <button 
              className="btn-primary"
              onClick={() => handleStartExam(pruebaExam)}
            >
              Iniciar Examen
            </button>
          </div>
        </div>
      </div>

      {/* Exámenes por Capítulo */}
      <div className="exams-section">
        <h2>Exámenes por Capítulo</h2>
        <p className="section-description">
          Exámenes específicos de cada capítulo del curso.
        </p>
        <div className="exams-grid">
          {capituloExams.map(exam => (
            <div key={exam.id} className="exam-card locked">
              <div className="exam-icon">🔒</div>
              <h3>{exam.title}</h3>
              <div className="exam-info">
                <span>Duración: 30 minutos</span>
                <span>Tipo: Por Capítulo</span>
              </div>
              <button 
                className="btn-disabled" 
                onClick={handleDisabledButton}
              >
                No Disponible
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Examen Final */}
      <div className="exams-section">
        <h2>Examen Final</h2>
        <p className="section-description">
          Examen general que cubre todos los temas del curso.
        </p>
        <div className="exams-grid">
          {finalExams.map(exam => (
            <div key={exam.id} className="exam-card locked">
              <div className="exam-icon">🔒</div>
              <h3>{exam.title}</h3>
              <div className="exam-info">
                <span>Duración: 120 minutos</span>
                <span>Tipo: Final</span>
              </div>
              <button 
                className="btn-disabled" 
                onClick={handleDisabledButton}
              >
                No Disponible
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pre Solo */}
      <div className="exams-section">
        <h2>Pre Solo</h2>
        <p className="section-description">
          Este examen requiere haber completado el 100% del progreso del curso.
          {userProgress < 100 && (
            <span className="progress-warning"> Tu progreso actual: {userProgress}%</span>
          )}
        </p>
        <div className="exams-grid">
          {preSoloExams.map(exam => (
            <div key={exam.id} className={`exam-card ${!exam.available ? 'locked' : ''}`}>
              <div className="exam-icon">{exam.available ? '✈️' : '🔒'}</div>
              <h3>{exam.title}</h3>
              <div className="exam-info">
                <span>Duración: 45 minutos</span>
                <span>Tipo: Pre Solo</span>
                {!exam.available && (
                  <span className="requirement">Requiere: 100% de progreso</span>
                )}
              </div>
              {exam.available ? (
                <button 
                  className="btn-primary"
                  onClick={handleDisabledButton}
                >
                  Iniciar Examen
                </button>
              ) : (
                <button 
                  className="btn-disabled" 
                  onClick={handleDisabledButton}
                >
                  Requiere 100% de Progreso
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Examenes;
