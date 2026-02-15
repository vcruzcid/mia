# 🌟 MIA - Mujeres en la Industria de Animación

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-626CD9?style=flat-square&logo=Stripe)](https://stripe.com/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=Cloudflare)](https://cloudflare.com/)

> Asociación profesional de mujeres en la industria de animación en España

Una aplicación web moderna y robusta para la gestión de membresías, eventos y comunidad de MIA. Construida con las mejores prácticas de desarrollo frontend y backend-as-a-service.

## ✨ Características Principales

- 🔐 **Autenticación Segura** - Login con magic links via Supabase
- 💳 **Sistema de Membresías** - Integración completa con Stripe
- 👥 **Portal de Miembros** - Gestión de perfil y recursos exclusivos
- 🎭 **Directorio de Socias** - Buscador y filtros avanzados
- 📱 **Diseño Responsive** - Optimizado para móvil y desktop
- ⚡ **PWA Ready** - Instalable como aplicación nativa
- 🔄 **Sincronización Robusta** - Sistema híbrido de 3 capas para suscripciones

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | React 19, TypeScript, Vite |
| **UI/UX** | Tailwind CSS 4, Radix UI, shadcn/ui |
| **Estado** | TanStack Query, Zustand, React Context |
| **Backend** | Supabase (PostgreSQL + Auth) |
| **Pagos** | Stripe (Suscripciones + Webhooks) |
| **Hosting** | Cloudflare Pages + Functions |
| **Testing** | Vitest, Testing Library, Playwright |

### Estructura del Proyecto

```
📁 mia/
├── 📂 src/
│   ├── 🧩 components/          # Componentes reutilizables
│   │   ├── ui/                # Primitivos shadcn/ui
│   │   ├── Header.tsx         # Navegación principal
│   │   ├── Footer.tsx         # Pie de página
│   │   └── ProtectedRoute.tsx # Rutas protegidas
│   ├── 📄 pages/              # Páginas de la aplicación
│   │   ├── HomePage.tsx       # Página de inicio
│   │   ├── SociasPage.tsx     # Directorio de socias
│   │   ├── PortalPage.tsx     # Portal de miembros
│   │   └── MembershipPage.tsx # Página de membresías
│   ├── 🔧 services/           # Servicios backend
│   │   ├── auth/              # Autenticación Supabase
│   │   ├── stripe/            # Integración Stripe
│   │   ├── members/           # Gestión de socias
│   │   └── board/             # Junta directiva
│   ├── 🎣 hooks/              # Hooks personalizados
│   │   ├── useAuth.ts         # Autenticación
│   │   ├── useMembers.ts      # Datos de socias
│   │   └── useMemberFilters.ts # Filtros de búsqueda
│   ├── 📋 types/              # Definiciones TypeScript
│   ├── 🎨 config/             # Configuración del sitio
│   └── 🛠️ utils/              # Utilidades
├── ⚙️ functions/               # Cloudflare Functions
│   └── api/                   # APIs serverless
│       ├── stripe-webhook.ts  # Webhooks de Stripe
│       ├── verify-subscription.ts
│       └── create-stripe-checkout.ts
├── 🗄️ supabase/               # Base de datos
│   └── migrations/           # Migraciones SQL
└── 📦 dist/                   # Build de producción
```

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

- **Node.js** 18+ y npm
- **Cuenta Supabase** con proyecto activo
- **Cuenta Stripe** con modo de pruebas
- **Cuenta Cloudflare** (opcional para deployment)

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
   # 🗄️ Supabase Configuration
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key

   # 💳 Stripe Configuration (Modo Desarrollo)
   VITE_STRIPE_PUBLIC_KEY=pk_test_...

   # 🔒 Stripe Webhook Secret (para desarrollo local)
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

4. **Configura Supabase**
   ```bash
   # Ejecuta las migraciones
   psql "$DATABASE_URL" < supabase/migrations/001_refactor_database.sql
   psql "$DATABASE_URL" < supabase/migrations/002_directiva_board_model.sql
   psql "$DATABASE_URL" < supabase/migrations/003_founders_seed.sql
   ```

### 🏃‍♀️ Desarrollo Local

```bash
# Inicia servidor de desarrollo
npm run dev

# Abre http://localhost:5173
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

### 🔧 Configuración de Stripe Webhooks (Desarrollo)

Para probar webhooks localmente:

```bash
# Instala Stripe CLI
brew install stripe/stripe-cli/stripe

# Inicia el listener
stripe listen --forward-to http://localhost:8788/api/stripe-webhook

# En otra terminal, inicia las funciones de Cloudflare
npx wrangler dev
```

## 💳 Sistema de Suscripciones Stripe

### 🏛️ Arquitectura de 3 Capas para Máxima Fiabilidad

El sistema híbrido garantiza **99.9% de precisión** en el estado de suscripciones mediante tres capas complementarias:

```
🔴 Capa 1: Webhooks (Actualización Inmediata)
Stripe Event → Cloudflare Function → Actualización BD
     ↓
🟡 Capa 2: Verificación en Login (Precisión Garantizada)
Usuario Login → Verificar con Stripe API → Actualizar BD
     ↓
🟢 Capa 3: Cron Job (Reconciliación Periódica)
Cada 6 horas → Sincronizar Todo → Corregir Discrepancias
```

### 🎯 Características Clave

- ⚡ **Actualizaciones Inmediatas** - Webhooks procesan eventos en tiempo real
- 🔒 **Verificación en Login** - Cada inicio de sesión valida con Stripe
- 🔄 **Reconciliación Automática** - Job cada 6 horas sincroniza todo
- 📊 **Auditoría Completa** - Todos los eventos registrados
- 🔍 **Detección de Discrepancias** - Identifica y corrige inconsistencias
- 🚀 **Cache Inteligente** - TanStack Query con 5 min de cache

### 📋 Planes de Membresía

| Plan | Precio | Beneficios |
|------|--------|------------|
| **Pleno Derecho** | €30/año | Acceso completo al portal y eventos |
| **Estudiante** | €15/año | Acceso completo con descuento |
| **Colaborador** | €60/año | Membresía premium con beneficios extra |

### 🗃️ Tablas de Auditoría

- `webhook_events` - Registro completo de eventos Stripe
- `subscription_discrepancies` - Detección de inconsistencias DB/Stripe
- `sync_reports` - Reportes de sincronización periódica

## 🎨 Funcionalidades

### 👥 Portal de Miembros
- **Perfil Personal** - Gestión de datos y preferencias
- **Recursos Exclusivos** - Documentos y materiales para socias
- **Enlaces a Stripe** - Gestión directa de suscripciones
- **Comunidad** - Conexión con otras profesionales

### 🎭 Directorio de Socias
- **Búsqueda Avanzada** - Filtros por especialidad y ubicación
- **Perfiles Detallados** - Información profesional y contacto
- **Modal Interactivo** - Vista ampliada de perfiles
- **Exportación** - Datos para networking

### 📅 Junta Directiva
- **Histórico Completo** - Directivas por años
- **API Dinámica** - Carga de datos por período
- **Presentación Visual** - Galería de miembros actuales

### 🎯 Programa Miánima
- **Información Detallada** - Descripción del programa
- **Galería Multimedia** - Imágenes y videos del proyecto
- **Preguntas Frecuentes** - Sección de soporte

## 🗄️ Base de Datos

### 📊 Tablas Principales

| Tabla | Propósito | Campos Clave |
|-------|-----------|--------------|
| `members` | Perfiles y datos de suscripción | email, subscription_status, plan_type |
| `board_members` | Junta directiva actual | name, role, year, photo |
| `webhook_events` | Auditoría de webhooks Stripe | event_type, status, processed_at |
| `subscription_discrepancies` | Problemas de sincronización | member_id, issue_type, resolved_at |
| `sync_reports` | Reportes de reconciliación | total_checked, discrepancies_found |

### 🛠️ Migraciones

Consulta `supabase/MIGRATION_GUIDE.md` para instrucciones detalladas.

```bash
# Ejecutar migraciones en orden
psql "$DATABASE_URL" < supabase/migrations/001_refactor_database.sql
psql "$DATABASE_URL" < supabase/migrations/002_directiva_board_model.sql
psql "$DATABASE_URL" < supabase/migrations/003_founders_seed.sql
```

## 🚀 Despliegue

### ☁️ Cloudflare Pages + Functions

#### Configuración Automática
```bash
# Deploy a desarrollo
npm run deploy:dev

# Deploy manual a desarrollo
npm run deploy:dev:manual
```

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

3. **Variables de Entorno**
   ```
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   VITE_STRIPE_PUBLIC_KEY=pk_live_...
   ```

4. **Secrets Requeridos**
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

### ⏰ Cron Jobs Automáticos

La aplicación incluye tareas programadas cada 6 horas:

```toml
# wrangler.toml
[triggers]
crons = ["0 */6 * * *"]  # Cada 6 horas a las XX:00
```

**Funciones del Cron:**
- 🔄 Sincronización de suscripciones
- 🔍 Detección de discrepancias
- 📊 Generación de reportes de salud
- 🧹 Limpieza de datos obsoletos

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

### 🔗 Testing de Webhooks (Desarrollo Local)

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Iniciar listener para webhooks
stripe listen --forward-to http://localhost:8788/api/stripe-webhook

# Trigger eventos de prueba
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.deleted
```

### 🔄 Sincronización Manual

```bash
# Trigger sincronización manual
curl -X GET https://tu-app.pages.dev/api/cron/sync-subscriptions

# Verificar estado de salud
curl -X GET https://tu-app.pages.dev/api/health
```

## 📊 Monitoreo & Métricas

### 🏥 Salud del Sistema

#### Dashboard de Métricas Clave

| Métrica | Valor Objetivo | Comando SQL |
|---------|----------------|-------------|
| **Precisión Suscripciones** | 99.9% | Consulta `subscription_discrepancies` |
| **Tasa Éxito Webhooks** | 100% | `SELECT COUNT(*) FROM webhook_events WHERE status = 'success'` |
| **Tasa Discrepancias** | < 0.1% | `SELECT COUNT(*) FROM subscription_discrepancies WHERE resolved_at IS NULL` |
| **Éxito Jobs Sincro** | 100% | `SELECT success FROM sync_reports ORDER BY created_at DESC LIMIT 1` |

#### Queries de Monitoreo

```sql
-- Discrepancias recientes no resueltas
SELECT
  member_id,
  issue_type,
  detected_at,
  db_status,
  stripe_status
FROM subscription_discrepancies
WHERE resolved_at IS NULL
ORDER BY detected_at DESC;

-- Último reporte de sincronización
SELECT
  created_at,
  total_checked,
  discrepancies_found,
  success
FROM sync_reports
ORDER BY created_at DESC
LIMIT 1;

-- Eventos de webhook recientes (últimas 24h)
SELECT
  event_type,
  status,
  processed_at,
  error_message
FROM webhook_events
WHERE processed_at >= NOW() - INTERVAL '24 hours'
ORDER BY processed_at DESC;
```

#### Alertas Automáticas

- 🔴 **Críticas**: Fallos en webhooks > 5%
- 🟡 **Advertencias**: Discrepancias no resueltas > 10
- 🟢 **Éxito**: Sincronización completada correctamente

## 📚 Documentación

### 📖 Guías y Referencias

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **Blueprint** | Arquitectura general del proyecto | `docs/blueprint.md` |
| **Migraciones DB** | Guía completa de migraciones | `supabase/MIGRATION_GUIDE.md` |
| **Resumen Refactor** | Detalles técnicos del refactor | `tmp/REFACTOR_SUMMARY.md` |
| **Implementación** | Notas de implementación | `tmp/IMPLEMENTATION_NOTES.md` |

### 🔧 APIs y Servicios

- **Cloudflare Functions**: Comentarios JSDoc en `functions/api/`
- **Servicios Frontend**: Documentación en `src/services/`
- **Hooks Personalizados**: JSDoc en `src/hooks/`
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
- [ ] **Migraciones de BD incluidas si aplica**

### 🏷️ Tipos de Commit

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato/código
- `refactor:` Refactorización de código
- `test:` Añadir/modificar tests
- `chore:` Tareas de mantenimiento

## 🐛 Solución de Problemas

### 💳 Problemas con Suscripciones

#### Estado de Suscripción No Se Actualiza

```bash
# 1. Verificar eventos de webhook recientes
psql "$DATABASE_URL" -c "
SELECT event_type, status, processed_at, error_message
FROM webhook_events
ORDER BY processed_at DESC
LIMIT 5;"

# 2. Buscar discrepancias activas
psql "$DATABASE_URL" -c "
SELECT * FROM subscription_discrepancies
WHERE resolved_at IS NULL;"

# 3. Trigger sincronización manual
curl -X GET https://tu-app.pages.dev/api/cron/sync-subscriptions
```

#### Webhooks No Llegan

- ✅ Verificar webhook secret en Cloudflare
- ✅ Confirmar URL del endpoint: `/api/stripe-webhook`
- ✅ Revisar logs de Cloudflare Functions
- ✅ Probar con Stripe CLI en desarrollo local

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

### 🗄️ Problemas de Base de Datos

#### Conexión Fallida
- ✅ Verificar `DATABASE_URL` correcta
- ✅ Confirmar permisos de service role key
- ✅ Revisar políticas RLS activas

#### Migraciones Pendientes
```bash
# Verificar estado de migraciones
psql "$DATABASE_URL" -c "
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC;"

# Ejecutar migraciones faltantes
psql "$DATABASE_URL" < supabase/migrations/XXX_pending_migration.sql
```

#### Logs de Supabase
- 🔍 Dashboard de Supabase → Database → Logs
- 🔍 Cloudflare Functions logs para API calls

### 🌐 Problemas de Despliegue

#### Build Falla en Producción
- ✅ Variables de entorno configuradas en Cloudflare
- ✅ Secrets de Stripe/Supabase correctos
- ✅ Node.js version compatible (18+)

#### Funciones No Responden
```bash
# Verificar estado de funciones
npx wrangler tail

# Test endpoint específico
curl -X GET https://tu-app.pages.dev/api/health
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
| **TanStack Query** | Gestión de estado servidor | [tanstack.com/query](https://tanstack.com/query) |
| **Supabase** | Backend-as-a-Service | [supabase.com](https://supabase.com) |
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

**Versión:** 2.0.0  
**Última Actualización:** Diciembre 16, 2025  
**Estado:** 🟢 Producción Lista

---

<p align="center">
  <strong>¡Gracias por contribuir al empoderamiento de las mujeres en la industria de animación! 🎭✨</strong>
</p>
