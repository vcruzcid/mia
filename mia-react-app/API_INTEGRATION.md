# MIA React App - API Integration

This document describes the comprehensive API integration added to the MIA React application, including Turnstile verification, Zapier webhooks, and mock data services.

## 🚀 Features Added

### 1. **Cloudflare Pages Functions API**
- **Registration API** (`/api/register`) - Handles member registration with Turnstile verification
- **Members API** (`/api/members`) - Returns filtered member data with search capabilities  
- **Directiva API** (`/api/directiva/[year]`) - Returns board members by year
- **Contact API** (`/api/contact`) - Handles contact form submissions
- **Health Check** (`/api/health`) - API status monitoring

### 2. **Turnstile Security Integration**
- Site Key: `0x4AAAAAABddjw-SDSpgjBDI`
- Server-side verification in all form endpoints
- Dark theme integration
- Automatic token expiration handling

### 3. **Mock Data System**
- **75+ realistic Spanish members** with proper names, companies, locations
- **Animation specializations** from the existing constants
- **Directiva data by year** (2017-2025) with proper positions
- **Realistic Spanish companies** in animation industry
- **Geographic distribution** across Spanish cities and regions

### 4. **Enhanced Form Components**
- **RegistrationFormWithAPI** - Complete registration with Turnstile
- **Updated ContactPage** - Integrated contact form with API
- **TurnstileWidget** - Reusable verification component

## 📁 File Structure

```
functions/api/
├── register.ts          # Registration endpoint
├── members.ts           # Member data endpoint  
├── contact.ts           # Contact form endpoint
├── health.ts            # Health check
└── directiva/
    └── [year].ts        # Directiva by year

src/
├── components/
│   ├── TurnstileWidget.tsx         # Turnstile verification
│   └── RegistrationFormWithAPI.tsx # Registration form
├── data/
│   └── mockMembers.ts              # Mock data generation
├── services/
│   └── apiService.ts               # API client with error handling
├── types/
│   └── api.ts                      # API TypeScript interfaces
└── store/
    └── galleryStore.ts             # Updated with API integration
```

## 🔧 API Endpoints

### Registration (`POST /api/register`)
```typescript
interface RegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  membershipType: string;
  discountCode?: string;
  turnstileToken: string;
  acceptTerms: boolean;
  acceptNewsletter: boolean;
  gdprAccepted: boolean;
}
```

### Members (`GET /api/members`)
```typescript
interface MembersRequest {
  search?: string;
  memberTypes?: string[];
  specializations?: string[];
  locations?: string[];
  availabilityStatus?: string[];
  hasSocialMedia?: boolean;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}
```

### Directiva (`GET /api/directiva/[year]`)
Returns board members for a specific year with positions and responsibilities.

### Contact (`POST /api/contact`)
```typescript
interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken: string;
}
```

## 🛠️ Configuration

### Environment Variables
Copy `.env.example` to `.env.local` and configure:

```bash
# Required for production
ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here

# Optional
VITE_API_BASE_URL=/api
VITE_ENABLE_MOCK_DATA=false
```

### Zapier Webhook Integration
The API forwards registration and contact form data to your Zapier webhook with the following structure:

**Registration Data:**
```json
{
  "firstName": "María",
  "lastName": "García",
  "email": "maria@example.com",
  "membershipType": "pleno-derecho",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "mia-website"
}
```

**Contact Data:**
```json
{
  "name": "Ana López",
  "email": "ana@example.com",
  "subject": "Consulta sobre membresía",
  "message": "Hola, me gustaría...",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "mia-contact-form"
}
```

## 📊 Mock Data Details

### Member Data (75+ members)
- **85% female names** reflecting MIA's focus
- **Realistic Spanish names** from common name databases
- **Animation companies** including Kandor Graphics, Ilion Animation Studios, etc.
- **Geographic distribution** across Spanish cities and regions
- **Specializations** from existing ANIMATION_SPECIALIZATIONS constant
- **Social media profiles** with realistic URLs
- **Availability status** and member types

### Directiva Data
- **8 board positions** with proper hierarchy
- **Year-based data** from 2017-2025
- **Responsibilities** for each position
- **Previous positions** tracking for long-term members

## 🔄 API Integration Flow

1. **Form Submission** → Turnstile verification → API call
2. **API Validation** → Zapier webhook → Response to client
3. **Success** → Redirect to payment (registration) or show success message
4. **Error** → Display user-friendly error message

## 🎨 UI Components Updated

### Registration Flow
- Enhanced SimpleRegistrationPage with API integration
- RegistrationFormWithAPI with Turnstile verification
- Proper error handling and loading states

### Gallery System
- Updated GalleryStore to use API endpoints
- Real-time filtering with API calls
- Optimized data fetching and caching

### Contact System
- ContactPage with Turnstile integration
- API-powered form submission
- Success/error message handling

## 🧪 Testing

### API Testing
```bash
# Test health endpoint
curl http://localhost:5173/api/health

# Test members endpoint
curl "http://localhost:5173/api/members?limit=10"

# Test directiva endpoint  
curl http://localhost:5173/api/directiva/2025
```

### Form Testing
1. **Registration**: Use email `demo@test.com` for quick testing
2. **Contact**: Complete Turnstile verification for submission
3. **Gallery**: Test filtering and search functionality

## 🚀 Deployment

### Cloudflare Pages Functions
The `/functions` directory is automatically deployed as Cloudflare Pages Functions. Ensure environment variables are configured in your Cloudflare dashboard.

### Environment Setup
1. Configure Zapier webhook URL
2. Add Turnstile secret key
3. Deploy to Cloudflare Pages
4. Test all endpoints

## 🔒 Security Features

- **Turnstile verification** on all form submissions
- **Input validation** with Zod schemas
- **CORS headers** properly configured
- **Error handling** without exposing sensitive data
- **Rate limiting** through Cloudflare
- **IP tracking** for security monitoring

## 📱 Mobile Compatibility

- **Responsive Turnstile widget**
- **Mobile-optimized forms**
- **Touch-friendly interface**
- **Proper viewport handling**

---

This API integration provides a production-ready foundation for the MIA React application with proper security, validation, and user experience considerations.