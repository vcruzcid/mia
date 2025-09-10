export interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipType: 'standard' | 'premium' | 'directiva';
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
  profileImage?: string;
  phoneNumber?: string;
  bio?: string;
  interests?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  member: Member | null;
  token: string | null;
  isLoading: boolean;
}

class AuthService {
  private readonly STORAGE_KEY = 'mia_auth_token';
  private readonly ZAPIER_WEBHOOK_URL = import.meta.env.VITE_ZAPIER_WEBHOOK_URL || '';

  async sendMagicLink(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.ZAPIER_WEBHOOK_URL}/send-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send magic link');
      }

      await response.json();
      return {
        success: true,
        message: 'Magic link sent to your email address.',
      };
    } catch (error) {
      console.error('Error sending magic link:', error);
      return {
        success: false,
        message: 'Failed to send magic link. Please try again.',
      };
    }
  }

  async verifyMagicLink(token: string): Promise<{ success: boolean; member?: Member; authToken?: string; message: string }> {
    try {
      const response = await fetch(`${this.ZAPIER_WEBHOOK_URL}/verify-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid or expired magic link');
      }

      const result = await response.json();
      
      if (result.success && result.member && result.authToken) {
        this.setAuthToken(result.authToken);
        return {
          success: true,
          member: result.member,
          authToken: result.authToken,
          message: 'Successfully authenticated',
        };
      }

      return {
        success: false,
        message: 'Invalid authentication response',
      };
    } catch (error) {
      console.error('Error verifying magic link:', error);
      return {
        success: false,
        message: 'Invalid or expired magic link. Please request a new one.',
      };
    }
  }

  async getCurrentMember(): Promise<{ success: boolean; member?: Member; message: string }> {
    const token = this.getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found',
      };
    }

    try {
      const response = await fetch(`${this.ZAPIER_WEBHOOK_URL}/get-member`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
          throw new Error('Authentication expired');
        }
        throw new Error('Failed to fetch member data');
      }

      const result = await response.json();
      return {
        success: true,
        member: result.member,
        message: 'Member data retrieved successfully',
      };
    } catch (error) {
      console.error('Error fetching member data:', error);
      return {
        success: false,
        message: 'Failed to fetch member data',
      };
    }
  }

  async updateMemberProfile(updates: Partial<Member>): Promise<{ success: boolean; member?: Member; message: string }> {
    const token = this.getAuthToken();
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found',
      };
    }

    try {
      const response = await fetch(`${this.ZAPIER_WEBHOOK_URL}/update-member`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          updates,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuth();
          throw new Error('Authentication expired');
        }
        throw new Error('Failed to update profile');
      }

      const result = await response.json();
      return {
        success: true,
        member: result.member,
        message: 'Profile updated successfully',
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        message: 'Failed to update profile',
      };
    }
  }

  private setAuthToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEY, token);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEY);
  }

  clearAuth(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  async logout(): Promise<void> {
    const token = this.getAuthToken();
    if (token) {
      try {
        await fetch(`${this.ZAPIER_WEBHOOK_URL}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
    this.clearAuth();
  }
}

export const authService = new AuthService();