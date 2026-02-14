import { test, expect } from '@playwright/test';

test.describe('Feedback Flow', () => {
    test('should allow a user to navigate through feedback categories and submit', async ({ page }) => {
        // 1. Visit the test page
        await page.goto('/test-feedback');

        // 2. Open the modal
        await page.getByRole('button', { name: /open feedback modal/i }).click();
        await expect(page.getByText('Help & Feedback')).toBeVisible();

        // 3. Select "Report Bug"
        await page.getByRole('button', { name: /report bug/i }).click();
        await expect(page.getByText('Report a Bug')).toBeVisible();

        // 4. Fill in details
        await page.getByPlaceholder(/type here/i).fill('Playwright E2E Test: Something is broken!');
        await page.getByRole('button', { name: /medium/i }).click();

        // 5. Submit
        await page.getByRole('button', { name: /submit feedback/i }).click();

        // 6. Verify that it shows the auth error (expected because we are not logged in)
        await expect(page.getByText(/oturum açmanız gerekiyor/i)).toBeVisible();
    });
});
