import { expect, test } from '@playwright/test';

const trialUrl = process.env.TRIAL_BASE_URL;

test.describe('受保護真實服務試用入口', () => {
  test.skip(!trialUrl, '只有指定 TRIAL_BASE_URL 時才核對真實服務入口');

  test('未登入瀏覽器只看到登入閘門，且手機無水平溢出', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(trialUrl);

    await expect(page.getByText('受保護試用入口', { exact: true })).toBeVisible();
    await expect(page.getByText('需要登入', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '登入並繼續' })).toBeVisible();
    await expect(page.getByText(/未登入狀態不會載入私人對話、案件或成果/)).toBeVisible();
    await expect(page.getByRole('link', { name: /只看公開靜態 Demo/ })).toHaveAttribute('href', 'https://kuohuafan.github.io/');

    const measurements = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      root: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(measurements.root).toBeLessThanOrEqual(measurements.viewport + 1);
    expect(measurements.body).toBeLessThanOrEqual(measurements.viewport + 1);
  });
});
