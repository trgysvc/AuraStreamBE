import { test, expect } from '@playwright/test';

test.describe('Basic Page Loads', () => {
    test('should load the landing page', async ({ page }) => {
        await page.goto('/');

        // Check if the title contains our brand name
        await expect(page).toHaveTitle(/AuraStream|SONARAURA/i);

        // Check for a call to action or main heading
        const heading = page.getByRole('heading', { level: 1 });
        await expect(heading).toBeVisible();
    });

    test('should have a working navigation to pricing', async ({ page }) => {
        await page.goto('/');

        // Find a link to pricing and click it
        const pricingLink = page.getByRole('link', { name: /pricing|fiyatlandırma/i }).first();
        if (await pricingLink.isVisible()) {
            await pricingLink.click();
            await expect(page).toHaveURL(/.*pricing/);
        }
    });
});
