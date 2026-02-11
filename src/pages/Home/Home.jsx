import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselItems = [
    {
      id: 1,
      image: '/Imagenes/Instruccion 5.jpeg',
      alt: 'Propósito',
      quote: 'Nuestro propósito es formar pilotos seguros, autónomos y conscientes de sus decisiones',
      author: null
    },
    {
      id: 2,
      image: '/Imagenes/Instruccion parte 2.jpg',
      alt: 'Instrucción',
      quote: 'La instrucción eleva la seguridad y es una forma legítima y responsable de vivir la aviación',
      author: null
    },
    {
      id: 3,
      image: '/Imagenes/Foto avion instruccion.jpeg',
      alt: 'Aviación',
      quote: 'Ciencia, libertad, aventura y belleza. ¿Qué más puede pedirse a la vida? Todo eso es aviación',
      author: '— Charles Lindberg'
    }
  ];

  const benefitItems = [
    {
      id: 1,
      image: '/Imagenes/Instruccion 4.jpeg',
      icon: '📝',
      title: 'Exámenes por capítulo y examen final',
      description: 'Evalúa tu conocimiento con exámenes específicos por cada capítulo del curso y un examen final completo que cubre todos los temas.'
    },
    {
      id: 2,
      image: '/Imagenes/Instruccion parte 3.jpg',
      icon: '📊',
      title: 'Seguimiento de progreso',
      description: 'Dashboard personalizado que muestra tu avance en cada módulo y área de conocimiento.'
    },
    {
      id: 3,
      image: '/Imagenes/Panel de control 4.jpeg',
      icon: '✈️',
      title: 'Preparación para chequeo real',
      description: 'Simulaciones y prácticas que replican las condiciones del examen práctico.'
    },
    {
      id: 4,
      image: '/Imagenes/Instruccion parte 3.jpg',
      icon: '🎯',
      title: 'Examen Pre-Solo',
      description: 'Accede al examen Pre-Solo una vez completado el 100% del curso. Evaluación completa para certificar tu preparación antes del vuelo.'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000); // Cambia cada 5 segundos

    return () => clearInterval(interval);
  }, [carouselItems.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">TU SUEÑO COMIENZA AQUÍ</h1>
          <h2 className="hero-subtitle">CAMPUS VIRTUAL – CURSO DE PILOTO PRIVADO</h2>
          <p className="hero-tagline">Enseñamos y formamos aviadores.</p>
          <div className="hero-buttons">
            <Link to="/estudio-teorico" className="btn-primary">Comenzar curso</Link>
            <Link to="/recursos-adicionales" className="btn-secondary">Ver programa</Link>
          </div>
        </div>
      </section>

      <section className="description-section">
        <div className="description-content">
          <h2 className="section-title">Nuestro Compromiso con tu Formación</h2>
          <p className="description-text">
            Reunimos en éste campus virtual, la información que te llevará del primer clic a tu Licencia de Piloto: clases online de alta calidad, videos explicativos que acompañan el estudio teóricos.
          </p>
          <p className="description-text">
            Preparación sólida para el examen escrito de la Dinacia y el entrenamiento práctico que transforma conocimiento en competencia.
          </p>
          <p className="description-text">
            Un camino claro, acompañado por nuestros Instructores, diseñado para que avances con seguridad, eficiencia y confianza.
          </p>
          <p className="description-text">
            Nuestro campus integra instrucción online de primer nivel, cada etapa del camino está pensada para que desarrolles criterio, seguridad y la confianza de volar al alto nivel.
          </p>
          <p className="description-text">
            Aquí, es donde nacen los pilotos que marcan la diferencia.
          </p>
        </div>
      </section>

      <section className="benefits-section">
        <div className="benefits-container">
          <h2 className="section-title">Tu camino hacia la licencia de piloto</h2>
          <div className="benefits-grid">
            {benefitItems.map((item) => (
              <div 
                key={item.id} 
                className="benefit-card" 
                style={{ backgroundImage: `url('${item.image}')` }}
              >
                <div className="benefit-overlay"></div>
                <div className="benefit-content">
                  <div className="benefit-icon">{item.icon}</div>
                  <h3 className="benefit-title">{item.title}</h3>
                  <p className="benefit-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="purpose-section">
        <div className="carousel-container">
          <div className="carousel-wrapper">
            <div 
              className="carousel-slides"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {carouselItems.map((item, index) => (
                <div key={item.id} className="carousel-slide">
                  <div className="carousel-image-wrapper">
                    <img 
                      src={item.image}
                      alt={item.alt}
                    />
                    <div className="carousel-overlay"></div>
                  </div>
                  <div className="carousel-content">
                    <p className="carousel-quote">
                      "{item.quote}"
                    </p>
                    {item.author && (
                      <p className="carousel-author">{item.author}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="carousel-indicators">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                className={`carousel-indicator ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="info-section">
        <div className="info-content">
          <h2 className="section-title">Sobre GreenAviation Campus</h2>
          <p className="section-description">
            GreenAviation Campus es una academia de formación aeronáutica comprometida con la excelencia en la instrucción de pilotos. 
            Nuestro campus virtual ofrece una experiencia de aprendizaje completa que combina teoría, práctica y tecnología 
            para formar pilotos competentes y seguros.
          </p>
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section className="video-section">
        <div className="video-container">
          <h2 className="section-title">Video Referencial</h2>
          <p className="section-description">
            Conoce más sobre nuestro método de enseñanza y la experiencia de aprendizaje en GreenAviation Campus.
          </p>
          <div className="video-wrapper">
            <div className="video-card-featured">
              <div className="video-thumbnail">
                <img 
                  src="https://via.placeholder.com/800x450/22c55e/ffffff?text=Video+Referencial+GreenAviation" 
                  alt="Video referencial"
                />
                <div className="play-overlay">
                  <span className="play-icon">▶</span>
                </div>
              </div>
              <div className="video-info">
                <h3>Introducción a GreenAviation Campus</h3>
                <p>Descubre cómo nuestra plataforma te ayuda a convertirte en un piloto certificado y seguro.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

