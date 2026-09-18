# Co-USE／PiSuAI 靜態 Demo

這是 Co-USE／PiSuAI 專利工作對話介面的**獨立靜態展示版**，用於呈現首頁、左右抽屜、沉浸式對話、六站工作時間軸與行動版配置。

公開預覽：<https://kuohuafan.github.io/>

受保護真實服務試用入口：<https://couse2.manus.space/trial>

營業秘密法 知識平台AI 唯讀版：<https://kuohuafan.github.io/trade-secrets-knowledge-platform-ai/>

## PisuAI｜紫鳥貔貅智慧法律知識子站

`trade-secrets-knowledge-platform-ai/` 是「營業秘密法 知識平台AI」的獨立靜態子站。公開範圍包括 25 條法規、智慧財產局七份歷年彙編的 243 案索引、主題與法條熱度，以及官方頁面與 PDF 追溯連結。

該子站不公開完整官方摘要、法院理由節錄、逐案 DJS／CEF 全文、會員資料或 secrets。GitHub Pages 不執行登入、AI、資料庫、收藏、比較或 Solr 全文服務；這些能力仍由完整 Manus 全端平台提供。

## 重要界線

本 Demo **不連接**登入、資料庫、Solr、檔案儲存、真實 AI 工作、正式審閱、外部檢索或送件服務。所有畫面操作只存在於目前瀏覽器頁面，不會建立案件、工作紀錄或交付物。

正式全端專案備份位於私人儲存庫 `couse-pisuai-workspace-backup`；本公開儲存庫只包含 Demo 所需的 HTML、CSS 與 JavaScript。公開頁面由 `KuohuaFan/KuohuaFan.github.io` 的 `main` 分支根目錄發布，不需要後端服務或環境變數。

公開 Demo 只提供前往受保護試用入口的超連結，不會把真實 API、憑證或資料功能搬到 GitHub Pages。試用入口使用登入驗證，真實案件、對話、附件與成果仍由私人全端系統依帳號隔離。

## 本機預覽

```bash
python3 -m http.server 4173
```

開啟 `http://localhost:4173`。

## 自動化瀏覽器回歸

本專案使用 Playwright 驗證靜態界線、左右抽屜、六站 Work、提示帶入、靜態回應，以及 360、390、430 CSS 像素寬度的水平溢出與固定輸入列。公開站回歸另以全新未登入瀏覽器核對 `/trial` 只顯示登入閘門，不會載入私人對話、案件或成果。

```bash
npm ci
npx playwright install chromium
npm test
```

執行 `npm run test:live` 可直接核對已發布的 GitHub Pages。專案目前另設每週一次的已發布網站回歸排程，同時核對 GitHub Pages 與受保護 `/trial` 入口並向專案任務回報結果。GitHub Actions workflow 也已備妥；待 GitHub 連線取得 `workflows` 寫入權限後，可再啟用推送／Pull Request 自動檢查與 14 天測試證據保存。

## 驗證尺寸

- 桌機：1280 × 720
- 手機：360 × 800、390 × 844、430 × 932

## 授權與資料

本 Demo 不包含真實客戶資料、案件資料、憑證或環境變數。未經權利人書面授權，不得將介面、品牌或內容另作商業使用。
