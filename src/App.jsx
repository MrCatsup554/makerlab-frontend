import { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import Auth from './pages/Auth';
import MainMenu from './pages/MainMenu';
import Upload from './pages/Upload';
import Designs from './pages/Designs';
import AdminDashboard from './pages/AdminDashboard'; 
import Materials from './pages/Materials';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('auth');
  const [navigationData, setNavigationData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString && userString !== 'undefined') {
      try {
        const user = JSON.parse(userString); // Convertimos el texto guardado a objeto
        setIsAuthenticated(true);   
        
        // ¡Aquí está la magia al recargar!
        if (user.role === 'admin') {
          setCurrentPage('admin');
        } else {
          setCurrentPage('mainmenu');
        }
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []); 

  const handleNavigate = (page, data = null) => {
    setNavigationData(data);
    if ((page === 'upload' || page === 'designs' || page === 'admin') && !isAuthenticated) {
      setCurrentPage('auth');
    } else {
      setCurrentPage(page);
    }
  };

  // Recibimos el usuario directamente desde Auth.jsx
  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setNavigationData(null);
    
    // ¡Aquí está la magia al iniciar sesión!
    if (user && user.role === 'admin') {
      setCurrentPage('admin');
    } else {
      setCurrentPage('mainmenu');
    }
  };

  return (
    <LanguageProvider>
      <div className="App">
        {currentPage === 'auth' && !isAuthenticated && <Auth onLogin={handleLogin} />}
        {currentPage === 'mainmenu' && <MainMenu onNavigate={handleNavigate} navigationData={navigationData} setNavigationData={setNavigationData} />}
        {currentPage === 'upload' && isAuthenticated && <Upload onNavigate={handleNavigate} />}
        {currentPage === 'designs' && <Designs onNavigate={handleNavigate} />}
        {currentPage === 'admin' && isAuthenticated && <AdminDashboard onNavigate={handleNavigate} />}
        {currentPage === 'materials' && <Materials onNavigate={handleNavigate} />}
      </div>
    </LanguageProvider>
  );
}

export default App;