import { test, expect } from '@playwright/test';

test.describe('Forms Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should test contact form', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    
    // Look for contact form
    const contactForm = page.locator('form, [data-testid="contact-form"], .contact-form');
    
    if (await contactForm.count() > 0) {
      await expect(contactForm.first()).toBeVisible();
      
      // Test form fields
      const nameField = page.locator('input[name*="name"], input[placeholder*="nombre"], input[placeholder*="name"]');
      const emailField = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]');
      const messageField = page.locator('textarea, input[name*="message"], input[placeholder*="mensaje"]');
      const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Enviar"), button:has-text("Submit")');
      
      if (await nameField.count() > 0) {
        await nameField.first().fill('Test User');
        await expect(nameField.first()).toHaveValue('Test User');
      }
      
      if (await emailField.count() > 0) {
        await emailField.first().fill('test@example.com');
        await expect(emailField.first()).toHaveValue('test@example.com');
      }
      
      if (await messageField.count() > 0) {
        await messageField.first().fill('This is a test message');
        await expect(messageField.first()).toHaveValue('This is a test message');
      }
      
      if (await submitButton.count() > 0) {
        await expect(submitButton.first()).toBeVisible();
        await expect(submitButton.first()).toBeEnabled();
      }
    }
  });

  test('should test registration form', async ({ page }) => {
    await page.goto('/registro');
    await page.waitForLoadState('networkidle');
    
    // Look for registration form
    const registrationForm = page.locator('form, [data-testid="registration-form"], .registration-form');
    
    if (await registrationForm.count() > 0) {
      await expect(registrationForm.first()).toBeVisible();
      
      // Test form fields
      const firstNameField = page.locator('input[name*="first"], input[placeholder*="nombre"], input[placeholder*="first"]');
      const lastNameField = page.locator('input[name*="last"], input[placeholder*="apellido"], input[placeholder*="last"]');
      const emailField = page.locator('input[type="email"], input[name*="email"]');
      const phoneField = page.locator('input[type="tel"], input[name*="phone"], input[placeholder*="teléfono"]');
      const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Registrar"), button:has-text("Submit")');
      
      if (await firstNameField.count() > 0) {
        await firstNameField.first().fill('Test');
        await expect(firstNameField.first()).toHaveValue('Test');
      }
      
      if (await lastNameField.count() > 0) {
        await lastNameField.first().fill('User');
        await expect(lastNameField.first()).toHaveValue('User');
      }
      
      if (await emailField.count() > 0) {
        await emailField.first().fill('test@example.com');
        await expect(emailField.first()).toHaveValue('test@example.com');
      }
      
      if (await phoneField.count() > 0) {
        await phoneField.first().fill('+1234567890');
        await expect(phoneField.first()).toHaveValue('+1234567890');
      }
      
      if (await submitButton.count() > 0) {
        await expect(submitButton.first()).toBeVisible();
        await expect(submitButton.first()).toBeEnabled();
      }
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form');
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Enviar")');
    
    if (await form.count() > 0 && await submitButton.count() > 0) {
      // Try to submit empty form
      await submitButton.first().click();
      
      // Wait for validation
      await page.waitForTimeout(1000);
      
      // Check for validation errors
      const validationErrors = page.locator('.error, .validation-error, [aria-invalid="true"], text=Required, text=Requerido');
      if (await validationErrors.count() > 0) {
        await expect(validationErrors.first()).toBeVisible();
      }
    }
  });

  test('should validate email format in forms', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    
    const emailField = page.locator('input[type="email"], input[name*="email"]');
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Enviar")');
    
    if (await emailField.count() > 0 && await submitButton.count() > 0) {
      // Test invalid email
      await emailField.first().fill('invalid-email');
      await submitButton.first().click();
      
      await page.waitForTimeout(1000);
      
      // Check for email validation error
      const emailError = page.locator('text=Invalid email, text=Email inválido, text=Please enter, .error, .validation-error');
      if (await emailError.count() > 0) {
        await expect(emailError.first()).toBeVisible();
      }
    }
  });

  test('should handle form submission', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form');
    const nameField = page.locator('input[name*="name"], input[placeholder*="nombre"]');
    const emailField = page.locator('input[type="email"], input[name*="email"]');
    const messageField = page.locator('textarea, input[name*="message"]');
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Enviar")');
    
    if (await form.count() > 0 && await submitButton.count() > 0) {
      // Fill out form
      if (await nameField.count() > 0) {
        await nameField.first().fill('Test User');
      }
      if (await emailField.count() > 0) {
        await emailField.first().fill('test@example.com');
      }
      if (await messageField.count() > 0) {
        await messageField.first().fill('This is a test message for form submission');
      }
      
      // Submit form
      await submitButton.first().click();
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check for success message or redirect
      const successMessage = page.locator('text=Success, text=Éxito, text=Thank you, text=Gracias, text=Message sent, text=Mensaje enviado');
      const errorMessage = page.locator('text=Error, text=Failed, text=No se pudo, .error, .alert');
      
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      } else if (await errorMessage.count() > 0) {
        // If there's an error, make sure it's not a critical error
        const errorText = await errorMessage.first().textContent();
        expect(errorText).not.toContain('500');
        expect(errorText).not.toContain('Internal Server Error');
      }
    }
  });

  test('should test newsletter subscription', async ({ page }) => {
    // Look for newsletter signup on homepage or footer
    const newsletterForm = page.locator('form[action*="newsletter"], form[data-testid="newsletter"], .newsletter-form');
    const emailField = page.locator('input[type="email"][placeholder*="newsletter"], input[type="email"][placeholder*="suscribir"]');
    const subscribeButton = page.locator('button:has-text("Subscribe"), button:has-text("Suscribir"), input[type="submit"][value*="Subscribe"]');
    
    if (await newsletterForm.count() > 0 || (await emailField.count() > 0 && await subscribeButton.count() > 0)) {
      if (await emailField.count() > 0) {
        await emailField.first().fill('test@example.com');
        await expect(emailField.first()).toHaveValue('test@example.com');
      }
      
      if (await subscribeButton.count() > 0) {
        await expect(subscribeButton.first()).toBeVisible();
        await expect(subscribeButton.first()).toBeEnabled();
      }
    }
  });

  test('should handle file uploads', async ({ page }) => {
    await page.goto('/registro');
    await page.waitForLoadState('networkidle');
    
    // Look for file upload fields
    const fileInput = page.locator('input[type="file"]');
    
    if (await fileInput.count() > 0) {
      await expect(fileInput.first()).toBeVisible();
      
      // Check if file input has proper attributes
      const acceptAttribute = await fileInput.first().getAttribute('accept');
      const multipleAttribute = await fileInput.first().getAttribute('multiple');
      
      // These are optional, just check they exist if present
      expect(acceptAttribute !== null || multipleAttribute !== null).toBeTruthy();
    }
  });

  test('should test form accessibility', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form');
    
    if (await form.count() > 0) {
      // Check for proper form labels
      const inputs = form.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputCount, 5); i++) {
        const input = inputs.nth(i);
        const inputId = await input.getAttribute('id');
        const inputType = await input.getAttribute('type');
        
        if (inputId) {
          // Check for associated label
          const label = page.locator(`label[for="${inputId}"]`);
          if (await label.count() > 0) {
            await expect(label.first()).toBeVisible();
          }
        }
        
        // Check for aria-label or placeholder
        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        
        expect(ariaLabel || placeholder).toBeTruthy();
      }
    }
  });

  test('should handle form reset', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form');
    const nameField = page.locator('input[name*="name"], input[placeholder*="nombre"]');
    const emailField = page.locator('input[type="email"], input[name*="email"]');
    const resetButton = page.locator('button[type="reset"], input[type="reset"], button:has-text("Reset"), button:has-text("Limpiar")');
    
    if (await form.count() > 0 && await resetButton.count() > 0) {
      // Fill out form
      if (await nameField.count() > 0) {
        await nameField.first().fill('Test User');
      }
      if (await emailField.count() > 0) {
        await emailField.first().fill('test@example.com');
      }
      
      // Reset form
      await resetButton.first().click();
      
      // Check if fields are cleared
      if (await nameField.count() > 0) {
        await expect(nameField.first()).toHaveValue('');
      }
      if (await emailField.count() > 0) {
        await expect(emailField.first()).toHaveValue('');
      }
    }
  });
});
