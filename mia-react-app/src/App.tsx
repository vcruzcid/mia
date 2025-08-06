import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { MembershipPage } from './pages/MembershipPage';
import { ContactPage } from './pages/ContactPage';
import { SociasPage } from './pages/SociasPage';
import { DirectivaPage } from './pages/DirectivaPage';
import { SimpleRegistrationPage } from './pages/SimpleRegistrationPage';
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { PortalPage } from './pages/PortalPage';
import { PoliticaCookiesPage } from './pages/PoliticaCookiesPage';
import { TerminosUsoPage } from './pages/TerminosUsoPage';
import { PoliticaPrivacidadPage } from './pages/PoliticaPrivacidadPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes with layout */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="sobre-mia" element={<AboutPage />} />
                <Route path="membresia" element={<MembershipPage />} />
                <Route path="contacto" element={<ContactPage />} />
                <Route path="socias" element={<SociasPage />} />
                <Route path="directiva" element={<DirectivaPage />} />
                <Route path="registro" element={<SimpleRegistrationPage />} />
                <Route path="registro/bienvenida" element={<WelcomePage />} />
                <Route path="politica-cookies" element={<PoliticaCookiesPage />} />
                <Route path="terminos-uso" element={<TerminosUsoPage />} />
                <Route path="politica-privacidad" element={<PoliticaPrivacidadPage />} />
              </Route>
              
              {/* Authentication routes */}
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <LoginPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected routes */}
              <Route 
                path="/portal" 
                element={
                  <ProtectedRoute>
                    <PortalPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;