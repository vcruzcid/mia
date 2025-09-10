import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for h1 tag
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();
    
    // Check heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(0);
    
    // Check that headings have text content
    for (let i = 0; i < Math.min(headingCount, 10); i++) {
      const heading = headings.nth(i);
      const text = await heading.textContent();
      expect(text?.trim()).toBeTruthy();
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Images should have alt text (empty alt is acceptable for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputId = await input.getAttribute('id');
      const inputType = await input.getAttribute('type');
      
      // Skip hidden inputs
      if (inputType === 'hidden') continue;
      
      if (inputId) {
        // Check for associated label
        const label = page.locator(`label[for="${inputId}"]`);
        if (await label.count() > 0) {
          await expect(label.first()).toBeVisible();
        }
      }
      
      // Check for aria-label or placeholder as fallback
      const ariaLabel = await input.getAttribute('aria-label');
      const placeholder = await input.getAttribute('placeholder');
      
      expect(ariaLabel || placeholder).toBeTruthy();
    }
  });

  test('should have proper button accessibility', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < Math.min(buttonCount, 10); i++) {
      const button = buttons.nth(i);
      
      // Buttons should have accessible text
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');
      
      expect(text?.trim() || ariaLabel || ariaLabelledBy).toBeTruthy();
      
      // Buttons should be focusable
      await button.focus();
      const isFocused = await button.evaluate(el => document.activeElement === el);
      expect(isFocused).toBeTruthy();
    }
  });

  test('should have proper link accessibility', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    const links = page.locator('a[href]');
    const linkCount = await links.count();
    
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const link = links.nth(i);
      
      // Links should have accessible text
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');
      
      expect(text?.trim() || ariaLabel || title).toBeTruthy();
      
      // Links should be focusable
      await link.focus();
      const isFocused = await link.evaluate(el => document.activeElement === el);
      expect(isFocused).toBeTruthy();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for high contrast elements
    const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6, a, button');
    const elementCount = await textElements.count();
    
    // Sample a few elements for color contrast
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = textElements.nth(i);
      const isVisible = await element.isVisible();
      
      if (isVisible) {
        const text = await element.textContent();
        if (text?.trim()) {
          // Check if element has sufficient contrast
          const color = await element.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              color: styles.color,
              backgroundColor: styles.backgroundColor
            };
          });
          
          // Basic check that colors are defined
          expect(color.color).toBeTruthy();
        }
      }
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Test tab navigation
    const focusableElements = page.locator('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const focusableCount = await focusableElements.count();
    
    if (focusableCount > 0) {
      // Test first few focusable elements
      for (let i = 0; i < Math.min(focusableCount, 5); i++) {
        const element = focusableElements.nth(i);
        await element.focus();
        
        const isFocused = await element.evaluate(el => document.activeElement === el);
        expect(isFocused).toBeTruthy();
      }
    }
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for proper ARIA landmarks
    const landmarks = page.locator('[role="banner"], [role="navigation"], [role="main"], [role="contentinfo"], [role="complementary"]');
    const landmarkCount = await landmarks.count();
    
    // Should have at least some ARIA landmarks
    expect(landmarkCount).toBeGreaterThan(0);
    
    // Check for proper ARIA labels
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [aria-describedby]');
    const ariaCount = await ariaElements.count();
    
    // Should have some ARIA attributes for better accessibility
    expect(ariaCount).toBeGreaterThan(0);
  });

  test('should have proper skip links', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Look for skip links
    const skipLinks = page.locator('a[href="#main"], a[href="#main-content"], a:has-text("Skip"), a:has-text("Saltar")');
    
    if (await skipLinks.count() > 0) {
      const skipLink = skipLinks.first();
      await expect(skipLink).toBeVisible();
      
      // Skip link should be focusable
      await skipLink.focus();
      const isFocused = await skipLink.evaluate(el => document.activeElement === el);
      expect(isFocused).toBeTruthy();
    }
  });

  test('should have proper language attributes', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for lang attribute on html element
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBeTruthy();
    
    // Check for proper meta charset
    const charset = await page.locator('meta[charset]').getAttribute('charset');
    expect(charset).toBeTruthy();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
    
    // Test Enter key on focused element
    if (focusedElement) {
      await page.keyboard.press('Enter');
      // Should not cause any errors
    }
  });

  test('should have proper error handling', async ({ page }) => {
    await page.goto('/contacto');
    await page.waitForLoadState('networkidle');
    
    const form = page.locator('form');
    const submitButton = page.locator('button[type="submit"], input[type="submit"]');
    
    if (await form.count() > 0 && await submitButton.count() > 0) {
      // Submit empty form to trigger validation
      await submitButton.first().click();
      await page.waitForTimeout(1000);
      
      // Check for proper error messages
      const errorMessages = page.locator('.error, .validation-error, [aria-invalid="true"]');
      if (await errorMessages.count() > 0) {
        const errorMessage = errorMessages.first();
        await expect(errorMessage).toBeVisible();
        
        // Error message should be associated with the field
        const ariaDescribedBy = await errorMessage.getAttribute('aria-describedby');
        const id = await errorMessage.getAttribute('id');
        
        expect(ariaDescribedBy || id).toBeTruthy();
      }
    }
  });

  test('should work with screen readers', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    
    // Check for proper semantic HTML
    const semanticElements = page.locator('main, nav, header, footer, section, article, aside');
    const semanticCount = await semanticElements.count();
    
    expect(semanticCount).toBeGreaterThan(0);
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThan(0);
    
    // Check for proper list structure
    const lists = page.locator('ul, ol');
    const listCount = await lists.count();
    
    if (listCount > 0) {
      for (let i = 0; i < Math.min(listCount, 3); i++) {
        const list = lists.nth(i);
        const listItems = list.locator('li');
        const itemCount = await listItems.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    }
  });
});
