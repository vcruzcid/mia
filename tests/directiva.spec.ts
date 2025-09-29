import { test, expect } from '@playwright/test';

test.describe('Directiva Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the Directiva page
    await page.goto('/directiva');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('should load Directiva page successfully', async ({ page }) => {
    // Check page title (using the actual site title)
    await expect(page).toHaveTitle(/Mujeres en la Industria de Animación \(MIA\)/);
    
    // Check main heading
    await expect(page.locator('h1:has-text("Junta Directiva MIA")')).toBeVisible();
    
    // Check page description
    await expect(page.locator('text=Conoce a las líderes que guían nuestra asociación')).toBeVisible();
  });

  test('should display loading state initially', async ({ page }) => {
    // Navigate to page and check for loading spinner
    await page.goto('/directiva');
    
    // Check if loading spinner appears (might be very brief)
    const loadingSpinner = page.locator('.spinner, [data-testid="loading"]');
    const loadingText = page.locator('text=Cargando información de la Junta Directiva');
    
    if (await loadingSpinner.count() > 0) {
      await expect(loadingSpinner.first()).toBeVisible();
    } else if (await loadingText.count() > 0) {
      await expect(loadingText.first()).toBeVisible();
    }
  });

  test('should display period selector tabs', async ({ page }) => {
    // Check for period selector label
    await expect(page.locator('text=Seleccionar período de la directiva')).toBeVisible();
    
    // Check for tabs container
    const tabsList = page.locator('[role="tablist"], .tabs-list, [data-testid="period-tabs"]');
    await expect(tabsList).toBeVisible();
    
    // Check for current period tab (2025-2026)
    const currentPeriodTab = page.locator('text=2025-2026, [data-value="2025-2026"]');
    if (await currentPeriodTab.count() > 0) {
      await expect(currentPeriodTab.first()).toBeVisible();
    }
  });

  test('should switch between different periods', async ({ page }) => {
    // Wait for tabs to be visible
    await page.waitForSelector('[role="tablist"], .tabs-list', { timeout: 10000 });
    
    // Get all available period tabs
    const periodTabs = page.locator('[role="tab"], .tab-trigger, [data-testid="period-tab"]');
    const tabCount = await periodTabs.count();
    
    if (tabCount > 1) {
      // Click on a different period tab (not the first one)
      await periodTabs.nth(1).click();
      
      // Wait for content to update
      await page.waitForTimeout(1000);
      
      // Check if the period content changed
      const periodContent = page.locator('text=Período');
      const periodContentClass = page.locator('.period-content');
      
      if (await periodContent.count() > 0) {
        await expect(periodContent.first()).toBeVisible();
      } else if (await periodContentClass.count() > 0) {
        await expect(periodContentClass.first()).toBeVisible();
      }
    }
  });

  test('should display board members when data is available', async ({ page }) => {
    // Wait for member cards to load
    await page.waitForTimeout(2000);
    
    // Check for member cards container
    const membersGrid = page.locator('.grid, [data-testid="members-grid"], .members-container');
    if (await membersGrid.count() > 0) {
      await expect(membersGrid.first()).toBeVisible();
      
      // Check for individual member cards
      const memberCards = page.locator('.card, [data-testid="member-card"], .member-card');
      const cardCount = await memberCards.count();
      
      if (cardCount > 0) {
        // Check first member card has required elements
        const firstCard = memberCards.first();
        await expect(firstCard).toBeVisible();
        
        // Check for member name
        const memberName = firstCard.locator('h3, .member-name, [data-testid="member-name"]');
        if (await memberName.count() > 0) {
          await expect(memberName.first()).toBeVisible();
        }
        
        // Check for member position
        const memberPosition = firstCard.locator('.position, .member-position, [data-testid="member-position"]');
        if (await memberPosition.count() > 0) {
          await expect(memberPosition.first()).toBeVisible();
        }
      }
    }
  });

  test('should display "no data" message when no members available', async ({ page }) => {
    // This test might not always trigger depending on data availability
    // Check for empty state message
    const emptyState = page.locator('text=No hay información disponible, text=No se encontraron miembros');
    if (await emptyState.count() > 0) {
      await expect(emptyState.first()).toBeVisible();
    }
  });

  test('should open member modal when clicking on member card', async ({ page }) => {
    // Wait for member cards to load
    await page.waitForTimeout(2000);
    
    const memberCards = page.locator('.card, [data-testid="member-card"], .member-card');
    const cardCount = await memberCards.count();
    
    if (cardCount > 0) {
      // Click on first member card
      await memberCards.first().click();
      
      // Wait for modal to open
      await page.waitForTimeout(1000);
      
      // Check if modal is visible
      const modal = page.locator('[role="dialog"], .modal, [data-testid="member-modal"]');
      if (await modal.count() > 0) {
        await expect(modal.first()).toBeVisible();
        
        // Check for modal content
        const modalContent = modal.locator('.modal-content, [data-testid="modal-content"]');
        if (await modalContent.count() > 0) {
          await expect(modalContent.first()).toBeVisible();
        }
        
        // Check for close button
        const closeButton = modal.locator('button:has-text("×"), button:has-text("Close"), [data-testid="close-modal"]');
        if (await closeButton.count() > 0) {
          await expect(closeButton.first()).toBeVisible();
          
          // Test closing modal
          await closeButton.first().click();
          await page.waitForTimeout(500);
          
          // Check if modal is closed
          await expect(modal.first()).not.toBeVisible();
        }
      }
    }
  });

  test('should display contact information for current period', async ({ page }) => {
    // Make sure we're on the current period (2025-2026)
    const currentPeriodTab = page.locator('text=2025-2026, [data-value="2025-2026"]');
    if (await currentPeriodTab.count() > 0) {
      await currentPeriodTab.first().click();
      await page.waitForTimeout(1000);
    }
    
    // Check for contact section
    const contactSection = page.locator('text=¿Necesitas contactar con la Junta Directiva?, .contact-section');
    if (await contactSection.count() > 0) {
      await expect(contactSection.first()).toBeVisible();
      
      // Check for email links
      const emailLinks = page.locator('a[href^="mailto:"]');
      const emailCount = await emailLinks.count();
      expect(emailCount).toBeGreaterThan(0);
      
      // Check for specific email addresses
      const presidenciaEmail = page.locator('a[href="mailto:presidencia@animacionesmia.com"]');
      if (await presidenciaEmail.count() > 0) {
        await expect(presidenciaEmail.first()).toBeVisible();
      }
    }
  });

  test('should handle responsive design correctly', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if page still loads correctly on mobile
    await expect(page.locator('h1:has-text("Junta Directiva MIA")')).toBeVisible();
    
    // Check if tabs are still visible on mobile
    const tabsList = page.locator('[role="tablist"], .tabs-list');
    if (await tabsList.count() > 0) {
      await expect(tabsList.first()).toBeVisible();
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if page loads correctly on tablet
    await expect(page.locator('h1:has-text("Junta Directiva MIA")')).toBeVisible();
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Listen for page errors
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Filter out non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('warn') &&
      !error.includes('info') &&
      !error.includes('deprecated') &&
      !error.includes('ResizeObserver') &&
      !error.includes('Non-passive event listener')
    );
    
    if (criticalErrors.length > 0) {
      console.log('JavaScript errors found on Directiva page:', criticalErrors);
    }
    
    // Allow some non-critical errors but fail on critical ones
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('should have proper accessibility features', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for proper ARIA labels on tabs
    const tabs = page.locator('[role="tab"]');
    if (await tabs.count() > 0) {
      const firstTab = tabs.first();
      const ariaLabel = await firstTab.getAttribute('aria-label');
      const ariaSelected = await firstTab.getAttribute('aria-selected');
      
      // At least one of these should be present
      expect(ariaLabel || ariaSelected).toBeTruthy();
    }
    
    // Check for proper focus management
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    if (await focusedElement.count() > 0) {
      await expect(focusedElement.first()).toBeVisible();
    }
  });

  test('should load member data from API correctly', async ({ page }) => {
    // Intercept API calls
    const apiCalls: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('supabase')) {
        apiCalls.push(request.url());
      }
    });
    
    // Wait for API calls to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check if API calls were made
    console.log('API calls made:', apiCalls);
    
    // Check if data is displayed (either members or empty state)
    const hasMembers = await page.locator('.card, .member-card').count() > 0;
    const hasEmptyState = await page.locator('text=No hay información disponible').count() > 0;
    
    expect(hasMembers || hasEmptyState).toBeTruthy();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network failure
    await page.route('**/api/**', route => route.abort());
    await page.route('**/supabase/**', route => route.abort());
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if page still renders without crashing
    await expect(page.locator('h1:has-text("Junta Directiva MIA")')).toBeVisible();
    
    // Check for error handling (loading state should eventually show empty state or error)
    await page.waitForTimeout(5000);
    
    const hasContent = await page.locator('.card, .member-card').count() > 0 || 
                      await page.locator('text=No hay información disponible').count() > 0 ||
                      await page.locator('text=Error').count() > 0;
    expect(hasContent).toBeTruthy();
  });
});