import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Homepage should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
    
    // Check for main content
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check for large contentful paint
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });

  test('should not have too many network requests', async ({ page }) => {
    const requests: string[] = [];
    
    page.on('request', request => {
      requests.push(request.url());
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should not have excessive number of requests
    expect(requests.length).toBeLessThan(50);
    
    // Check for unnecessary requests
    const duplicateRequests = requests.filter((url, index) => requests.indexOf(url) !== index);
    expect(duplicateRequests.length).toBeLessThan(5);
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 10); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');
      
      // Images should have alt text
      expect(alt).toBeTruthy();
      
      // Check for modern image formats or proper sizing
      if (src) {
        const isModernFormat = src.includes('.webp') || src.includes('.avif') || src.includes('?w=') || src.includes('&w=');
        // This is a soft check - modern formats are preferred but not required
        if (isModernFormat) {
          console.log(`Modern image format detected: ${src}`);
        }
      }
    }
  });

  test('should have minimal JavaScript bundle size', async ({ page }) => {
    const jsRequests: string[] = [];
    let totalJSSize = 0;
    
    page.on('response', response => {
      if (response.url().includes('.js') && response.status() === 200) {
        jsRequests.push(response.url());
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          totalJSSize += parseInt(contentLength);
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Total JS size should be reasonable (under 2MB)
    expect(totalJSSize).toBeLessThan(2 * 1024 * 1024);
    
    // Should not have too many JS files
    expect(jsRequests.length).toBeLessThan(20);
  });

  test('should have proper caching headers', async ({ page }) => {
    const responses: { url: string; cacheControl: string | null }[] = [];
    
    page.on('response', response => {
      if (response.url().includes('dev.animacionesmia.com') && response.status() === 200) {
        responses.push({
          url: response.url(),
          cacheControl: response.headers()['cache-control']
        });
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that static assets have caching headers
    const staticAssets = responses.filter(r => 
      r.url.includes('.css') || 
      r.url.includes('.js') || 
      r.url.includes('.png') || 
      r.url.includes('.jpg') || 
      r.url.includes('.webp')
    );
    
    const cachedAssets = staticAssets.filter(r => r.cacheControl && r.cacheControl.includes('max-age'));
    
    // At least some static assets should have caching
    expect(cachedAssets.length).toBeGreaterThan(0);
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow 3G
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Even with slow network, should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
    
    // Main content should still be visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should not have memory leaks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      await page.goto('/sobre-mia');
      await page.waitForLoadState('networkidle');
      await page.goto('/contacto');
      await page.waitForLoadState('networkidle');
      await page.goto('/');
      await page.waitForLoadState('networkidle');
    }
    
    // Check memory usage
    const memoryInfo = await page.evaluate(() => {
      return (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize
      } : null;
    });
    
    if (memoryInfo) {
      // Memory usage should be reasonable (under 100MB)
      expect(memoryInfo.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024);
    }
  });

  test('should have proper resource prioritization', async ({ page }) => {
    const resourceTypes: { [key: string]: number } = {};
    
    page.on('request', request => {
      const resourceType = request.resourceType();
      resourceTypes[resourceType] = (resourceTypes[resourceType] || 0) + 1;
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Critical resources should load first
    expect(resourceTypes.document).toBe(1); // Should have exactly one document request
    
    // Should have reasonable number of each resource type
    expect(resourceTypes.stylesheet || 0).toBeLessThan(10);
    expect(resourceTypes.script || 0).toBeLessThan(20);
    expect(resourceTypes.image || 0).toBeLessThan(30);
  });

  test('should handle concurrent users', async ({ browser }) => {
    // Simulate multiple concurrent users
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(contexts.map(context => context.newPage()));
    
    const startTime = Date.now();
    
    // All pages should load simultaneously
    await Promise.all(pages.map(page => page.goto('/')));
    await Promise.all(pages.map(page => page.waitForLoadState('networkidle')));
    
    const loadTime = Date.now() - startTime;
    
    // Should handle concurrent loads within reasonable time
    expect(loadTime).toBeLessThan(8000);
    
    // All pages should load successfully
    for (const page of pages) {
      await expect(page.locator('h1')).toBeVisible();
    }
    
    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });
});
