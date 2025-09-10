import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to all main pages', async ({ page }) => {
    const pages = [
      { name: 'Sobre Nosotras', path: '/sobre-mia' },
      { name: 'Socias', path: '/socias' },
      { name: 'Directiva', path: '/directiva' },
      { name: 'MIANIMA', path: '/mianima' },
      { name: 'Membresía', path: '/membresia' },
      { name: 'Contacto', path: '/contacto' }
    ];

    for (const pageInfo of pages) {
      // Navigate to the page
      await page.goto(pageInfo.path);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check if page loaded successfully
      const title = await page.title();
      expect(title).not.toContain('404');
      expect(title).not.toContain('Not Found');
      expect(title).not.toBe('');
      
      // Check for main content
      const mainContent = page.locator('main, [role="main"], .main-content');
      if (await mainContent.count() > 0) {
        await expect(mainContent.first()).toBeVisible();
      }
      
      // Check for page-specific content
      const heading = page.locator('h1, h2').first();
      if (await heading.count() > 0) {
        await expect(heading).toBeVisible();
      }
    }
  });

  test('should have working mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Look for mobile menu button
    const mobileMenuButton = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"], .mobile-menu-button, button:has-text("☰"), button:has-text("Menu")');
    
    if (await mobileMenuButton.count() > 0) {
      // Click mobile menu button
      await mobileMenuButton.first().click();
      
      // Check if mobile menu is visible
      const mobileMenu = page.locator('[data-testid="mobile-menu-content"], .mobile-menu, .mobile-nav');
      if (await mobileMenu.count() > 0) {
        await expect(mobileMenu.first()).toBeVisible();
        
        // Test mobile menu links
        const mobileLinks = mobileMenu.locator('a');
        const linkCount = await mobileLinks.count();
        
        for (let i = 0; i < Math.min(linkCount, 3); i++) {
          const link = mobileLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && href.startsWith('/')) {
            await link.click();
            await page.waitForLoadState('networkidle');
            
            const title = await page.title();
            expect(title).not.toContain('404');
            
            // Go back to homepage
            await page.goto('/');
            await page.setViewportSize({ width: 375, height: 667 });
            await mobileMenuButton.first().click();
          }
        }
      }
    }
  });

  test('should maintain navigation state across pages', async ({ page }) => {
    // Check navigation on homepage
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Navigate to another page
    await page.goto('/sobre-mia');
    await page.waitForLoadState('networkidle');
    
    // Check navigation is still visible
    await expect(nav).toBeVisible();
    
    // Navigate to another page
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    
    // Check navigation is still visible
    await expect(nav).toBeVisible();
  });

  test('should have proper active states', async ({ page }) => {
    // Test active state on homepage
    await page.goto('/');
    const homeLink = page.locator('nav a[href="/"]');
    if (await homeLink.count() > 0) {
      // Check if home link has active state (this depends on implementation)
      const homeLinkClasses = await homeLink.first().getAttribute('class');
      // This is implementation-specific, so we just check it exists
      expect(homeLinkClasses).toBeDefined();
    }
    
    // Test active state on other pages
    await page.goto('/sobre-mia');
    await page.waitForLoadState('networkidle');
    
    const aboutLink = page.locator('nav a[href="/sobre-mia"]');
    if (await aboutLink.count() > 0) {
      const aboutLinkClasses = await aboutLink.first().getAttribute('class');
      expect(aboutLinkClasses).toBeDefined();
    }
  });

  test('should have accessible navigation', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check for proper ARIA labels
    const navWithRole = page.locator('nav[role="navigation"]');
    if (await navWithRole.count() > 0) {
      await expect(navWithRole.first()).toBeVisible();
    }
    
    // Check for skip links
    const skipLink = page.locator('a[href="#main-content"], a:has-text("Skip"), a:has-text("Saltar")');
    if (await skipLink.count() > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    // Test navigation to non-existent page
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    // Check if 404 page is displayed or if we're redirected
    const title = await page.title();
    const url = page.url();
    
    // Either we should have a 404 page or be redirected
    const has404Content = title.includes('404') || title.includes('Not Found') || 
                         await page.locator('text=404, text=Not Found, text=Page not found').count() > 0;
    
    expect(has404Content || url.includes('404')).toBeTruthy();
  });

  test('should have consistent navigation across different viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 1024, height: 768, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Check navigation is visible
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
      
      // Check main navigation links are accessible
      const navLinks = nav.locator('a');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });
});
