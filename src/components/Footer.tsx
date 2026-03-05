import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FooterLink } from './FooterLink';

export function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-96">
          {/* Left Column - Navigation */}
          <div className="lg:col-span-3 flex flex-col justify-between h-full">
            <nav className="flex flex-col justify-between h-full space-y-6">
              <FooterLink to="/">INICIO</FooterLink>
              <FooterLink to="/sobre-mia"><span style={{ whiteSpace: 'nowrap' }}>SOBRE{'\u00A0'}NOSOTRAS</span></FooterLink>
              <FooterLink to="/socias">SOCIAS</FooterLink>
              <FooterLink to="/directiva">DIRECTIVA</FooterLink>
              <FooterLink to="/fundadoras">FUNDADORAS</FooterLink>
              <FooterLink to="/mianima">MIANIMA</FooterLink>
              <FooterLink to="/membresia">MEMBRESÍA</FooterLink>
              <FooterLink to="/contacto">CONTACTO</FooterLink>
              <FooterLink to="/registro">ÚNETE A MIA</FooterLink>
            </nav>
          </div>

          {/* Center Column - Logo and Social */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex-1 flex items-start justify-center">
              <img
                src="/mia-footer.png"
                alt="MIA - Mujeres en la Industria de la Animación"
                className="h-32 sm:h-48 lg:h-64 w-auto"
                onError={(e) => {
                  // Fallback to the logo we know exists
                  (e.target as HTMLImageElement).src = "/logo-main.png";
                }}
              />
            </div>
            
            <div className="flex flex-col items-center pt-2">
              <p className="text-sm text-gray-300 mb-4">SÍGUENOS</p>
              {/* Social Media Icons */}
              <div className="flex justify-center space-x-6">
                <a
                  href="https://www.facebook.com/pages/category/Cause/MIA-Mujeres-en-la-Industria-de-la-Animaci%C3%B3n-243613666305139/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Visitar página de Facebook de MIA"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://twitter.com/mianimacion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Visitar perfil de Twitter de MIA"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/mianimacion/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Visitar perfil de Instagram de MIA"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/company/mia-mujeres-en-la-industria-de-la-animacion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Visitar perfil de LinkedIn de MIA"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
                <a
                  href="mailto:animacionesmia@gmail.com"
                  className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center text-white hover:bg-red-500 hover:text-white transition-colors duration-200"
                  aria-label="Enviar email a MIA"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Membership CTA */}
          <div className="lg:col-span-3 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">ÚNETE A MIA</h3>
              <p className="text-sm text-gray-300">
                Forma parte de la red de mujeres profesionales de la animación en España.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  Socia de Pleno Derecho
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  Socia Estudiante
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  Socia Colaboradora
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3 pt-6">
              <Link
                to="/registro"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded text-center text-sm transition-colors duration-200"
              >
                ÚNETE A MIA
              </Link>
              <Link
                to="/membresia"
                className="w-full border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-medium py-2 px-4 rounded text-center text-sm transition-colors duration-200"
              >
                Ver membresías
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400 mb-4">
            Copyright 2025 Mujeres en la Industria de la Animación | All rights reserved
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <FooterLink to="/politica-cookies" className="text-sm text-red-400 hover:text-red-300">
              Política de cookies
            </FooterLink>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <FooterLink to="/terminos-uso" className="text-sm text-red-400 hover:text-red-300">
              Términos de uso
            </FooterLink>
            <span className="text-gray-600 hidden sm:inline">|</span>
            <FooterLink to="/politica-privacidad" className="text-sm text-red-400 hover:text-red-300">
              Política de privacidad
            </FooterLink>
          </div>
        </div>
      </div>
    </footer>
  );
}