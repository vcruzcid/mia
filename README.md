# 🌟 MIA - Mujeres en la Industria de Animación

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=flat-square&logo=Stripe)](https://stripe.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=Cloudflare)](https://cloudflare.com/)

> Asociación profesional de mujeres en la industria de animación en España

Una aplicación web moderna y robusta para la gestión de membresías, eventos y comunidad de MIA. Construida con las mejores prácticas de desarrollo frontend y backend-as-a-service.

## ✨ Características Principales

- 💳 **Sistema de Membresías** - Integración con Stripe para pagos
- 🎭 **Directorio de Socias** - Información de socias fundadoras y junta directiva
- 📱 **Diseño Responsive** - Optimizado para móvil y desktop
- ⚡ **PWA Ready** - Instalable como aplicación nativa
- 📧 **Formulario de Contacto** - Con protección Cloudflare Turnstile
- 🎯 **Programa Miánima** - Información sobre el programa de mentoría

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | React 19, TypeScript, Vite |
| **UI/UX** | Tailwind CSS 4, Radix UI, shadcn/ui |
| **Estado** | React Context, React Hook Form |
| **Pagos** | Stripe (Checkout + Session) |
| **Hosting** | Cloudflare Pages + Functions |
| **Seguridad** | Cloudflare Turnstile (CAPTCHA) |
| **Testing** | Vitest |

### Estructura del Proyecto

```
📁 mia/
├── 📂 src/
│   ├── 🧩 components/          # Componentes reutilizables
│   │   ├── ui/                # Primitivos shadcn/ui
│   │   ├── Header.tsx         # Navegación principal
│   │   ├── Footer.tsx         # Pie de página
│   │   ├── ErrorBoundary.tsx  # Manejo de errores
│   │   └── VimeoVideo.tsx     # Reproductor de video
│   ├── 📄 pages/              # Páginas de la aplicación
│   │   ├── HomePage.tsx       # Página de inicio
│   │   ├── AboutPage.tsx      # Sobre MIA
│   │   ├── DirectivaPage.tsx  # Junta directiva
│   │   ├── FundadorasPage.tsx # Socias fundadoras
│   │   ├── MianimaPage.tsx    # Programa Miánima
│   │   ├── ContactPage.tsx    # Formulario de contacto
│   │   ├── MembershipPage.tsx # Página de membresías
│   │   ├── RegistrationPage.tsx # Registro de socias
│   │   ├── LoginPage.tsx      # Página de login (stub)
│   │   └── WelcomePage.tsx    # Bienvenida post-pago
│   ├── 🎣 hooks/              # Hooks personalizados
│   │   ├── useAuth.ts         # Autenticación (stub)
│   │   ├── useCounterAnimation.ts # Animación de contadores
│   │   └── useScrollAnimation.ts  # Efectos de scroll
│   ├── 🎭 contexts/           # React Contexts
│   │   ├── AuthContext.tsx    # Contexto de autenticación (stub)
│   │   ├── ToastContext.tsx   # Notificaciones toast
│   │   └── LoadingContext.tsx # Estados de carga
│   ├── 📊 data/               # Datos estáticos
│   │   ├── directiva.ts       # Datos de junta directiva
│   │   └── fundadoras.ts      # Datos de fundadoras
│   ├── 📋 types/              # Definiciones TypeScript
│   ├── 🎨 config/             # Configuración del sitio
│   ├── 📝 schemas/            # Validación Zod
│   └── 🛠️ utils/              # Utilidades
├── ⚙️ functions/               # Cloudflare Functions
│   └── api/                   # APIs serverless
│       ├── contact.ts         # Formulario de contacto
│       ├── create-stripe-checkout.ts # Crear sesión de pago
│       └── stripe-session.ts  # Verificar sesión de pago
└── 📦 dist/                   # Build de producción
```

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

- **Node.js** 18+ y npm
- **Cuenta Stripe** con modo de pruebas
- **Cuenta Cloudflare** (para deployment)
- **Cloudflare Turnstile** site key (para CAPTCHA)

### ⚙️ Configuración Inicial

1. **Clona el repositorio**
   ```bash
   git clone <repository-url>
   cd mia
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura variables de entorno**

   Crea un archivo `.env` en la raíz del proyecto:

   ```env
   # 💳 Stripe Configuration (Modo Desarrollo)
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # 🔒 Cloudflare Turnstile (CAPTCHA)
   VITE_TURNSTILE_SITE_KEY=0x4AAA...
   TURNSTILE_SECRET_KEY=0x4AAA...

   # 🔗 Zapier Webhook (opcional, para notificaciones)
   ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/...
   ```

### 🏃‍♀️ Desarrollo Local

```bash
# Inicia servidor de desarrollo
npm run dev

# Abre http://localhost:3000
```

### 🧪 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run build:dev` | Build de desarrollo |
| `npm run preview` | Vista previa del build |
| `npm run lint` | Ejecuta ESLint |
| `npm test` | Ejecuta tests con Vitest |
| `npm run test:ui` | Tests con interfaz visual |
| `npm run deploy:dev` | Deploy a entorno de desarrollo |

### 🔧 Testing de Funciones Localmente

Para probar las Cloudflare Functions localmente:

```bash
# Inicia el servidor de funciones
npx wrangler dev

# La app estará disponible en http://localhost:8788
```

## 💳 Sistema de Pagos Stripe

### Flujo de Registro y Pago

```
Usuario → Registro → Stripe Checkout → Confirmación → Bienvenida
```

### 🎯 Funcionalidades

- ⚡ **Checkout Directo** - Integración con Stripe Checkout
- ✅ **Verificación de Sesión** - Confirmación de pago completado
- 📧 **Notificaciones** - Email de bienvenida vía Zapier (opcional)
- 🔒 **Protección CAPTCHA** - Cloudflare Turnstile en formularios

### 📋 Planes de Membresía

| Plan | Precio | Características |
|------|--------|-----------------|
| **Pleno Derecho** | €30/año | Membresía completa para profesionales |
| **Estudiante** | €15/año | Tarifa reducida para estudiantes |
| **Colaborador** | €60/año | Membresía de apoyo empresarial |

> **Nota:** Los códigos de descuento se pueden aplicar durante el checkout

## 🎨 Funcionalidades

### 🏠 Página de Inicio
- **Hero Section** - Video de fondo con Vimeo
- **Estadísticas Animadas** - Contadores con efectos de scroll
- **CTA's Destacados** - Llamadas a la acción para registro

### 🎭 Junta Directiva y Fundadoras
- **Galerías Visuales** - Perfiles con imágenes y biografías
- **Información Detallada** - Roles, responsabilidades y trayectoria
- **Links a Redes Sociales** - Conecta con las integrantes

### 📧 Formulario de Contacto
- **Protección CAPTCHA** - Cloudflare Turnstile
- **Validación Robusta** - React Hook Form + Zod
- **Integración Zapier** - Notificaciones automáticas (opcional)

### 💳 Sistema de Registro
- **Proceso Simplificado** - Selección de plan y checkout
- **Códigos de Descuento** - Soporte para promociones
- **Confirmación de Pago** - Verificación de sesión Stripe
- **Página de Bienvenida** - Confirmación post-registro

### 🎯 Programa Miánima
- **Información del Programa** - Descripción detallada
- **Video Integrado** - Presentación en Vimeo
- **FAQ** - Preguntas frecuentes

## 🚀 Despliegue

### ☁️ Cloudflare Pages + Functions

#### Configuración en Cloudflare Dashboard

1. **Conectar Repositorio**
   - Vincula tu repo de GitHub a Cloudflare Pages
   - Rama: `main` (producción) o `develop` (desarrollo)

2. **Configuración de Build**
   ```yaml
   Build command: npm run build
   Build output directory: dist
   Root directory: (leave empty)
   ```

3. **Variables de Entorno en Cloudflare**
   ```
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   VITE_TURNSTILE_SITE_KEY=0x4AAA...
   ```

4. **Secrets Requeridos (via Wrangler)**
   ```bash
   npx wrangler secret put TURNSTILE_SECRET_KEY
   npx wrangler secret put ZAPIER_WEBHOOK_URL
   ```

### 🌍 Entornos

| Entorno | URL | Comando |
|---------|-----|---------|
| **Desarrollo** | `dev.animacionesmia.com` | `npm run deploy:dev` |
| **Producción** | `animacionesmia.com` | Deploy automático desde `main` |

## 🧪 Testing & Calidad

### 🧪 Suite de Tests

```bash
# Ejecutar todos los tests
npm test

# Tests con interfaz visual
npm run test:ui

# Cobertura de tests
npm run test:coverage

# Linting
npm run lint
```


## 📚 Documentación

### 📖 Guías y Referencias

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **Blueprint** | Arquitectura general del proyecto | `docs/blueprint.md` |
| **CLAUDE.md** | Guía para Claude Code | `CLAUDE.md` |

### 🔧 APIs y Servicios

- **Cloudflare Functions**: Documentación inline en `functions/api/`
- **Hooks Personalizados**: Comentarios en `src/hooks/`
- **Tipos TypeScript**: Definiciones en `src/types/`

## 🤝 Contribución

### 🎯 Estándares de Código

- **TypeScript Strict Mode** - Tipado estricto obligatorio
- **Conventional Commits** - Formato: `tipo: descripción`
- **Componentes** - Máximo 200 líneas por componente
- **JSDoc** - Documentación para APIs públicas
- **Tests** - Cobertura mínima del 80%

### 🌊 Flujo de Trabajo Git

```bash
# Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# Commits siguiendo conventional commits
git commit -m "feat: añadir búsqueda avanzada en directorio"
git commit -m "fix: corregir validación de formulario"
git commit -m "docs: actualizar documentación de API"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

### 🔍 Pull Request Checklist

- [ ] **Tests pasan** - `npm test`
- [ ] **Linting OK** - `npm run lint`
- [ ] **Build exitoso** - `npm run build`
- [ ] **Documentación actualizada**
- [ ] **Variables de entorno revisadas**

### 🏷️ Tipos de Commit

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato/código
- `refactor:` Refactorización de código
- `test:` Añadir/modificar tests
- `chore:` Tareas de mantenimiento

## 🐛 Solución de Problemas

### 🔨 Problemas de Build

```bash
# Limpiar cache completo
rm -rf node_modules dist .vite .cache

# Reinstalar dependencias
npm ci

# Verificar build
npm run build
```

**Errores Comunes:**
- ❌ **Versiones de Node.js** - Requiere Node 18+
- ❌ **Variables faltantes** - Revisar `.env`
- ❌ **Dependencias corruptas** - `rm -rf node_modules && npm ci`

### 🌐 Problemas de Despliegue

#### Build Falla en Producción
- ✅ Variables de entorno configuradas en Cloudflare
- ✅ Secrets de Turnstile/Zapier correctos
- ✅ Node.js version compatible (18+)

#### Funciones No Responden
```bash
# Verificar estado de funciones
npx wrangler tail

# Test endpoint de contacto
curl -X POST https://tu-app.pages.dev/api/contact
```

### 📱 Problemas de PWA/Service Worker

```bash
# Limpiar service worker cache
# En DevTools: Application → Storage → Clear site data

# Forzar actualización
# En DevTools: Application → Service Workers → Unregister
```

## 📄 Licencia

Privada - Mujeres en la Industria de Animación

## 🙏 Agradecimientos

Construido con ❤️ por y para la comunidad de mujeres en animación.

### 🛠️ Tecnologías y Librerías

| Tecnología | Propósito | Enlace |
|------------|-----------|--------|
| **React 19** | Framework frontend moderno | [reactjs.org](https://reactjs.org) |
| **TypeScript** | Tipado estático | [typescriptlang.org](https://typescriptlang.org) |
| **Vite** | Build tool ultrarrápido | [vitejs.dev](https://vitejs.dev) |
| **Tailwind CSS 4** | Framework CSS utility-first | [tailwindcss.com](https://tailwindcss.com) |
| **Radix UI** | Componentes accesibles | [radix-ui.com](https://radix-ui.com) |
| **React Hook Form** | Gestión de formularios | [react-hook-form.com](https://react-hook-form.com) |
| **Zod** | Validación de esquemas | [zod.dev](https://zod.dev) |
| **Stripe** | Procesamiento de pagos | [stripe.com](https://stripe.com) |
| **Cloudflare** | Hosting y edge computing | [cloudflare.com](https://cloudflare.com) |

### 👥 Comunidad

Únete a la comunidad de MIA en:
- 🌐 **Web**: [animacionesmia.com](https://animacionesmia.com)
- 📧 **Email**: info@animacionesmia.com
- 💼 **LinkedIn**: [MIA España](https://linkedin.com/company/mia-espana)

---

## 📊 Estado del Proyecto

| Aspecto | Estado | Última Verificación |
|---------|--------|-------------------|
| **Build** | ✅ Pasando | $(date '+%B %d, %Y') |
| **Tests** | ✅ Cubierta | $(date '+%B %d, %Y') |
| **Linting** | ✅ Sin errores | $(date '+%B %d, %Y') |
| **Deploy** | ✅ Automático | $(date '+%B %d, %Y') |

**Versión:** 2.1.0
**Última Actualización:** Febrero 15, 2025
**Estado:** 🟢 Producción - Optimizado y Limpio

---

<p align="center">
  <strong>¡Gracias por contribuir al empoderamiento de las mujeres en la industria de animación! 🎭✨</strong>
</p>
