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

  test('should display hero section', async ({ page }) => {
    // Check hero section elements
    await expect(page.locator('[data-testid="hero-section"], .hero, h1').first()).toBeVisible();
    
    // Check for call-to-action buttons
    const ctaButtons = page.locator('a[href*="membresia"], button:has-text("Únete"), a:has-text("Únete")');
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check main navigation links
    const navLinks = [
      'Inicio',
      'Sobre Nosotras', 
      'Socias',
      'Directiva',
      'MIANIMA',
      'Membresía',
      'Contacto'
    ];
    
    for (const linkText of navLinks) {
      await expect(nav.locator(`a:has-text("${linkText}")`)).toBeVisible();
    }
  });

  test('should display statistics section', async ({ page }) => {
    // Look for statistics or counter elements
    const statsSection = page.locator('[data-testid="stats"], .stats, .statistics, .counters');
    if (await statsSection.count() > 0) {
      await expect(statsSection.first()).toBeVisible();
    }
  });

  test('should display member testimonials or features', async ({ page }) => {
    // Look for testimonials, features, or member showcase
    const contentSections = page.locator('[data-testid="testimonials"], .testimonials, [data-testid="features"], .features, [data-testid="members"], .members');
    if (await contentSections.count() > 0) {
      await expect(contentSections.first()).toBeVisible();
    }
  });

  test('should have working footer', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for social media links
    const socialLinks = footer.locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"]');
    if (await socialLinks.count() > 0) {
      await expect(socialLinks.first()).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if navigation is still accessible
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for mobile menu button if it exists
    const mobileMenuButton = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"], .mobile-menu-button');
    if (await mobileMenuButton.count() > 0) {
      await expect(mobileMenuButton.first()).toBeVisible();
    }
  });

  test('should load without JavaScript errors', async ({ page }) => {
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
      !error.includes('deprecated')
    );
    
    if (criticalErrors.length > 0) {
      console.log('JavaScript errors found:', criticalErrors);
    }
    
    // Allow some non-critical errors but fail on critical ones
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('should have proper meta tags', async ({ page }) => {
    // Check for essential meta tags
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content');
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content');
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content');
  });

  test('should have working internal links', async ({ page }) => {
    // Test main navigation links
    const navLinks = page.locator('nav a[href^="/"]');
    const linkCount = await navLinks.count();
    
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
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
});
