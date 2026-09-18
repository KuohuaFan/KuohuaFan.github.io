const DATA_PATH = "./data";
const PAGE_SIZE = 12;
const typeLabels = {
  civil: "民事",
  criminal: "刑事",
  procedure: "程序",
  other: "其他",
};

const state = {
  articles: [],
  cases: [],
  metadata: null,
  articleQuery: "",
  caseQuery: "",
  year: "",
  type: "",
  topic: "",
  page: 1,
};

const byId = id => document.getElementById(id);
const normalize = value =>
  String(value ?? "")
    .toLocaleLowerCase("zh-Hant")
    .replace(/\s+/g, " ")
    .trim();
const escapeHtml = value =>
  String(value ?? "").replace(
    /[&<>'"]/g,
    char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        char
      ]
  );
const joinText = value =>
  Array.isArray(value)
    ? value.map(joinText).join(" ")
    : typeof value === "object" && value
      ? Object.values(value).map(joinText).join(" ")
      : String(value ?? "");

function populateMetrics() {
  byId("metricArticles").textContent = state.metadata.articleCount;
  byId("metricCases").textContent = state.metadata.caseCount;
  byId("metricCollections").textContent = state.metadata.collectionCount;
}

function populateFilters() {
  const years = [
    ...new Set(state.cases.map(item => item.collectionLabel).filter(Boolean)),
  ];
  const topics = [
    ...new Set(state.cases.map(item => item.topicGroup).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "zh-Hant"));
  byId("yearFilter").insertAdjacentHTML(
    "beforeend",
    years
      .map(
        year =>
          `<option value="${escapeHtml(year)}">${escapeHtml(year)}</option>`
      )
      .join("")
  );
  byId("topicFilter").insertAdjacentHTML(
    "beforeend",
    topics
      .map(
        topic =>
          `<option value="${escapeHtml(topic)}">${escapeHtml(topic)}</option>`
      )
      .join("")
  );
}

function renderArticles() {
  const query = normalize(state.articleQuery);
  const matches = state.articles.filter(
    article => !query || normalize(joinText(article)).includes(query)
  );
  const list = byId("articleList");
  if (!matches.length) {
    list.innerHTML = '<p class="empty">找不到符合條件的條文。</p>';
    return;
  }
  list.innerHTML = matches
    .map(
      article => `
    <details class="article-card">
      <summary>
        <span class="article-no">${escapeHtml(article.articleLabel)}</span>
        <span class="article-title"><strong>${escapeHtml(article.section)}</strong><small>${escapeHtml(article.chapterName)}</small></span>
      </summary>
      <div class="article-body">
        <p>${escapeHtml(article.content)}</p>
        <div class="analysis-tabs">
          ${analysisBlock("裁判實務摘要", article.judgmentSummary)}
        </div>
      </div>
    </details>
  `
    )
    .join("");
}

function analysisBlock(title, content) {
  if (!content) return "";
  return `<details class="analysis-block"><summary><h4>${escapeHtml(title)}</h4></summary><p>${escapeHtml(content)}</p></details>`;
}

function filteredCases() {
  const query = normalize(state.caseQuery);
  return state.cases.filter(item => {
    if (state.year && item.collectionLabel !== state.year) return false;
    if (state.type && item.caseType !== state.type) return false;
    if (state.topic && item.topicGroup !== state.topic) return false;
    return !query || normalize(joinText(item)).includes(query);
  });
}

function renderCases() {
  const matches = filteredCases();
  const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  state.page = Math.min(state.page, pageCount);
  const pageItems = matches.slice(
    (state.page - 1) * PAGE_SIZE,
    state.page * PAGE_SIZE
  );
  byId("caseResultCount").textContent =
    `找到 ${matches.length.toLocaleString("zh-Hant")} 件案例`;
  byId("pageStatus").textContent = `第 ${state.page} / ${pageCount} 頁`;
  byId("prevPage").disabled = state.page <= 1;
  byId("nextPage").disabled = state.page >= pageCount;
  byId("caseList").innerHTML = pageItems.length
    ? pageItems
        .map(item => {
          const articleTags = (item.articleRefs ?? [])
            .slice(0, 4)
            .map(
              ref =>
                `<span class="tag">${escapeHtml(ref.article_label ?? ref.articleLabel)}</span>`
            )
            .join("");
          return `
      <article class="case-card">
        <div class="case-meta"><div class="case-year">${escapeHtml(item.collectionLabel)}</div><div>${escapeHtml(typeLabels[item.caseType] ?? item.caseType ?? "未分類")}</div><div>案例 ${escapeHtml(item.caseNumber)}</div></div>
        <div class="case-main">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.court)} · ${escapeHtml(item.judgmentNo)}</p>
          <div class="case-tags"><span class="tag">${escapeHtml(item.topicGroup)}</span>${item.subtopic ? `<span class="tag">${escapeHtml(item.subtopic)}</span>` : ""}${articleTags}</div>
        </div>
        <button class="case-open" type="button" data-case-key="${escapeHtml(item.stableKey)}">查看導讀</button>
      </article>
    `;
        })
        .join("")
    : '<p class="empty">找不到符合條件的案例。</p>';
  document
    .querySelectorAll("[data-case-key]")
    .forEach(button =>
      button.addEventListener("click", () => openCase(button.dataset.caseKey))
    );
}

function openCase(stableKey) {
  const item = state.cases.find(candidate => candidate.stableKey === stableKey);
  if (!item) return;
  const articleRefs = (item.articleRefs ?? [])
    .map(
      ref =>
        `${ref.article_label ?? ref.articleLabel}${ref.relation_type === "inferred" ? "（推論關聯）" : ""}`
    )
    .join("、");
  const links = [
    item.officialPage
      ? `<a href="${escapeHtml(item.officialPage)}" target="_blank" rel="noopener noreferrer">智慧局官方頁面</a>`
      : "",
    item.officialPdf
      ? `<a href="${escapeHtml(item.officialPdf)}" target="_blank" rel="noopener noreferrer">官方彙編 PDF（第 ${escapeHtml(item.sourcePage ?? "—")} 頁）</a>`
      : "",
  ]
    .filter(Boolean)
    .join("");
  byId("caseDialogContent").innerHTML = `
    <div class="dialog-content">
      <p class="kicker">${escapeHtml(item.collectionLabel)} · 案例 ${escapeHtml(item.caseNumber)}</p>
      <h2>${escapeHtml(item.title)}</h2>
      <p class="dialog-meta">${escapeHtml(item.court)} · ${escapeHtml(item.judgmentNo)}${item.judgmentDateRoc ? ` · ${escapeHtml(item.judgmentDateRoc)}` : ""}</p>
      ${dialogSection("索引重點", item.keyPoint)}
      ${dialogSection("主題", [item.topicGroup, item.subtopic].filter(Boolean).join("／"))}
      ${dialogSection("法條關聯", articleRefs)}
      <div class="dialog-links">${links}</div>
      <div class="dialog-disclaimer">${escapeHtml(item.sourceLimit ?? state.metadata.sourceNotice)}</div>
    </div>
  `;
  byId("caseDialog").showModal();
}

function dialogSection(title, content) {
  if (!content) return "";
  return `<section class="dialog-section"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(content)}</p></section>`;
}

function renderBarChart(targetId, rows, limit = 10) {
  const target = byId(targetId);
  const data = rows.slice(0, limit);
  const max = Math.max(...data.map(row => row.count), 1);
  target.innerHTML = data
    .map(
      row => `
    <div class="bar-row"><span>${escapeHtml(row.label)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(3, (row.count / max) * 100)}%"></div></div><strong>${row.count}</strong></div>
  `
    )
    .join("");
}

function renderCharts() {
  renderBarChart("yearChart", state.metadata.yearly, 10);
  renderBarChart("topicChart", state.metadata.topics, 10);
  byId("articleHeatChart").innerHTML = state.metadata.articleHeat
    .slice(0, 18)
    .map(
      row =>
        `<span class="heat-pill">${escapeHtml(row.label)} <strong>${row.count}</strong></span>`
    )
    .join("");
}

function bindEvents() {
  byId("articleSearch").addEventListener("input", event => {
    state.articleQuery = event.target.value;
    renderArticles();
  });
  byId("caseSearch").addEventListener("input", event => {
    state.caseQuery = event.target.value;
    state.page = 1;
    renderCases();
  });
  byId("yearFilter").addEventListener("change", event => {
    state.year = event.target.value;
    state.page = 1;
    renderCases();
  });
  byId("typeFilter").addEventListener("change", event => {
    state.type = event.target.value;
    state.page = 1;
    renderCases();
  });
  byId("topicFilter").addEventListener("change", event => {
    state.topic = event.target.value;
    state.page = 1;
    renderCases();
  });
  byId("resetFilters").addEventListener("click", () => {
    state.caseQuery = state.year = state.type = state.topic = "";
    state.page = 1;
    byId("caseSearch").value =
      byId("yearFilter").value =
      byId("typeFilter").value =
      byId("topicFilter").value =
        "";
    renderCases();
  });
  byId("prevPage").addEventListener("click", () => {
    state.page -= 1;
    renderCases();
    byId("practice").scrollIntoView();
  });
  byId("nextPage").addEventListener("click", () => {
    state.page += 1;
    renderCases();
    byId("practice").scrollIntoView();
  });
  byId("closeDialog").addEventListener("click", () =>
    byId("caseDialog").close()
  );
  byId("caseDialog").addEventListener("click", event => {
    if (event.target === byId("caseDialog")) byId("caseDialog").close();
  });
}

async function init() {
  byId("copyrightYear").textContent = new Date().getFullYear();
  try {
    const [articlesResponse, casesResponse, metadataResponse] =
      await Promise.all([
        fetch(`${DATA_PATH}/articles.json`),
        fetch(`${DATA_PATH}/cases.json`),
        fetch(`${DATA_PATH}/metadata.json`),
      ]);
    if (
      ![articlesResponse, casesResponse, metadataResponse].every(
        response => response.ok
      )
    )
      throw new Error("資料檔載入失敗");
    [state.articles, state.cases, state.metadata] = await Promise.all([
      articlesResponse.json(),
      casesResponse.json(),
      metadataResponse.json(),
    ]);
    populateMetrics();
    populateFilters();
    renderArticles();
    renderCases();
    renderCharts();
    bindEvents();
  } catch (error) {
    console.error(error);
    byId("articleList").innerHTML =
      '<p class="empty">靜態資料暫時無法載入，請稍後重試。</p>';
    byId("caseList").innerHTML =
      '<p class="empty">靜態資料暫時無法載入，請稍後重試。</p>';
    byId("caseResultCount").textContent = "資料載入失敗";
  }
}

init();
