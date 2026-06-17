import { test, expect } from '@playwright/test';

test("study a chapter card, then it appears in tomorrow's review", async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('cards due')).toBeVisible();

	await page.goto('/chapter/ch-01/flashcards');
	await page.getByRole('button', { name: 'Reveal' }).click();
	await page.getByRole('button', { name: 'Good' }).click();

	await page.reload();
	await page.goto('/');
	await page.goto('/review');
	await expect(page.getByText('Nothing due')).toBeVisible();
});
