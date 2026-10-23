import { expect, test } from '@playwright/test';

test('el home renderiza', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'biyuya-business' })).toBeVisible();
});

test('productos redirige a login sin sesión', async ({ page }) => {
	await page.goto('/products');
	await expect(page).toHaveURL(/\/login/);
});

test('ventas redirige a login sin sesión', async ({ page }) => {
	await page.goto('/sales');
	await expect(page).toHaveURL(/\/login/);
});
