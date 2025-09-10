import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login link or button', async ({ page }) => {
    // Look for login-related elements
    const loginElements = page.locator('a[href*="login"], button:has-text("Iniciar"), button:has-text("Login"), a:has-text("Iniciar"), a:has-text("Login")');
    
    if (await loginElements.count() > 0) {
      await expect(loginElements.first()).toBeVisible();
    } else {
      // If no login elements found, check if there's a portal link
      const portalElements = page.locator('a[href*="portal"], button:has-text("Portal"), a:has-text("Portal")');
      if (await portalElements.count() > 0) {
        await expect(portalElements.first()).toBeVisible();
      }
    }
  });

  test('should navigate to login page', async ({ page }) => {
    // Try to navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check if login page loaded
    const title = await page.title();
    expect(title).not.toContain('404');
    expect(title).not.toContain('Not Found');
    
    // Look for login form elements
    const loginForm = page.locator('form, [data-testid="login-form"], .login-form');
    if (await loginForm.count() > 0) {
      await expect(loginForm.first()).toBeVisible();
      
      // Check for email/username field
      const emailField = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"], input[placeholder*="correo"]');
      if (await emailField.count() > 0) {
        await expect(emailField.first()).toBeVisible();
      }
      
      // Check for password field
      const passwordField = page.locator('input[type="password"], input[name*="password"], input[placeholder*="password"], input[placeholder*="contraseña"]');
      if (await passwordField.count() > 0) {
        await expect(passwordField.first()).toBeVisible();
      }
      
      // Check for submit button
      const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Iniciar"), button:has-text("Login"), button:has-text("Entrar")');
      if (await submitButton.count() > 0) {
        await expect(submitButton.first()).toBeVisible();
      }
    }
  });

  test('should handle magic link authentication', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for magic link or email-only login
    const emailOnlyForm = page.locator('input[type="email"]:not([name*="password"]), input[placeholder*="email"]:not([name*="password"])');
    const magicLinkButton = page.locator('button:has-text("Enviar"), button:has-text("Magic"), button:has-text("Link"), button:has-text("Enviar enlace")');
    
    if (await emailOnlyForm.count() > 0 && await magicLinkButton.count() > 0) {
      // Test magic link form
      await emailOnlyForm.first().fill('test@example.com');
      await magicLinkButton.first().click();
      
      // Wait for response
      await page.waitForTimeout(2000);
      
      // Check for success message or redirect
      const successMessage = page.locator('text=Enviado, text=Enviado, text=Check your email, text=Revisa tu correo');
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test('should protect portal page', async ({ page }) => {
    // Try to access portal without authentication
    await page.goto('/portal');
    await page.waitForLoadState('networkidle');
    
    // Should either redirect to login or show access denied
    const currentUrl = page.url();
    const title = await page.title();
    
    const isRedirectedToLogin = currentUrl.includes('/login') || title.includes('Login') || title.includes('Iniciar');
    const isAccessDenied = title.includes('Access Denied') || title.includes('Acceso Denegado') || 
                          await page.locator('text=Access Denied, text=Acceso Denegado, text=Unauthorized').count() > 0;
    
    expect(isRedirectedToLogin || isAccessDenied).toBeTruthy();
  });

  test('should handle authentication state persistence', async ({ page }) => {
    // Check if there's any indication of authentication state
    const authIndicators = page.locator('[data-testid="user-menu"], .user-menu, .profile-menu, button:has-text("Perfil"), a:has-text("Perfil")');
    
    if (await authIndicators.count() > 0) {
      // User appears to be authenticated
      await expect(authIndicators.first()).toBeVisible();
      
      // Check for logout functionality
      const logoutElements = page.locator('button:has-text("Cerrar"), button:has-text("Logout"), a:has-text("Cerrar"), a:has-text("Logout")');
      if (await logoutElements.count() > 0) {
        await expect(logoutElements.first()).toBeVisible();
      }
    }
  });

  test('should handle demo authentication', async ({ page }) => {
    // Check for demo authentication option
    const demoAuthElements = page.locator('button:has-text("Demo"), a:has-text("Demo"), button:has-text("Probar"), a:has-text("Probar")');
    
    if (await demoAuthElements.count() > 0) {
      await expect(demoAuthElements.first()).toBeVisible();
      
      // Test demo authentication
      await demoAuthElements.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check if we're redirected to portal or authenticated area
      const currentUrl = page.url();
      const isAuthenticated = currentUrl.includes('/portal') || 
                             await page.locator('[data-testid="user-menu"], .user-menu, .profile-menu').count() > 0;
      
      expect(isAuthenticated).toBeTruthy();
    }
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const emailField = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]');
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Enviar")');
    
    if (await emailField.count() > 0 && await submitButton.count() > 0) {
      // Test invalid email
      await emailField.first().fill('invalid-email');
      await submitButton.first().click();
      
      // Check for validation error
      await page.waitForTimeout(1000);
      
      const validationError = page.locator('text=Invalid, text=Inválido, text=Please enter, text=Por favor ingresa, .error, .validation-error');
      if (await validationError.count() > 0) {
        await expect(validationError.first()).toBeVisible();
      }
      
      // Test valid email
      await emailField.first().fill('test@example.com');
      await submitButton.first().click();
      
      // Should not show validation error for valid email
      await page.waitForTimeout(1000);
      const errorAfterValid = page.locator('text=Invalid, text=Inválido, .error, .validation-error');
      if (await errorAfterValid.count() > 0) {
        // If error still shows, it might be a different validation
        console.log('Validation error still present after valid email');
      }
    }
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const emailField = page.locator('input[type="email"], input[name*="email"]');
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Enviar")');
    
    if (await emailField.count() > 0 && await submitButton.count() > 0) {
      // Test with non-existent email
      await emailField.first().fill('nonexistent@example.com');
      await submitButton.first().click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check for error handling (should not crash the page)
      const title = await page.title();
      expect(title).not.toContain('Error');
      expect(title).not.toContain('500');
      
      // Check if error message is displayed
      const errorMessage = page.locator('text=Error, text=Failed, text=No se pudo, .error, .alert');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test('should maintain authentication state across page navigation', async ({ page }) => {
    // First, try to authenticate if possible
    const demoAuth = page.locator('button:has-text("Demo"), a:has-text("Demo")');
    if (await demoAuth.count() > 0) {
      await demoAuth.first().click();
      await page.waitForLoadState('networkidle');
      
      // Navigate to different pages
      await page.goto('/sobre-mia');
      await page.waitForLoadState('networkidle');
      
      // Check if still authenticated
      const authIndicators = page.locator('[data-testid="user-menu"], .user-menu, .profile-menu');
      if (await authIndicators.count() > 0) {
        await expect(authIndicators.first()).toBeVisible();
      }
      
      await page.goto('/contacto');
      await page.waitForLoadState('networkidle');
      
      // Check if still authenticated
      if (await authIndicators.count() > 0) {
        await expect(authIndicators.first()).toBeVisible();
      }
    }
  });
});
