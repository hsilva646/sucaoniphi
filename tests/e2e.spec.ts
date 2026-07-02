import { test, expect } from '@playwright/test';

test('Vendas → Relatórios flow', async ({ page }) => {
  await page.goto('/');

  // Go to Vendas
  await page.click('text=Vendas');

  // Inject a sale via exposed store
  const injected = await page.evaluate(() => {
    // @ts-ignore
    const store = (window as any).__APP_STORE;
    if (!store) return false;
    const st = typeof store.getState === 'function' ? store.getState() : store;
    if (!st.setSales) return false;
    st.setSales([{ id: 's-e2e-1', date: new Date().toISOString().split('T')[0], productId: 'p-1', qty: 2, price: 9.5, payment: 'cash', client: 'E2E' }]);
    return true;
  });

  expect(injected).toBeTruthy();

  // Wait for the sale item to appear in the list
  await expect(page.locator('text=Dindin Tradicional')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=R$ 19,00')).toBeVisible();

  // Go to Relatórios and assert totals
  await page.click('text=Relatórios');
  await expect(page.locator('text=Receita total')).toBeVisible();
  await expect(page.locator('text=R$ 19,00')).toBeVisible();
});
