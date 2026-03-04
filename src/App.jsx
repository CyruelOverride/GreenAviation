import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import EstudioTeorico from './pages/EstudioTeorico/EstudioTeorico';
import Examenes from './pages/Examenes/Examenes';
import GestionAlumnos from './pages/GestionAlumnos/GestionAlumnos';
import GestionVuelos from './pages/GestionVuelos/GestionVuelos';
import GestionPreguntas from './pages/GestionPreguntas/GestionPreguntas';
import GestionRecursos from './pages/GestionRecursos/GestionRecursos';
import MiPerfil from './pages/MiPerfil/MiPerfil';
import RecursosAdicionales from './pages/RecursosAdicionales/RecursosAdicionales';
import ClasesOnline from './pages/ClasesOnline/ClasesOnline';
import Login from './pages/Login/Login';
import { authAPI } from './services/api';
import './App.css';

// ========== TEMPORAL: Bypass login admin para desarrollo. Con true, al reabrir la página la sesión se restaura. ==========
const BYPASS_ADMIN_LOGIN = false;
// ========== Fin bypass temporal ==========

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // Verificar si hay un token guardado al cargar la app
  React.useEffect(() => {
    const checkAuth = async () => {
      // TEMPORAL: bypass admin — quitar este if al volver a usar login real
      if (BYPASS_ADMIN_LOGIN) {
        localStorage.setItem('token', 'bypass-dev');
        localStorage.setItem('user', JSON.stringify({ role: 'admin', email: 'admin@bypass' }));
        setIsAuthenticated(true);
        setUserRole('admin');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verificar que el token sigue siendo válido
          const response = await authAPI.getMe();
          if (response.success && response.data.user) {
            const user = response.data.user;
            setIsAuthenticated(true);
            setUserRole(user.role);
          } else {
            // Token inválido, limpiar
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          // Token expirado o inválido, limpiar
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          console.error('Error verificando autenticación:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Título único para SEO (pestaña del navegador)
  React.useEffect(() => {
    document.title = 'Green Aviation Campus';
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Header 
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          setUserRole={setUserRole}
          userRole={userRole}
          toggleSidebar={toggleSidebar}
          sidebarOpen={sidebarOpen}
        />
        <div className="app-container">
          <Sidebar 
            userRole={userRole} 
            isAuthenticated={isAuthenticated}
            isOpen={sidebarOpen}
            onClose={closeSidebar}
          />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  <Login 
                    setIsAuthenticated={setIsAuthenticated}
                    setUserRole={setUserRole}
                  />
                } 
              />
              <Route 
                path="/estudio-teorico" 
                element={<EstudioTeorico isAuthenticated={isAuthenticated} userRole={userRole} />}
              />
              <Route 
                path="/examenes" 
                element={<Examenes isAuthenticated={isAuthenticated} userRole={userRole} />}
              />
              <Route 
                path="/gestion-alumnos" 
                element={<GestionAlumnos userRole={userRole} isAuthenticated={isAuthenticated} />}
              />
              <Route 
                path="/gestion-vuelos" 
                element={<GestionVuelos userRole={userRole} isAuthenticated={isAuthenticated} />}
              />
              <Route 
                path="/gestion-preguntas" 
                element={<GestionPreguntas userRole={userRole} isAuthenticated={isAuthenticated} />}
              />
              <Route 
                path="/gestion-recursos" 
                element={<GestionRecursos userRole={userRole} isAuthenticated={isAuthenticated} />}
              />
              <Route 
                path="/mi-perfil" 
                element={<MiPerfil userRole={userRole} isAuthenticated={isAuthenticated} />}
              />
              <Route 
                path="/recursos-adicionales" 
                element={<RecursosAdicionales isAuthenticated={isAuthenticated} />}
              />
              <Route 
                path="/clases-online" 
                element={<ClasesOnline isAuthenticated={isAuthenticated} userRole={userRole} />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

