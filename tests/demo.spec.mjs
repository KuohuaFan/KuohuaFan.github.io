import { expect, test } from '@playwright/test';

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
  await page.goto('/');
});

test('公開頁明示靜態界線並提供分離的受保護試用入口', async ({ page }) => {
  await expect(page.getByText('GitHub Pages 靜態 Demo')).toBeVisible();
  await expect(page.getByText(/不連接登入、資料庫、Solr、AI 執行/)).toBeVisible();
  const trialLink = page.getByRole('link', { name: /受保護真實服務試用/ });
  await expect(trialLink).toHaveAttribute('href', 'https://couse2.manus.space/trial');
});

test('左右抽屜、篩選、提示帶入與 Escape 關閉均可操作', async ({ page }) => {
  await page.getByRole('button', { name: '開啟對話紀錄' }).click();
  await expect(page.getByRole('dialog', { name: 'Co-USE' })).toBeVisible();
  await page.getByRole('button', { name: 'Starred' }).click();
  await expect(page.getByText('Demo：從技術資料起草')).toBeVisible();
  await expect(page.getByText('Demo：檢查現有草稿')).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Co-USE' })).toBeHidden();

  await page.getByRole('button', { name: '開啟工作選單' }).click();
  const workDialog = page.getByRole('dialog', { name: '專利 Work' });
  await expect(workDialog).toBeVisible();
  for (const stage of ['挑選範本', '撰寫草稿', '類案審查', '進行修改', '進行比較', '安全交付']) {
    await expect(workDialog.getByText(stage, { exact: true })).toBeVisible();
  }
  await page.getByRole('button', { name: '比較兩個版本' }).last().click();
  await expect(page.getByPlaceholder('您想完成哪一份專利文件？')).toHaveValue('請比較兩個專利文件版本');
  await expect(page.getByRole('dialog', { name: '專利 Work' })).toBeHidden();
});

test('送出只建立清楚標示的靜態回應與展示時間軸', async ({ page }) => {
  const input = page.getByPlaceholder('您想完成哪一份專利文件？');
  await input.fill('請從技術資料開始起草專利說明書');
  await page.getByRole('button', { name: '送出展示訊息' }).click();
  await expect(page.getByText('這是靜態展示回應。')).toBeVisible();
  await expect(page.getByText('目前尚未執行正式工作')).toBeVisible();
  await expect(page.getByText('0／6')).toBeVisible();
  await expect(page.locator('#hero')).toBeHidden();
});

test('360、390、430 寬度無整頁水平溢出，固定輸入列保持在視窗內', async ({ page }) => {
  for (const viewport of [
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
  ]) {
    await page.setViewportSize(viewport);
    await page.reload();
    await expectNoHorizontalOverflow(page);
    const box = await page.locator('#composer').boundingBox();
    expect(box).not.toBeNull();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);

    await page.getByRole('button', { name: '開啟對話紀錄' }).click();
    await expect(page.getByRole('dialog', { name: 'Co-USE' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.keyboard.press('Escape');
  }
});
