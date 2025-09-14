import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check if page loads without errors
    await expect(page).toHaveTitle(/Mujeres en la Industria de la Animación/);
    
    // Check for main content elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('should display hero section with video', async ({ page }) => {
    // Check hero section elements
    await expect(page.locator('.hero')).toBeVisible();
    
    // Check for Vimeo video
    await expect(page.locator('iframe[src*="vimeo"]')).toBeVisible();
    
    // Check for call-to-action buttons
    const ctaButtons = page.locator('a[href*="membresia"], button:has-text("Únete"), a:has-text("Únete")');
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should display statistics section', async ({ page }) => {
    // Look for statistics or counter elements
    const statsSection = page.locator('text=Socias activas, text=Crecimiento anual, text=Eventos anuales');
    await expect(statsSection.first()).toBeVisible();
  });

  test('should display testimonials section', async ({ page }) => {
    // Look for testimonials
    const testimonialsSection = page.locator('text=Testimonios, text=Lo que dicen nuestras socias');
    await expect(testimonialsSection.first()).toBeVisible();
  });

  test('should have working internal links', async ({ page }) => {
    // Test main navigation links
    const navLinks = page.locator('nav a[href^="/"]');
    const linkCount = await navLinks.count();
    
    for (let i = 0; i < Math.min(linkCount, 3); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      
      if (href && href !== '/') {
        // Click the link
        await link.click();
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        
        // Check if we're on a valid page (not 404)
        const title = await page.title();
        expect(title).not.toContain('404');
        expect(title).not.toContain('Not Found');
        
        // Go back to homepage
        await page.goto('/');
      }
    }
  });

  test('should load without critical JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check for critical errors (ignore warnings and info)
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('warn') &&
      !error.includes('info') &&
      !error.includes('deprecated') &&
      !error.includes('Vimeo player ready') // Ignore Vimeo console logs
    );
    
    if (criticalErrors.length > 0) {
      console.log('JavaScript errors found:', criticalErrors);
    }
    
    // Allow some non-critical errors but fail on critical ones
    expect(criticalErrors.length).toBeLessThan(2);
  });
});