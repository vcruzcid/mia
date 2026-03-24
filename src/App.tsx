import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { RegistrationPage } from './pages/RegistrationPage';
import { RegistroExitoPage } from './pages/RegistroExitoPage';
import { PortalLoginPage } from './pages/portal/PortalLoginPage';
import { PortalAccesoPage } from './pages/portal/PortalAccesoPage';
import { PortalLayout } from './pages/portal/PortalLayout';
import { PortalPerfilPage } from './pages/portal/PortalPerfilPage';
import { PortalSuscripcionPage } from './pages/portal/PortalSuscripcionPage';
import { PoliticaCookiesPage } from './pages/PoliticaCookiesPage';
import { TerminosUsoPage } from './pages/TerminosUsoPage';
import { PoliticaPrivacidadPage } from './pages/PoliticaPrivacidadPage';

function App() {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Routes>
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

                <Route path="registro" element={<RegistrationPage />} />
                <Route path="registro/exito" element={<RegistroExitoPage />} />

                <Route path="portal/login" element={<PortalLoginPage />} />
                <Route path="portal/acceso" element={<PortalAccesoPage />} />
                <Route path="portal" element={<PortalLayout />}>
                  <Route index element={<Navigate to="perfil" replace />} />
                  <Route path="perfil" element={<PortalPerfilPage />} />
                  <Route path="suscripcion" element={<PortalSuscripcionPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
