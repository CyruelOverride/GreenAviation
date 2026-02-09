import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import Home from './pages/Home/Home';
import EstudioTeorico from './pages/EstudioTeorico/EstudioTeorico';
import Examenes from './pages/Examenes/Examenes';
import GestionAlumnos from './pages/GestionAlumnos/GestionAlumnos';
import RecursosAdicionales from './pages/RecursosAdicionales/RecursosAdicionales';
import ClasesOnline from './pages/ClasesOnline/ClasesOnline';
import Login from './pages/Login/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userRole, setUserRole] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Router>
      <div className="App">
        <Header 
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
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
                path="/recursos-adicionales" 
                element={<RecursosAdicionales isAuthenticated={isAuthenticated} />}
              />
              <Route 
                path="/clases-online" 
                element={<ClasesOnline isAuthenticated={isAuthenticated} />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

