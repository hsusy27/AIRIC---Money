/* =========================================================
   費用管理系統 — 共用邏輯
   資料儲存：LocalStorage（存在你目前使用的瀏覽器/電腦裡）
   備份方式：右下角「匯出備份 JSON」／「匯入備份 JSON」
   ========================================================= */

const STORAGE_KEY = 'expenseManagerData_v1';

/* 主任月費用 —— 固定的卡片／會計代號順序（依你的指示排列） */
const DIRECTOR_CATEGORIES = [
  { key: 'hospital_expense', label: '醫院費用', code: null, note: '不編列會計代號，由醫院行政經費支應' },
  { key: 'passthrough',      label: '非主任開銷，另外申請給中心的費用', code: null, note: '主任代為申請／代領，非個人墊付' },
  { key: 'code_113221T5',    label: '計畫費用', code: '113221T5' },
  { key: 'code_113221T3',    label: '計畫費用', code: '113221T3' },
  { key: 'code_11442501',    label: '計畫費用', code: '11442501' },
  { key: 'code_114221CM',    label: '計畫費用', code: '114221CM' },
  { key: 'code_114221EP',    label: '計畫費用', code: '114221EP' },
  { key: 'code_114221T5',    label: '計畫費用', code: '114221T5' },
  { key: 'code_114221T7',    label: '計畫費用', code: '114221T7' },
];

const FUND_SOURCES = [
  { key: 'hospital', label: '醫院' },
  { key: 'center',   label: '中心' },
  { key: 'school',   label: '學校' },
  { key: 'external', label: '外部' },
];

const MODULES = {
  director:  { label: '主任月費用', path: 'director.html' },
  hospital:  { label: '院內計畫',   path: 'hospital.html' },
  pettycash: { label: '中心零用金', path: 'pettycash.html' },
  teamdinner:{ label: '小組聚餐',   path: 'teamdinner.html' },
};

/* ---------------- 資料存取 ---------------- */
function loadData(){
  const raw = localStorage.getItem(STORAGE_KEY);
  if(raw){
    try{ return JSON.parse(raw); }catch(e){ console.warn('資料損毀，改用空白資料', e); }
  }
  return { modules: { director: {entries:[]}, hospital:{entries:[]}, pettycash:{entries:[]}, teamdinner:{entries:[]} } };
}
function saveData(data){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function ensureSeeded(){
  const data = loadData();
  const total = Object.values(data.modules).reduce((s,m)=>s+(m.entries?.length||0),0);
  if(total === 0 && window.SEED_DATA){
    saveData(window.SEED_DATA);
  }
}

function uid(){ return 'e' + Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-4); }

function addEntry(moduleKey, entry){
  const data = loadData();
  entry.id = uid();
  data.modules[moduleKey].entries.push(entry);
  saveData(data);
}
function updateEntry(moduleKey, id, patch){
  const data = loadData();
  const list = data.modules[moduleKey].entries;
  const idx = list.findIndex(e=>e.id===id);
  if(idx>-1) list[idx] = {...list[idx], ...patch};
  saveData(data);
}
function deleteEntry(moduleKey, id){
  const data = loadData();
  data.modules[moduleKey].entries = data.modules[moduleKey].entries.filter(e=>e.id!==id);
  saveData(data);
}
function getEntries(moduleKey){
  return loadData().modules[moduleKey]?.entries || [];
}

/* ---------------- 月份工具 ---------------- */
function allMonths(entries){
  const set = new Set(entries.map(e=>e.month));
  return Array.from(set).sort();
}
function monthLabel(m){
  if(!m) return '';
  const [y,mo] = m.split('-');
  return `${y}年${parseInt(mo,10)}月`;
}
function currentMonthStr(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function fmtMoney(n){
  n = Number(n)||0;
  return n===0 ? '—' : n.toLocaleString('zh-TW');
}

/* ---------------- 主任月費用：對帳計算 ---------------- */
// entry: {id, month, category, fundSource, item, subitem, expense, income, note,
//         directorAdvanced(bool), settled(bool), settledMonth}

function directorReconForMonth(month){
  const entries = getEntries('director');
  const rows = { owedNew:{}, passthrough:{}, settledThisMonth:{} };
  FUND_SOURCES.forEach(f=>{ rows.owedNew[f.key]=0; rows.passthrough[f.key]=0; rows.settledThisMonth[f.key]=0; });

  entries.forEach(e=>{
    const amt = Number(e.expense)||0;
    if(e.month === month){
      if(e.directorAdvanced){
        if(!e.settled) rows.owedNew[e.fundSource] = (rows.owedNew[e.fundSource]||0) + amt;
      } else {
        rows.passthrough[e.fundSource] = (rows.passthrough[e.fundSource]||0) + amt;
      }
    }
    // 沖帳：不論哪個月產生，只要「這個月」被標記已入帳，就算這個月的入帳金額
    if(e.directorAdvanced && e.settled && e.settledMonth === month){
      rows.settledThisMonth[e.fundSource] = (rows.settledThisMonth[e.fundSource]||0) + amt;
    }
  });
  return rows;
}

function directorOutstandingUpTo(month){
  // 累計至該月為止（含）尚未清償金額，依資金來源分組 + 明細
  const entries = getEntries('director').filter(e=> e.directorAdvanced && !e.settled && e.month <= month);
  const byFund = {}; FUND_SOURCES.forEach(f=>byFund[f.key]=0);
  entries.forEach(e=>{ byFund[e.fundSource] = (byFund[e.fundSource]||0) + (Number(e.expense)||0); });
  const total = Object.values(byFund).reduce((a,b)=>a+b,0);
  return { total, byFund, entries };
}

function directorAllOutstanding(){
  const entries = getEntries('director').filter(e=> e.directorAdvanced && !e.settled)
    .sort((a,b)=> a.month.localeCompare(b.month));
  const total = entries.reduce((s,e)=> s + (Number(e.expense)||0), 0);
  return { total, entries };
}

/* 簡易模組（院內計畫／中心零用金／小組聚餐）月結 */
function simpleModuleMonthSummary(moduleKey, month){
  const entries = getEntries(moduleKey).filter(e=>e.month===month);
  const income = entries.reduce((s,e)=>s+(Number(e.income)||0),0);
  const expense = entries.reduce((s,e)=>s+(Number(e.expense)||0),0);
  return { income, expense, balance: income-expense, entries };
}
function simpleModuleRunningBalance(moduleKey, uptoMonth){
  const entries = getEntries(moduleKey).filter(e=> !uptoMonth || e.month<=uptoMonth);
  const income = entries.reduce((s,e)=>s+(Number(e.income)||0),0);
  const expense = entries.reduce((s,e)=>s+(Number(e.expense)||0),0);
  return income-expense;
}

/* ---------------- 匯出 / 匯入 ---------------- */
function exportBackup(){
  const data = loadData();
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const d = new Date().toISOString().slice(0,10);
  a.href = url; a.download = `expense-backup-${d}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function importBackup(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const parsed = JSON.parse(reader.result);
      if(!parsed.modules) throw new Error('格式不正確');
      saveData(parsed);
      alert('匯入成功，頁面即將重新整理。');
      location.reload();
    }catch(e){
      alert('匯入失敗：檔案格式不正確。');
    }
  };
  reader.readAsText(file);
}

/* ---------------- 側邊導覽 render ---------------- */
function renderSidebar(activePage){
  const el = document.getElementById('sidebar');
  if(!el) return;
  el.innerHTML = `
    <div class="brand">
      <div class="mark"></div>
      <div class="name">費用管理</div>
      <div class="sub">Expense Ledger</div>
    </div>
    <div>
      <div class="nav-section-label">總覽</div>
      <div class="nav">
        <a href="index.html" class="${activePage==='index'?'active':''}"><span class="dot"></span>首頁總覽</a>
        <a href="ledger.html" class="${activePage==='ledger'?'active':''}"><span class="dot"></span>歷年對帳</a>
      </div>
      <div class="nav-section-label">經費子項目</div>
      <div class="nav">
        <a href="director.html" class="${activePage==='director'?'active':''}"><span class="dot"></span>主任月費用</a>
        <a href="hospital.html" class="${activePage==='hospital'?'active':''}"><span class="dot"></span>院內計畫</a>
        <a href="pettycash.html" class="${activePage==='pettycash'?'active':''}"><span class="dot"></span>中心零用金</a>
        <a href="teamdinner.html" class="${activePage==='teamdinner'?'active':''}"><span class="dot"></span>小組聚餐</a>
      </div>
    </div>
    <div class="sidebar-footer">
      <button class="ghost-btn" id="btnExport">匯出備份 JSON</button>
      <button class="ghost-btn" id="btnImport">匯入備份 JSON</button>
      <input type="file" id="fileImport" accept="application/json" style="display:none">
    </div>
  `;
  document.getElementById('btnExport').onclick = exportBackup;
  document.getElementById('btnImport').onclick = ()=> document.getElementById('fileImport').click();
  document.getElementById('fileImport').onchange = (e)=>{ if(e.target.files[0]) importBackup(e.target.files[0]); };
}

/* ---------------- PDF 匯出（自動產生，不需手動列印設定） ---------------- */
function downloadPdf(elementId, filename){
  const el = document.getElementById(elementId);
  if(!el){ alert('找不到要匯出的內容'); return; }
  const opt = {
    margin: [10,10,10,10],
    filename: filename || 'report.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS:true, backgroundColor:'#ffffff' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all','css','legacy'] }
  };
  el.classList.add('pdf-render');
  html2pdf().set(opt).from(el).save().then(()=> el.classList.remove('pdf-render'));
}

/* ---------------- 通用月份下拉 ---------------- */
function buildMonthOptions(selectEl, months, selected){
  const list = months.length ? months : [currentMonthStr()];
  selectEl.innerHTML = list.map(m=>`<option value="${m}" ${m===selected?'selected':''}>${monthLabel(m)}</option>`).join('');
}
function nextMonthStr(m){
  const [y,mo] = m.split('-').map(Number);
  const d = new Date(y, mo-1+1, 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
