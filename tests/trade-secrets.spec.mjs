import { expect, test } from '@playwright/test';

const path = '/trade-secrets-knowledge-platform-ai/';

async function expectNoHorizontalOverflow(page) {
  const measurements = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    root: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(measurements.root).toBeLessThanOrEqual(measurements.viewport + 1);
  expect(measurements.body).toBeLessThanOrEqual(measurements.viewport + 1);
}

test.beforeEach(async ({ page }) => {
  await page.goto(path);
});

test('顯示 PisuAI 品牌、25條法規、243案與靜態界線', async ({ page }) => {
  await expect(page).toHaveTitle(/營業秘密法 知識平台AI/);
  await expect(page.getByText('PisuAI | 紫鳥貔貅智慧', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('243', { exact: true })).toBeVisible();
  await expect(page.getByText('25', { exact: true })).toBeVisible();
  await expect(page.getByText(/不執行登入、AI 問答、會員收藏/)).toBeVisible();
  await expect(page.getByText(/官方編選摘要並非法院裁判書全文/)).toBeVisible();
});

test('案例關鍵字搜尋與官方來源詳情正常運作', async ({ page }) => {
  await page.locator('#caseSearch').fill('公差範圍');
  await expect(page.locator('#caseResultCount')).toHaveText('找到 1 件案例');
  await expect(page.getByText('「公差範圍」為經驗累積且非一般人能知悉具秘密性')).toBeVisible();
  await page.getByRole('button', { name: '查看導讀' }).click();
  const dialog = page.locator('#caseDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: '智慧局官方頁面' })).toHaveAttribute('href', /tipo\.gov\.tw/);
  await expect(dialog.getByRole('link', { name: /官方彙編 PDF/ })).toHaveAttribute('href', /\.pdf$/);
  await expect(dialog.getByText(/不是法院裁判書全文/)).toBeVisible();
});

test('360、390、430 寬度無整頁水平溢出', async ({ page }) => {
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
  ]) {
    await page.setViewportSize(viewport);
    await page.reload();
    await expectNoHorizontalOverflow(page);
    await expect(page.locator('.hero h1')).toBeVisible();
    await expect(page.locator('#caseSearch')).toBeVisible();
  }
});
