import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { MembershipPage } from './pages/MembershipPage';
import { ContactPage } from './pages/ContactPage';
import { SociasPage } from './pages/SociasPage';
import { DirectivaPage } from './pages/DirectivaPage';
import { FundadorasPage } from './pages/FundadorasPage';
import { MianimaPage } from './pages/MianimaPage';
import { LoginPage } from './pages/LoginPage';
import { RegistroPage } from './pages/RegistroPage';
import { WelcomePage } from './pages/WelcomePage';
import { PoliticaCookiesPage } from './pages/PoliticaCookiesPage';
import { TerminosUsoPage } from './pages/TerminosUsoPage';
import { PoliticaPrivacidadPage } from './pages/PoliticaPrivacidadPage';

function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
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
                    <Route path="fundadoras" element={<FundadorasPage />} />
                    <Route path="mianima" element={<MianimaPage />} />
                    <Route path="politica-cookies" element={<PoliticaCookiesPage />} />
                    <Route path="terminos-uso" element={<TerminosUsoPage />} />
                    <Route path="politica-privacidad" element={<PoliticaPrivacidadPage />} />
                  </Route>

                  {/* Authentication routes (no layout wrapper) */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="registro" element={<RegistroPage />} />
                  <Route path="registro/bienvenida" element={<WelcomePage />} />
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
