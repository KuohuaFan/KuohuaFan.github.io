const body = document.body;
const hero = document.getElementById('hero');
const chatLog = document.getElementById('chatLog');
const workflow = document.getElementById('workflow');
const input = document.getElementById('messageInput');
const toast = document.getElementById('toast');
const layers = {
  history: document.getElementById('historyLayer'),
  work: document.getElementById('workLayer'),
};
let toastTimer;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.hidden = false;
  toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
}

function setLayer(name, open) {
  Object.entries(layers).forEach(([key, layer]) => {
    layer.hidden = !(open && key === name);
  });
  body.classList.toggle('locked', open);
  if (open) layers[name].querySelector('.close-button')?.focus();
}

function usePrompt(text) {
  input.value = text;
  input.focus();
  setLayer('work', false);
}

document.getElementById('openHistory').addEventListener('click', () => setLayer('history', true));
document.getElementById('openWork').addEventListener('click', () => setLayer('work', true));
document.querySelectorAll('[data-close]').forEach((button) => {
  button.addEventListener('click', () => setLayer(button.dataset.close, false));
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setLayer('history', false);
});
document.querySelectorAll('[data-prompt]').forEach((button) => {
  button.addEventListener('click', () => usePrompt(button.dataset.prompt));
});

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((item) => item.classList.toggle('active', item === button));
    const filter = button.dataset.filter;
    document.querySelectorAll('.history-row').forEach((row) => {
      row.hidden = filter !== 'all' && row.dataset.kind !== filter;
    });
  });
});

document.getElementById('composer').addEventListener('submit', (event) => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  hero.hidden = true;
  chatLog.insertAdjacentHTML('beforeend', `
    <article class="message user-message">
      <div class="speaker"><span class="user-avatar">您</span><strong>您</strong></div>
      <p>${value.replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))}</p>
    </article>
    <article class="message assistant-message">
      <div class="speaker"><span class="assistant-avatar">✦</span><strong>PiSuAI</strong></div>
      <p><strong>這是靜態展示回應。</strong>正式版會先核對資料完整度，再建立可追溯工作；本頁不會呼叫 AI、保存案件或產生正式文件。</p>
    </article>`);
  workflow.hidden = false;
  input.value = '';
  workflow.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.getElementById('attachDemo').addEventListener('click', () => showToast('Demo 不會上傳檔案；正式 Co-USE 才會解析並保存附件。'));
document.getElementById('newConversation').addEventListener('click', () => {
  setLayer('history', false);
  hero.hidden = false;
  workflow.hidden = true;
  input.value = '';
  showToast('已重設本機展示畫面；沒有建立或刪除任何雲端資料。');
});
document.getElementById('searchConversation').addEventListener('click', () => showToast('搜尋為介面展示；GitHub Pages 沒有連接對話資料庫。'));
document.getElementById('accountInfo').addEventListener('click', () => showToast('訪客展示模式不登入，也不保存個人資料。'));
document.querySelectorAll('.history-row').forEach((row) => row.addEventListener('click', () => {
  setLayer('history', false);
  hero.hidden = true;
  workflow.hidden = false;
  showToast('已開啟展示內容；這不是正式案件紀錄。');
}));
