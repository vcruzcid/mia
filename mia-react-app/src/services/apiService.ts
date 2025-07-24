import type {
  ApiResponse,
  RegistrationRequest,
  RegistrationResponse,
  MembersRequest,
  MembersResponse,
  DirectivaRequest,
  DirectivaResponse,
  ContactRequest,
  ContactResponse
} from '../types/api';

// Configuration
const API_BASE_URL = typeof window !== 'undefined' ? '/api' : 'http://localhost:5173/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// Error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// Fetch wrapper with timeout and error handling
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  // Create timeout controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new TimeoutError();
    }
    
    if (error instanceof TypeError) {
      throw new NetworkError('Failed to connect to server');
    }
    
    throw error;
  }
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetchWithTimeout(url, options);

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        // Ignore JSON parsing errors for error responses
      }

      throw new ApiError(errorMessage, response.status);
    }

    // Parse successful response
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError || error instanceof NetworkError || error instanceof TimeoutError) {
      throw error;
    }

    // Handle unexpected errors
    console.error('Unexpected API error:', error);
    throw new ApiError('An unexpected error occurred');
  }
}

// API Methods
export const apiService = {
  // Registration API
  async register(data: RegistrationRequest): Promise<RegistrationResponse> {
    const response = await apiRequest<RegistrationResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new ApiError(response.error || 'Registration failed');
    }

    return response.data!;
  },

  // Members API
  async getMembers(params: MembersRequest = {}): Promise<MembersResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.search) searchParams.set('search', params.search);
    if (params.memberTypes?.length) searchParams.set('memberTypes', params.memberTypes.join(','));
    if (params.specializations?.length) searchParams.set('specializations', params.specializations.join(','));
    if (params.locations?.length) searchParams.set('locations', params.locations.join(','));
    if (params.availabilityStatus?.length) searchParams.set('availabilityStatus', params.availabilityStatus.join(','));
    if (params.hasSocialMedia !== undefined) searchParams.set('hasSocialMedia', params.hasSocialMedia.toString());
    if (params.isActive !== undefined) searchParams.set('isActive', params.isActive.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.offset) searchParams.set('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/members?${queryString}` : '/members';

    const response = await apiRequest<MembersResponse>(endpoint);

    if (!response.success) {
      throw new ApiError(response.error || 'Failed to fetch members');
    }

    return response.data!;
  },

  // Directiva API
  async getDirectiva(year: number): Promise<DirectivaResponse> {
    const response = await apiRequest<DirectivaResponse>(`/directiva/${year}`);

    if (!response.success) {
      throw new ApiError(response.error || 'Failed to fetch directiva data');
    }

    return response.data!;
  },

  // Contact form API
  async sendContactForm(data: ContactRequest): Promise<ContactResponse> {
    const response = await apiRequest<ContactResponse>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.success) {
      throw new ApiError(response.error || 'Failed to send contact form');
    }

    return response.data!;
  },

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await apiRequest<{ status: string; timestamp: string }>('/health');
    return response.data!;
  }
};

// React Query integration helpers
export const queryKeys = {
  members: (params: MembersRequest = {}) => ['members', params] as const,
  directiva: (year: number) => ['directiva', year] as const,
  health: () => ['health'] as const,
};

// Utility functions for error handling in React components
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof NetworkError) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }
  
  if (error instanceof TimeoutError) {
    return 'La solicitud tardó demasiado tiempo. Inténtalo de nuevo.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Ha ocurrido un error inesperado';
}

export function isRetryableError(error: unknown): boolean {
  return error instanceof NetworkError || error instanceof TimeoutError;
}

// Environment configuration
export const getApiConfig = () => ({
  baseUrl: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  turnstileSiteKey: '0x4AAAAAABddjw-SDSpgjBDI',
});