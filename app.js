/* Burhan v2 — built 2026-10-13 19:41 */
(function () {
"use strict";
/* =========================================================
   Burhan v2 — a general, multi-project platform for Lesson Study.
   Lesson Study is the backbone; SOLO, the AI assistant and the
   research space are optional modules each project switches on.
   ========================================================= */
const B = window.BURHAN; const db = B.db; const ME = B.user;

/* ---------- small helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const pad = (n, w) => String(n).padStart(w, '0');
const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2); };
const nowIso = () => new Date().toISOString();
const nid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const fmtDate = s => { if (!s) return '—'; try { return new Date(String(s).length <= 10 ? s + 'T12:00:00' : s).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', {day: 'numeric', month: 'short', year: 'numeric'}); } catch (e) { return s; } };
const byNew = (a, b) => String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || ''));
const byOld = (a, b) => -byNew(a, b);
const uniq = a => [...new Set(a)];
const lines = s => String(s || '').split(/\n|،|,/).map(x => x.trim()).filter(Boolean);
const store = {
  get(k, d) { try { const v = localStorage.getItem('burhan2.' + k); return v ? JSON.parse(v) : d; } catch (x) { return d; } },
  set(k, v) { try { localStorage.setItem('burhan2.' + k, JSON.stringify(v)); } catch (x) {} }
};
function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 4200); }
function opts(list, sel, blank) { return (blank !== undefined ? `<option value="">${esc(blank)}</option>` : '') + list.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${String(v) === String(sel ?? '') ? ' selected' : ''}>${esc(l)}</option>`; }).join(''); }
const field = (label, inner, hint) => `<label class="f"><span>${esc(label)}</span>${hint ? `<span class="hint">${esc(hint)}</span>` : ''}${inner}</label>`;
const inp = (name, val, attrs = '') => `<input name="${name}" value="${esc(val ?? '')}" ${attrs}>`;
const area = (name, val, attrs = '') => `<textarea name="${name}" ${attrs}>${esc(val ?? '')}</textarea>`;
const sel = (name, list, val, blank, attrs = '') => `<select name="${name}" ${attrs}>${opts(list, val, blank)}</select>`;
const checks = (name, list, chosen) => { const s = new Set(chosen || []); return `<div class="checks">${list.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<label><input type="checkbox" name="${name}" value="${esc(v)}"${s.has(v) ? ' checked' : ''}>${esc(l)}</label>`; }).join('')}</div>`; };
const help = (t, body) => `<details class="help"><summary>${esc(t)}</summary>${body}</details>`;
const empty = t => `<div class="empty">${t}</div>`;
const pill = (t, k) => `<span class="pill ${k || ''}">${esc(t)}</span>`;
function formData(f) { const o = {}; $$('input,select,textarea', f).forEach(el => { if (!el.name || el.type === 'submit' || el.type === 'button') return; if (el.type === 'checkbox') { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); } else if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; } else o[el.name] = typeof el.value === 'string' ? el.value.trim() : el.value; }); return o; }
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const sd = a => { if (a.length < 2) return null; const m = avg(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) * (x - m), 0) / (a.length - 1)); };
const f2 = v => v == null || isNaN(v) ? '—' : (Math.round(v * 100) / 100).toString();

/* ---------- vocabulary ---------- */
const ROLES = [['leader', 'قائد الفريق'], ['facilitator', 'الميسّر'], ['teacher', 'المعلم المنفّذ'], ['content', 'خبير المحتوى'], ['observer', 'الملاحِظ'], ['reviewer', 'المراجع'], ['researcher', 'الباحث']];
const ROLE = Object.fromEntries(ROLES);
const MANAGER_ROLES = ['leader', 'facilitator'];
const STAGES = ['رياض الأطفال', 'الابتدائية', 'المتوسطة', 'الثانوية', 'الجامعية', 'التدريب المهني', 'أخرى'];
const SUBJECT_HINTS = ['الرياضيات', 'العلوم', 'الكيمياء', 'الفيزياء', 'الأحياء', 'التقنية الرقمية', 'الحاسب', 'اللغة العربية', 'اللغة الإنجليزية', 'الدراسات الإسلامية', 'الدراسات الاجتماعية', 'الكفايات اللغوية', 'التفكير الناقد', 'المهارات الحياتية', 'التربية الفنية', 'التربية البدنية'];
const MODULES = [
  ['solo', 'تصنيف SOLO', 'تصميم المهام والأسئلة وتحليل استجابات المتعلمين وفق مستويات SOLO.'],
  ['ai', 'مساعد الذكاء الاصطناعي', 'اقتراحات للمهام والأسئلة وبدائل التدريس وفحص اتساق الخطة. كل مقترح يراجعه الفريق قبل اعتماده.'],
  ['research', 'البحث الأكاديمي', 'مساحة باحث مستقلة: منهج الدراسة والمجموعات والقياسات والموافقات. لا تظهر لبقية الفريق.'],
  ['customObs', 'أدوات ملاحظة مخصصة', 'حقول إضافية في بطاقة الملاحظة يحددها الفريق لمادته.'],
  ['pd', 'تقارير التطوير المهني', 'سجل مشاركة كل عضو في الاجتماعات والدروس والملاحظات، لتوثيق التطوير المهني.']];
const MODULE = Object.fromEntries(MODULES.map(m => [m[0], m[1]]));
const DEFAULT_INDICATORS = ['التفسير المفاهيمي', 'الاستدلال', 'المشاركة في النقاش', 'بناء الحجة', 'حل المشكلات', 'الكتابة', 'العمل العملي', 'التعاون'];
const DECISION_STATUS = [['proposed', 'مقترح'], ['approved', 'معتمد'], ['done', 'نُفّذ']];
const SOLO = [['0', 'ما قبل البنية', 'لا فكرة صحيحة، أو إجابة لا علاقة لها بالسؤال'], ['1', 'أحادي البنية', 'فكرة واحدة صحيحة دون ربط'], ['2', 'متعدد البنية', 'عدة أفكار صحيحة لكنها متفرقة'], ['3', 'علائقي', 'يربط الأفكار في تفسير متماسك يجيب عن «لماذا»'], ['4', 'تجريدي ممتد', 'يعمّم الفكرة أو ينقلها إلى موقف جديد لم يُشرح']];
const soloName = l => l === '' || l == null ? '—' : (SOLO[Number(l)] ? SOLO[Number(l)][0] + ' · ' + SOLO[Number(l)][1] : '—');

/* The general Lesson Study cycle. Each step says what it is for, where it happens, and when it counts as done. */
const STEPS = [
  {k: 'goal', n: 'تحديد الهدف البعيد', d: 'ما الذي نريد أن يصبح عليه المتعلمون على المدى البعيد؟ الأفكار الكبرى وعادات التفكير ومؤشرات النجاح.', go: 'settings', done: (P, c) => !!(P.goals && P.goals.longTerm)},
  {k: 'problem', n: 'دراسة مشكلة التعلم', d: 'ما الذي يتعثر فيه المتعلمون، وما الدليل؟ من هم المتعلمون المستهدفون؟', go: 'settings', done: (P, c) => !!(P.problem && P.problem.statement)},
  {k: 'content', n: 'دراسة المحتوى', d: 'دراسة الموضوع في المنهج: المفاهيم، والمتطلبات السابقة، والأخطاء الشائعة، وكيف تتدرج الفكرة.', go: 'schedule', done: (P, c) => !!(c && c.contentStudy)},
  {k: 'plan', n: 'التخطيط التشاركي', d: 'الفريق يصمّم الدرس البحثي معًا: المهام والأسئلة والاستجابات المتوقعة وأدلة التعلم.', go: 'lessons', done: (P, c) => inCycle(D.lessons, c).some(l => (l.version || 1) === 1)},
  {k: 'teach', n: 'تنفيذ الدرس وملاحظته', d: 'معلم ينفّذ، والبقية يلاحظون تعلّم المتعلمين: ما رأوه بالضبط، منفصلًا عن تفسيرهم.', go: 'obs', done: (P, c) => inCycle(D.observations, c).some(o => (o.lessonVersion || 1) === 1)},
  {k: 'discuss', n: 'مناقشة أدلة التعلم', d: 'اجتماع يقرأ الأدلة ويستخلص الأنماط، ويخرج بقرارات تحسين مربوطة بالدليل.', go: 'improve', done: (P, c) => inCycle(D.decisions, c).length > 0},
  {k: 'revise', n: 'مراجعة التصميم', d: 'نسخة جديدة من الدرس تُكتب فيها التعديلات وسببها، مربوطة بقرار التحسين.', go: 'lessons', done: (P, c) => inCycle(D.lessons, c).some(l => (l.version || 1) >= 2)},
  {k: 'reteach', n: 'إعادة التدريس عند الحاجة', d: 'تدريس النسخة المعدّلة وملاحظتها بالطريقة نفسها. يمكن تخطيها إن قرر الفريق ذلك.', go: 'obs', optional: true, done: (P, c) => !!(c && c.skipReteach) || inCycle(D.observations, c).some(o => (o.lessonVersion || 1) >= 2)},
  {k: 'reflect', n: 'التأمل والتوثيق', d: 'كل عضو يكتب ما تعلّمه، ويصدر تقرير الدورة.', go: 'improve', done: (P, c) => inCycle(D.reflections, c).length > 0}];

/* ---------- state ---------- */
const S = {view: store.get('view', 'dash'), pid: store.get('pid', ''), projects: [], invited: [], P: null, cycleId: store.get('cycle', ''), dirty: false, wiz: null, tab: {}, filters: {}, ready: false, invRoles: {}};
const COLLS = ['members', 'invites', 'cycles', 'lessons', 'observations', 'meetings', 'decisions', 'reflections', 'ai', 'research'];
const D = {}; COLLS.forEach(c => { D[c] = []; });
let unsubProject = [];
const inCycle = (arr, c) => c ? arr.filter(r => r.cycleId === c.id) : [];
const mod = k => !!(S.P && S.P.modules && S.P.modules[k]);
const isManager = () => !!(S.P && (S.P.managerUids || []).includes(ME.uid));
const isResearcher = () => !!(S.P && (S.P.researcherUids || []).includes(ME.uid));
const meMember = () => D.members.find(m => m.id === ME.uid);
const memberName = uid => { const m = D.members.find(x => x.id === uid); return m ? (m.name || m.email) : (uid === ME.uid ? (ME.name || ME.email) : '—'); };
const curCycle = () => D.cycles.find(c => c.id === S.cycleId) || D.cycles.slice().sort((a, b) => (a.n || 0) - (b.n || 0)).find(c => c.status !== 'closed') || D.cycles[0] || null;
const cycleLabel = c => c ? `الدورة ${c.n || ''}${c.title ? ' · ' + c.title : ''}` : '—';
const projSubjects = () => (S.P && S.P.subjects) || [];
const stepState = c => STEPS.map(s => ({s, ok: !!(S.P && s.done(S.P, c))}));
const nextStep = c => { const st = stepState(c); return st.find(x => !x.ok) || null; };

/* ---------- data access ---------- */
const pref = (pid = S.pid) => db.collection('projects').doc(pid);
const coll = c => pref().collection(c);
function dbErr(x) {
  const c = x && x.code;
  if (c === 'permission-denied') toast('ليست لديك صلاحية لهذا الإجراء في هذا المشروع.');
  else toast('تعذّر الحفظ مؤقتًا. حاول مرة أخرى.');
  console.warn(x);
}
async function addDoc(c, data, id) {
  id = id || nid(c.slice(0, 2));
  try { await coll(c).doc(id).set(Object.assign({createdBy: ME.uid, createdAt: nowIso()}, data)); return id; }
  catch (x) { dbErr(x); return null; }
}
async function updDoc(c, id, data) { try { await coll(c).doc(id).set(Object.assign({updatedAt: nowIso(), updatedBy: ME.uid}, data), {merge: true}); return true; } catch (x) { dbErr(x); return false; } }
async function delDoc(c, id) { try { await coll(c).doc(id).delete(); return true; } catch (x) { dbErr(x); return false; } }
async function updProject(data, pid = S.pid) { try { await pref(pid).set(Object.assign({updatedAt: nowIso()}, data), {merge: true}); return true; } catch (x) { dbErr(x); return false; } }
const snapList = snap => snap.docs.map(d => Object.assign({id: d.id}, d.data()));

function watchProjects() {
  db.collection('projects').where('memberUids', 'array-contains', ME.uid).onSnapshot(s => {
    S.projects = snapList(s).sort(byNew);
    if (!S.pid || !S.projects.some(p => p.id === S.pid)) { if (!S.creating) selectProject(S.projects[0] ? S.projects[0].id : ''); return; }
    S.P = S.projects.find(p => p.id === S.pid);
    if (S.subKey !== subKeyOf(S.P)) selectProject(S.pid); else schedule();
  }, x => console.warn(x));
  db.collection('projects').where('invitedEmails', 'array-contains', ME.email).onSnapshot(s => { S.invited = snapList(s); schedule(); }, x => console.warn(x));
}
const subKeyOf = P => P ? [P.id, (P.managerUids || []).includes(ME.uid), (P.researcherUids || []).includes(ME.uid)].join('|') : '';
function selectProject(pid) {
  unsubProject.forEach(u => { try { u(); } catch (x) {} }); unsubProject = [];
  COLLS.forEach(c => { D[c] = []; }); S.loaded = {};
  S.pid = pid; store.set('pid', pid); S.P = S.projects.find(p => p.id === pid) || null; S.subKey = subKeyOf(S.P);
  if (!pid) { schedule(); return; }
  const P = S.P || {};
  COLLS.forEach(c => {
    if (c === 'research' && !(P.researcherUids || []).includes(ME.uid)) return;
    if (c === 'invites' && !(P.managerUids || []).includes(ME.uid)) return;
    unsubProject.push(coll(c).onSnapshot(s => { D[c] = snapList(s); S.loaded[c] = true; schedule(); }, x => console.warn(c, x)));
  });
  schedule();
}
let rq = 0;
function schedule() { if (rq) return; rq = requestAnimationFrame(() => { rq = 0; if (S.dirty) { $('#view').dataset.stale = '1'; renderNav(); return; } render(); }); }

/* ---------- icons and navigation ---------- */
const ICONS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>', folder: '<path d="M3 7h6l2 2h10v10H3z"/>', users: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c0-3 2.5-5 5-5s5 2 5 5M11 19c0-3 2.5-5 5-5s5 2 5 5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>', book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', refl: '<path d="M4 4h16v12H8l-4 4z"/>', chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  solo: '<path d="M4 20h16M6 16v-3M10 16V9M14 16v-5M18 16V5"/>', ai: '<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>', lab: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.6h5l.3-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z"/>',
  lib: '<path d="M4 4h4v16H4zM10 4h4v16h-4zM16 5l3.5-1 2.5 15-3.5 1z"/>'};
const icon = k => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ''}</svg>`;
function navItems() {
  const g = [['المنصة', [['dash', 'لوحة التحكم', 'home'], ['projects', 'مشاريعي', 'folder']]]];
  if (S.P) {
    g.push(['المشروع', [['team', 'الفرق', 'users'], ['schedule', 'الجدول التنفيذي', 'calendar'], ['lessons', 'الدروس البحثية', 'book'], ['obs', 'الملاحظة والأدلة', 'eye'], ['improve', 'التحسين والتأمل', 'refl'], ['reports', 'التقارير والتحليلات', 'chart']]]);
    const m = [];
    if (mod('solo')) m.push(['solo', 'تصنيف SOLO', 'solo']);
    if (mod('ai')) m.push(['ai', 'مساعد الذكاء الاصطناعي', 'ai']);
    if (mod('research') && isResearcher()) m.push(['research', 'مساحة الباحث', 'lab']);
    if (m.length) g.push(['الوحدات المفعّلة', m]);
    g.push(['الإدارة', [['frameworks', 'مكتبة الأطر', 'lib']].concat(isManager() ? [['settings', 'إعدادات المشروع', 'gear']] : [])]);
  } else g[0][1].push(['frameworks', 'مكتبة الأطر', 'lib']);
  return g;
}
function renderNav() {
  const items = navItems(); const keys = items.flatMap(g => g[1].map(i => i[0]));
  if (!keys.includes(S.view)) S.view = 'dash';
  $('#nav').innerHTML = items.map(([g, list]) => `<div class="navgroup">${esc(g)}</div>` + list.map(([k, l, ic]) => `<button class="nav" data-act="go" data-v="${k}"${k === S.view ? ' aria-current="page"' : ''}>${icon(ic)}<span>${esc(l)}</span></button>`).join('')).join('');
  $('#projbox').innerHTML = S.projects.length ? `المشروع الحالي<select id="projSel" aria-label="المشروع الحالي">${opts(S.projects.map(p => [p.id, p.name]), S.pid)}</select>` : 'لا مشاريع بعد';
  const m = meMember();
  $('#who').innerHTML = `<b>${esc(ME.name || (m && m.name) || ME.email)}</b><br>${S.P ? esc((m && (m.roles || []).map(r => ROLE[r]).join('، ')) || '') : ''}<br><button data-act="signout">تسجيل الخروج</button>`;
  const qb = [['dash', 'الرئيسة', 'home'], ['obs', 'ملاحظة', 'eye'], ['lessons', 'الدروس', 'book'], ['improve', 'التحسين', 'refl']].filter(x => keys.includes(x[0]));
  $('#qbar').innerHTML = qb.map(([k, l, ic]) => `<button type="button" data-act="go" data-v="${k}"${k === S.view ? ' aria-current="page"' : ''}>${icon(ic)}<span>${l}</span></button>`).join('') + `<button type="button" data-act="menu">${icon('folder')}<span>المزيد</span></button>`;
}
const V = {};
function render() {
  renderNav();
  const v = $('#view'); delete v.dataset.stale;
  try { v.innerHTML = (V[S.view] || V.dash)(); } catch (x) { console.error(x); v.innerHTML = empty('حدث خطأ في عرض هذه الصفحة: ' + esc(x.message)); }
  S.dirty = false;
  if (typeof afterRender === 'function') afterRender();
}
function go(v) { S.view = v; store.set('view', v); S.dirty = false; S.editRec = null; S.lessonEdit = null; S.compare = null; render(); window.scrollTo(0, 0); const r = $('.rail'); if (r) r.classList.remove('open'); }
const needProject = () => S.P ? '' : `<section class="panel">${empty('اختر مشروعًا أو أنشئ مشروعًا جديدًا أولًا. <button class="btn small" data-act="go" data-v="projects">مشاريعي</button>')}</section>`;
const head = (t, lede) => `<div><h1>${esc(t)}</h1>${lede ? `<p class="lede">${lede}</p>` : ''}</div>`;
const tabs = (key, list) => { const cur = S.tab[key] || list[0][0]; return `<div class="tabs" role="tablist">${list.map(([k, l]) => `<button class="tab" role="tab" aria-selected="${k === cur}" data-act="tab" data-k="${key}" data-v="${k}">${esc(l)}</button>`).join('')}</div>`; };
const curTab = (key, def) => S.tab[key] || def;
const cycleSelect = (name = 'cycleId', val) => sel(name, D.cycles.slice().sort((a, b) => (a.n || 0) - (b.n || 0)).map(c => [c.id, cycleLabel(c)]), val || (curCycle() || {}).id, D.cycles.length ? undefined : 'لا دورات بعد');

/* ---------- event plumbing: views register handlers ---------- */
const ACT = {}; const FORM = {};
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act;
  if (a === 'go') { go(b.dataset.v); return; }
  if (a === 'tab') { S.tab[b.dataset.k] = b.dataset.v; S.editRec = null; render(); return; }
  if (a === 'menu') { const r = $('.rail'); r.classList.toggle('open'); window.scrollTo(0, 0); return; }
  if (a === 'signout') { B.auth.signOut(); return; }
  if (ACT[a]) { e.preventDefault(); try { await ACT[a](b, e); } catch (x) { console.error(x); toast('تعذّر تنفيذ الإجراء.'); } }
});
document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-form]'); if (!f || !FORM[f.dataset.form]) return; e.preventDefault();
  const btn = f.querySelector('button[type=submit]'); if (btn) btn.disabled = true;
  try { const ok = await FORM[f.dataset.form](formData(f), f); if (ok !== false) { S.dirty = false; render(); } }
  catch (x) { console.error(x); toast('تعذّر الحفظ.'); }
  finally { if (btn && document.body.contains(btn)) btn.disabled = false; }
});
document.addEventListener('input', e => { if (e.target.closest('form')) S.dirty = true; });
document.addEventListener('change', e => {
  if (e.target.id === 'projSel') { selectProject(e.target.value); S.view = 'dash'; render(); return; }
  if (e.target.closest('form')) S.dirty = true;
  const h = e.target.dataset && e.target.dataset.change; if (h && ACT[h]) ACT[h](e.target, e);
});
/* while someone is typing, team updates wait; they appear after saving or on the next page change */

/* ---------- editing and deleting saved records ---------- */
const editing = c => S.editRec && S.editRec.c === c ? (D[c].find(x => x.id === S.editRec.id) || null) : null;
const canEditRec = (c, r) => !!r && (isManager() || (r.createdBy === ME.uid && !(c === 'decisions' && r.status && r.status !== 'proposed')));
const recTools = (c, r) => canEditRec(c, r) ? `<span class="row" style="margin-inline-start:auto"><button type="button" class="btn ghost small" data-act="editrec" data-c="${c}" data-id="${esc(r.id)}">تعديل</button><button type="button" class="btn ghost small" data-act="delrec" data-c="${c}" data-id="${esc(r.id)}">حذف</button></span>` : '';
const editBanner = (what, r) => `<div class="note">أنتِ تعدّلين ${esc(what)} المحفوظ (${esc(fmtDate(r.createdAt))}). اضغطي «حفظ التعديل» عند الانتهاء.</div>`;
async function saveEdit(data) {
  const E = S.editRec; if (!E) return false;
  let ok = true; try { await coll(E.c).doc(E.id).update(Object.assign({updatedAt: nowIso(), updatedBy: ME.uid}, data)); } catch (x) { dbErr(x); ok = false; } if (!ok) return false;
  S.editRec = null; toast('حُفظ التعديل.'); return true;
}
ACT.editrec = b => { S.editRec = {c: b.dataset.c, id: b.dataset.id}; if (b.dataset.c === 'ai') S.aiDraft = null; S.dirty = false; render(); window.scrollTo(0, 0); };
ACT.canceledit = () => { S.editRec = null; S.dirty = false; render(); };
ACT.delrec = async b => {
  if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'اضغطي مرة أخرى للحذف'; setTimeout(() => { if (document.body.contains(b)) { b.dataset.sure = ''; b.textContent = 'حذف'; } }, 4000); return; }
  if (await delDoc(b.dataset.c, b.dataset.id)) { if (S.editRec && S.editRec.id === b.dataset.id) S.editRec = null; toast('حُذف.'); }
};

/* =========================================================
   Dashboard, projects and the 7-step project wizard
   ========================================================= */
function stepChips(c) {
  const st = stepState(c); const nx = st.findIndex(x => !x.ok);
  return `<div class="steps" aria-label="خطوات الدورة">${st.map((x, i) => `<span class="step ${x.ok ? 'done' : (i === nx ? 'now' : '')}" title="${esc(x.s.d)}"><i>${i + 1}</i>${esc(x.s.n)}${x.s.optional ? ' (اختياري)' : ''}</span>`).join('')}</div>`;
}
function nextStepCard(c) {
  if (!c) return `<div class="note">لا توجد دورة بحث درس بعد. ${isManager() ? '<button class="btn small" data-act="go" data-v="schedule">أنشئ الدورة الأولى</button>' : 'ستظهر هنا عندما ينشئها قائد الفريق.'}</div>`;
  const nx = nextStep(c);
  if (!nx) return `<div class="ok">اكتملت خطوات ${esc(cycleLabel(c))}. أصدر تقرير الدورة من «التقارير والتحليلات».</div>`;
  return `<div class="mini"><b>الخطوة التالية: ${esc(nx.s.n)}</b><span class="small">${esc(nx.s.d)}</span><div><button class="btn small" data-act="go" data-v="${nx.s.go}">انتقل إليها</button></div></div>`;
}
V.dash = () => {
  const inv = S.invited.filter(p => !store.get('hideInv', []).includes(p.id));
  const invHtml = inv.length ? `<section class="panel hero"><h2>دعوات للانضمام</h2><div class="ledger">${inv.map(p => { const r = S.invRoles[p.id]; return `<div class="rec"><div class="row between"><b>${esc(p.name)}</b><span class="small muted">${esc(p.org || '')} · ${esc(p.stage || '')} · ${esc((p.subjects || []).join('، '))}</span></div><div class="meta">الأدوار المقترحة لك: ${r ? esc(r.map(x => ROLE[x] || x).join('، ')) : '…'}</div><div class="row"><button class="btn small" data-act="accept" data-id="${esc(p.id)}">قبول الانضمام</button><button class="btn ghost small" data-act="hideinv" data-id="${esc(p.id)}">ليس الآن</button></div></div>`; }).join('')}</div></section>` : '';
  if (!S.projects.length) return `${head('أهلًا بك في بُرهان', 'منصة لإدارة بحث الدرس والتطوير المهني التشاركي وتحليل أدلة التعلم، لأي مادة ولأي مرحلة ولأي فريق.')}
    ${invHtml}
    <section class="panel hero"><h2>ابدأ مشروعك الأول</h2><p>مشروع بحث الدرس يجمع فريقك وهدفه البعيد ومشكلة التعلم ودوراته. تختار في المعالج الوحدات الاختيارية التي تحتاجها فقط.</p>
    <div class="row"><button class="btn bigbtn" data-act="newproject">مشروع جديد</button><button class="btn ghost" data-act="demos">جرّب المنصة بثلاثة مشاريع تجريبية</button></div></section>
    ${howItWorks()}`;
  if (!S.P) return `${head('لوحة التحكم')}${invHtml}${empty('اختر مشروعًا من القائمة.')}`;
  const P = S.P; const broken = P.createdBy === ME.uid && S.loaded && S.loaded.members && !D.members.length;
  if (broken) return `${head(P.name)}<section class="panel"><div class="note">هذا المشروع لم يكتمل إنشاؤه: حُفظ اسمه فقط، غالبًا لأن قواعد الأمان الجديدة لم تكن منشورة في Firebase وقت إنشائه.</div><div class="row"><button class="btn" data-act="repairproj">إكمال إنشاء المشروع</button><button class="btn ghost" data-act="delproj" data-id="${esc(P.id)}">حذف المشروع</button></div></section>`;
  const c = curCycle(); const pend = D.decisions.filter(d => (d.status || 'proposed') === 'proposed');
  return `${head(P.name, `${esc(P.org || '')}${P.org ? ' · ' : ''}${esc(P.stage || '')} · ${esc((P.subjects || []).join('، ') || 'بلا مادة محددة')}${P.grade ? ' · ' + esc(P.grade) : ''}`)}
  ${invHtml}
  <section class="panel hero"><div class="row between"><span class="kicker">${esc(cycleLabel(c))}</span><button class="btn ghost small" data-act="go" data-v="schedule">الجدول التنفيذي</button></div>${c ? stepChips(c) : ''}${nextStepCard(c)}</section>
  <section class="panel"><h2>المشروع بالأرقام</h2><div class="kpis">
    <div class="kpi"><b>${D.members.length}</b><span>عضوًا في الفريق</span></div><div class="kpi"><b>${D.cycles.length}</b><span>دورة بحث درس</span></div>
    <div class="kpi"><b>${D.lessons.length}</b><span>نسخة درس</span></div><div class="kpi"><b>${D.observations.length}</b><span>دليل ملاحظة</span></div>
    <div class="kpi"><b>${D.decisions.length}</b><span>قرار تحسين</span></div><div class="kpi"><b>${D.reflections.length}</b><span>تأمل</span></div></div>
    <div class="row">${MODULES.filter(m => mod(m[0])).map(m => pill(m[1], 'good')).join(' ') || '<span class="small muted">لا وحدات اختيارية مفعّلة: المشروع يعمل ببحث الدرس وحده.</span>'}</div></section>
  ${isManager() && pend.length ? `<section class="panel"><h2>قرارات بانتظار الاعتماد (${pend.length})</h2><div class="ledger">${pend.slice(0, 5).map(d => `<div class="rec"><div class="body">${esc(d.decision)}</div><div class="meta">${esc(cycleLabel(D.cycles.find(x => x.id === d.cycleId)))} · ${esc(memberName(d.createdBy))}</div></div>`).join('')}</div><div><button class="btn small" data-act="go" data-v="improve">راجعها واعتمدها</button></div></section>` : ''}
  <section class="panel"><h2>سجّل بسرعة</h2><div class="grid">
    <button class="action" data-act="go" data-v="obs"><b>${icon('eye')}ملاحظة دليل تعلّم</b><span>ما رأيته بالضبط، منفصلًا عن تفسيرك.</span></button>
    <button class="action" data-act="go" data-v="lessons"><b>${icon('book')}خطة الدرس البحثي</b><span>نسخة أولى، أو نسخة معدّلة بقرار.</span></button>
    <button class="action" data-act="go" data-v="improve"><b>${icon('refl')}اجتماع أو قرار أو تأمل</b><span>من الدليل إلى قرار التحسين.</span></button></div></section>`;
};
function howItWorks() {
  return `<section class="panel"><h2>كيف تعمل المنصة؟</h2><p class="small muted">كل مشروع يسير في دورة بحث درس عامة، ويمكن أن تتكرر الدورة أكثر من مرة:</p>
  <ol style="margin:0;padding-inline-start:22px">${STEPS.map(s => `<li><b>${esc(s.n)}:</b> <span class="small">${esc(s.d)}</span></li>`).join('')}</ol>
  <p class="small muted">وتصنيف SOLO ومساعد الذكاء الاصطناعي ومساحة الباحث وحدات اختيارية، يعمل المشروع كاملًا بدونها.</p></section>`;
}
ACT.hideinv = b => { store.set('hideInv', uniq(store.get('hideInv', []).concat(b.dataset.id))); render(); };
ACT.accept = async b => {
  const p = S.invited.find(x => x.id === b.dataset.id); if (!p) return; b.disabled = true;
  try {
    const invRef = db.collection('projects').doc(p.id).collection('invites').doc(ME.email);
    const inv = await invRef.get(); const roles = inv.exists ? (inv.data().roles || ['teacher']) : ['teacher'];
    const school = inv.exists ? (inv.data().school || '') : '';
    await db.collection('projects').doc(p.id).collection('members').doc(ME.uid).set({uid: ME.uid, email: ME.email, name: ME.name || (inv.exists && inv.data().name) || ME.email, roles, school, joinedAt: nowIso()});
    const up = {memberUids: uniq((p.memberUids || []).concat(ME.uid)), invitedEmails: (p.invitedEmails || []).filter(e => e !== ME.email), managerUids: p.managerUids || [], researcherUids: p.researcherUids || []};
    if (roles.some(r => MANAGER_ROLES.includes(r))) up.managerUids = uniq(up.managerUids.concat(ME.uid));
    if (roles.includes('researcher')) up.researcherUids = uniq(up.researcherUids.concat(ME.uid));
    await db.collection('projects').doc(p.id).set(up, {merge: true});
    toast('انضممت إلى «' + p.name + '».'); selectProject(p.id);
  } catch (x) { dbErr(x); b.disabled = false; }
};

/* ---------- projects ---------- */
V.projects = () => {
  if (S.wiz) return wizardView();
  return `${head('مشاريعي', 'كل مشروع مساحة عمل مستقلة: فريقه ودوراته ودروسه وأدلته ووحداته الاختيارية. يمكنك أن تكون عضوًا في أكثر من مشروع بأدوار مختلفة.')}
  <div class="row"><button class="btn" data-act="newproject">مشروع جديد</button><button class="btn ghost" data-act="demos">إنشاء ثلاثة مشاريع تجريبية</button></div>
  <section class="panel"><div class="ledger">${S.projects.map(p => { const mine = p.id === S.pid ? meMember() : null; return `<div class="rec${p.id === S.pid ? ' mine' : ''}"><div class="row between"><b style="font-size:17px">${esc(p.name)}</b><span class="row">${p.id === S.pid ? pill('المشروع الحالي', 'good') : `<button class="btn small" data-act="openproj" data-id="${esc(p.id)}">فتح</button>`}${p.createdBy === ME.uid ? `<button class="btn ghost small" data-act="delproj" data-id="${esc(p.id)}">حذف</button>` : ''}</span></div>
    <div class="meta"><span>${esc(p.org || '—')}</span><span>${esc(p.stage || '')}</span><span>${esc((p.subjects || []).join('، '))}</span><span>${(p.memberUids || []).length} عضو</span>${(p.managerUids || []).includes(ME.uid) ? pill('إدارة') : ''}</div>
    <div class="row">${MODULES.filter(m => p.modules && p.modules[m[0]]).map(m => pill(m[1])).join(' ')}</div>${mine ? '' : ''}</div>`; }).join('') || empty('لا مشاريع بعد.')}</div></section>`;
};
ACT.openproj = b => { selectProject(b.dataset.id); go('dash'); };
ACT.newproject = () => { S.wiz = store.get('wizDraft', null) || {step: 0, data: {myRoles: ['leader'], team: [], modules: [], subjects: []}}; S.view = 'projects'; store.set('view', 'projects'); render(); };

const WIZ = ['البيانات العامة', 'الفريق', 'الهدف البعيد', 'مشكلة التعلم', 'التخطيط الزمني', 'الوحدات الاختيارية', 'مراجعة واعتماد'];
function wizardView() {
  const w = S.wiz; const d = w.data; const i = w.step;
  const bar = `<div class="wiz">${WIZ.map((t, k) => `<span class="${k === i ? 'on' : (k < i ? 'done' : '')}">${k + 1}. ${esc(t)}</span>`).join('')}</div>`;
  let body = '';
  if (i === 0) body = `<div class="grid wide">${field('اسم المشروع', inp('name', d.name, 'required placeholder="مثال: تعميق الفهم في الصف الأول الثانوي"'))}${field('المؤسسة التعليمية', inp('org', d.org, 'placeholder="اسم المدرسة أو الجهة"'))}</div>
    <div class="grid">${field('المرحلة', sel('stage', STAGES, d.stage || 'الثانوية'))}${field('الصف', inp('grade', d.grade, 'placeholder="مثال: الأول الثانوي"'))}${field('العام الدراسي', inp('year', d.year, 'placeholder="1448هـ"'))}${field('مدة المشروع', inp('duration', d.duration, 'placeholder="مثال: فصل دراسي"'))}</div>
    <div><div class="hint" style="margin-bottom:6px">المادة أو المجال (يمكن أكثر من مادة إذا كان المشروع متعدد التخصصات)</div>${checks('subjects', SUBJECT_HINTS, d.subjects)}</div>
    ${field('مادة أو مجال غير موجود في القائمة', inp('subjectsOther', d.subjectsOther, 'placeholder="اكتبها، ويمكن أكثر من واحدة بينها فاصلة"'))}`;
  if (i === 1) body = `<div>${field('دورك أنت في المشروع', checks('myRoles', ROLES, d.myRoles))}<p class="tiny muted">منشئ المشروع يملك صلاحية إدارته دائمًا.</p></div>
    <div class="mini"><b>أعضاء الفريق</b><span class="small muted">أضف بريد كل عضو ودوره. تصله الدعوة عندما ينشئ حسابه في بُرهان بالبريد نفسه. يمكن للعضو أن يحمل أكثر من دور، ويمكن أن يكون من مدرسة أخرى.</span>
    <div class="grid">${field('الاسم', '<input id="wName">')}${field('البريد', '<input id="wEmail" type="email" dir="ltr">')}${field('المدرسة (اختياري)', '<input id="wSchool">')}</div>
    <div id="wRoles">${checks('wRole', ROLES, ['teacher'])}</div><div><button type="button" class="btn ghost small" data-act="wizadd">إضافة العضو</button></div>
    ${(d.team || []).length ? `<table><thead><tr><th>الاسم</th><th>البريد</th><th>الأدوار</th><th></th></tr></thead><tbody>${d.team.map((t, k) => `<tr><td>${esc(t.name)}${t.school ? '<br><span class="tiny muted">' + esc(t.school) + '</span>' : ''}</td><td dir="ltr">${esc(t.email)}</td><td>${esc(t.roles.map(r => ROLE[r]).join('، '))}</td><td><button type="button" class="btn ghost small" data-act="wizdel" data-i="${k}">حذف</button></td></tr>`).join('')}</tbody></table>` : '<span class="small muted">لم يُضف أحد بعد. يمكنك دعوة الفريق لاحقًا من «الفرق».</span>'}</div>`;
  if (i === 2) body = `${field('الهدف البعيد للتعلم', area('longTerm', d.longTerm, 'rows="3" placeholder="ماذا نريد أن يصبح عليه المتعلمون بعد سنوات؟ مثال: أن يفسّروا الظواهر ولا يكتفوا بحفظ الإجراءات"'))}
    <div class="grid wide">${field('الأفكار الكبرى', area('bigIdeas', d.bigIdeas, 'rows="3"'))}${field('عادات التفكير', area('habits', d.habits, 'rows="3" placeholder="مثال: التساؤل، التبرير، المثابرة"'))}</div>
    ${field('مؤشرات النجاح', area('successIndicators', d.successIndicators, 'rows="3" placeholder="كيف سنعرف أننا اقتربنا من الهدف؟"'))}`;
  if (i === 3) body = `${field('مشكلة التعلم', area('statement', d.statement, 'rows="3" placeholder="ما الذي يتعثر فيه المتعلمون؟"'))}
    <div class="grid wide">${field('الأدلة على المشكلة', area('evidence', d.evidence, 'rows="3" placeholder="نتائج، أعمال متعلمين، ملاحظات"'))}${field('المتعلمون المستهدفون', area('learners', d.learners, 'rows="3"'))}</div>
    ${field('الأسئلة التي يسعى الفريق إلى دراستها', area('questions', d.questions, 'rows="3"'))}`;
  if (i === 4) body = `<div class="grid">${field('عدد الحصص الأسبوعية', inp('lessonsPerWeek', d.lessonsPerWeek, 'type="number" min="0" inputmode="numeric"'))}${field('مدة الحصة (دقيقة)', inp('lessonMinutes', d.lessonMinutes, 'type="number" min="0" inputmode="numeric"'))}${field('عدد دورات بحث الدرس', inp('cycles', d.cycles || 2, 'type="number" min="1" max="12" inputmode="numeric"'))}${field('تاريخ البدء', inp('startDate', d.startDate, 'type="date"'))}</div>
    <div class="grid">${field('يوم الاجتماع', inp('meetingDay', d.meetingDay, 'placeholder="مثال: الاثنين"'))}${field('وقت الاجتماع', inp('meetingTime', d.meetingTime, 'placeholder="مثال: الحصة السادسة"'))}${field('مدة الاجتماع (دقيقة)', inp('meetingMinutes', d.meetingMinutes, 'type="number" min="0" inputmode="numeric"'))}</div>
    ${field('الموارد المتاحة', area('resources', d.resources, 'rows="2" placeholder="قاعات، أجهزة، وقت مخصص..."'))}`;
  if (i === 5) body = `<p class="small muted">كلها اختيارية. يعمل المشروع كاملًا ببحث الدرس وحده، ويمكن تفعيلها أو إيقافها لاحقًا من إعدادات المشروع دون التأثير في مشاريع أخرى.</p>
    <div class="modgrid">${MODULES.map(([k, n, ds]) => `<label><input type="checkbox" name="modules" value="${k}"${(d.modules || []).includes(k) ? ' checked' : ''}><span><b>${esc(n)}</b><small>${esc(ds)}</small></span></label>`).join('')}</div>`;
  if (i === 6) { const subj = wizSubjects(d); body = `<div class="cols"><div class="mini"><b>${esc(d.name || 'بلا اسم')}</b><span class="small">${esc(d.org || '—')} · ${esc(d.stage || '')} · ${esc(subj.join('، ') || 'بلا مادة')}${d.grade ? ' · ' + esc(d.grade) : ''}</span><span class="small muted">${esc(d.year || '')} ${esc(d.duration || '')}</span></div>
    <div class="mini"><b>الفريق</b><span class="small">أنت: ${esc((d.myRoles || []).map(r => ROLE[r]).join('، ') || 'قائد الفريق')}</span><span class="small">${(d.team || []).length} دعوة: ${esc((d.team || []).map(t => t.name || t.email).join('، ') || '—')}</span></div>
    <div class="mini"><b>الجدول</b><span class="small">${esc(d.cycles || 2)} دورة · ${esc(d.lessonsPerWeek || '؟')} حصة أسبوعيًا · اجتماع ${esc(d.meetingDay || '—')} ${esc(d.meetingTime || '')}</span></div>
    <div class="mini"><b>الوحدات المفعّلة</b><span class="small">${esc((d.modules || []).map(m => MODULE[m]).join('، ') || 'لا شيء: بحث الدرس وحده')}</span></div></div>
    ${d.longTerm ? `<div class="mini"><b>الهدف البعيد</b><span class="small">${esc(d.longTerm)}</span></div>` : '<div class="note">لم يُكتب الهدف البعيد بعد. يمكنك كتابته لاحقًا من إعدادات المشروع.</div>'}
    ${d.statement ? `<div class="mini"><b>مشكلة التعلم</b><span class="small">${esc(d.statement)}</span></div>` : ''}`; }
  return `${head('مشروع جديد', 'سبع خطوات قصيرة. ما لا تعرفه الآن يمكنك إكماله لاحقًا من إعدادات المشروع.')}${bar}
  <form class="panel" data-form="wiz">${body}
  <div class="row between"><div class="row">${i > 0 ? '<button type="button" class="btn ghost" data-act="wizback">السابق</button>' : ''}<button type="button" class="btn ghost" data-act="wizcancel">إلغاء</button></div>
  <button type="submit" class="btn">${i < WIZ.length - 1 ? 'التالي' : 'إنشاء مساحة العمل'}</button></div></form>`;
}
const wizSubjects = d => uniq((d.subjects || []).concat(lines(d.subjectsOther)));
function wizRead() { const f = $('form[data-form=wiz]'); if (!f) return; const o = formData(f); delete o.wRole; Object.assign(S.wiz.data, o); store.set('wizDraft', S.wiz); }
ACT.wizback = () => { wizRead(); S.wiz.step = Math.max(0, S.wiz.step - 1); S.dirty = false; render(); };
ACT.wizcancel = () => { S.wiz = null; store.set('wizDraft', null); S.dirty = false; render(); };
ACT.wizadd = () => {
  wizRead(); const em = String($('#wEmail').value || '').trim().toLowerCase(); const nm = $('#wName').value.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('اكتب بريدًا صحيحًا للعضو.'); return; }
  if (em === ME.email) { toast('هذا بريدك أنت؛ حدّد دورك في الأعلى.'); return; }
  const roles = $$('#wRoles input:checked').map(x => x.value); if (!roles.length) { toast('اختر دورًا واحدًا على الأقل.'); return; }
  S.wiz.data.team = (S.wiz.data.team || []).filter(t => t.email !== em).concat({name: nm, email: em, roles, school: $('#wSchool').value.trim()});
  store.set('wizDraft', S.wiz); S.dirty = false; render();
};
ACT.wizdel = b => { wizRead(); S.wiz.data.team.splice(Number(b.dataset.i), 1); store.set('wizDraft', S.wiz); S.dirty = false; render(); };
FORM.wiz = async o => {
  delete o.wRole; Object.assign(S.wiz.data, o);
  if (S.wiz.step === 0 && !S.wiz.data.name) { toast('اكتب اسم المشروع.'); return false; }
  if (S.wiz.step < WIZ.length - 1) { S.wiz.step++; store.set('wizDraft', S.wiz); return true; }
  const pid = await createProject(S.wiz.data);
  if (pid) { S.wiz = null; store.set('wizDraft', null); toast('أُنشئت مساحة العمل.'); S.view = 'dash'; store.set('view', 'dash'); }
  return !!pid;
};
async function createProject(d, extra = {}) {
  const pid = nid('p'); S.creating = true;
  const myRoles = (d.myRoles && d.myRoles.length) ? d.myRoles : ['leader'];
  const mods = {}; MODULES.forEach(([k]) => { mods[k] = (d.modules || []).includes(k); });
  const team = d.team || [];
  const doc = Object.assign({
    name: d.name, org: d.org || '', stage: d.stage || '', subjects: wizSubjects(d), grade: d.grade || '', year: d.year || '', duration: d.duration || '',
    goals: {longTerm: d.longTerm || '', bigIdeas: d.bigIdeas || '', habits: d.habits || '', successIndicators: d.successIndicators || ''},
    problem: {statement: d.statement || '', evidence: d.evidence || '', learners: d.learners || '', questions: d.questions || ''},
    schedule: {lessonsPerWeek: d.lessonsPerWeek || '', lessonMinutes: d.lessonMinutes || '', cycles: Number(d.cycles) || 1, startDate: d.startDate || '', meetingDay: d.meetingDay || '', meetingTime: d.meetingTime || '', meetingMinutes: d.meetingMinutes || '', resources: d.resources || ''},
    modules: mods, framework: mods.solo ? 'solo' : 'none', criteria: [], indicators: DEFAULT_INDICATORS.slice(), customObsFields: [], researchShare: {lessons: true, observations: false, decisions: true, meetings: false, ai: true},
    createdBy: ME.uid, createdAt: nowIso(), memberUids: [ME.uid], managerUids: [ME.uid], researcherUids: myRoles.includes('researcher') ? [ME.uid] : [], invitedEmails: team.map(t => t.email)}, extra);
  try {
    await db.collection('projects').doc(pid).set(doc);
    const pr = db.collection('projects').doc(pid);
    await pr.collection('members').doc(ME.uid).set({uid: ME.uid, email: ME.email, name: ME.name || ME.email, roles: myRoles, school: d.org || '', joinedAt: nowIso()});
    for (const t of team) await pr.collection('invites').doc(t.email).set({email: t.email, name: t.name || '', roles: t.roles, school: t.school || '', invitedBy: ME.uid, createdAt: nowIso()});
    const n = Math.max(1, Math.min(12, Number(d.cycles) || 1));
    for (let k = 1; k <= n; k++) await pr.collection('cycles').doc('c' + k).set({n: k, title: '', status: k === 1 ? 'active' : 'planned', topic: '', createdBy: ME.uid, createdAt: nowIso()});
    S.creating = false; S.pid = pid; store.set('pid', pid); S.subKey = '';
    const found = S.projects.find(p => p.id === pid); if (found) selectProject(pid);
    return pid;
  } catch (x) { S.creating = false; await failedCreate(pid, x); return null; }
}
async function failedCreate(pid, x) {
  try { await db.collection('projects').doc(pid).delete(); } catch (e) {}
  if (x && x.code === 'permission-denied') toast('تعذّر إكمال إنشاء المشروع: قواعد الأمان الجديدة لم تُنشر بعد في Firebase (Firestore ← Rules ← Publish).');
  else dbErr(x);
}

/* =========================================================
   Teams, roles and invitations; project settings
   ========================================================= */
V.team = () => {
  if (!S.P) return head('الفرق') + needProject();
  const mgr = isManager();
  const others = S.projects.filter(p => p.id !== S.pid);
  return `${head('الفرق', 'الفريق هو أعضاء المشروع وأدوارهم. يمكن للشخص أن يحمل أكثر من دور، وأن يكون في أكثر من فريق بدور مختلف في كل واحد. ويمكن أن يجمع الفريق أعضاء من مدارس مختلفة.')}
  <section class="panel"><h2>فريق «${esc(S.P.name)}» (${D.members.length})</h2>
  <div class="scroll"><table><thead><tr><th>العضو</th><th>المدرسة</th><th>الأدوار</th>${mgr ? '<th></th>' : ''}</tr></thead><tbody>${D.members.slice().sort((a, b) => String(a.name).localeCompare(String(b.name))).map(m => `<tr><td><b>${esc(m.name || m.email)}</b><br><span class="tiny muted" dir="ltr">${esc(m.email || '')}</span></td><td>${esc(m.school || '—')}</td>
    <td>${mgr ? `<form data-form="roles" data-id="${esc(m.id)}" class="rolechips">${checks('roles', ROLES, m.roles)}<button class="btn small" type="submit">حفظ الأدوار</button></form>` : esc((m.roles || []).map(r => ROLE[r]).join('، '))}</td>
    ${mgr ? `<td>${m.id !== S.P.createdBy && m.id !== ME.uid ? `<button class="btn ghost small" data-act="rmmember" data-id="${esc(m.id)}">إزالة</button>` : ''}</td>` : ''}</tr>`).join('')}</tbody></table></div></section>
  ${mgr ? `<section class="panel"><h2>دعوة عضو</h2><p class="small muted">تصل الدعوة عندما ينشئ العضو حسابه في بُرهان بالبريد نفسه، وتظهر له في لوحة التحكم ليقبلها.</p>
    <form data-form="invite" class="stepsec"><div class="grid">${field('الاسم', inp('name', ''))}${field('البريد', inp('email', '', 'type="email" required dir="ltr"'))}${field('المدرسة أو الجهة', inp('school', ''))}</div>${field('الأدوار', checks('roles', ROLES, ['teacher']))}<div><button class="btn" type="submit">إرسال الدعوة</button></div></form>
    ${D.invites.length ? `<h3>دعوات لم تُقبل بعد</h3><div class="ledger">${D.invites.filter(i => (S.P.invitedEmails || []).includes(i.email)).map(i => `<div class="rec"><div class="row between"><span><b>${esc(i.name || '')}</b> <span dir="ltr" class="small">${esc(i.email)}</span></span><button class="btn ghost small" data-act="rminvite" data-id="${esc(i.id)}">إلغاء الدعوة</button></div><div class="meta">${esc((i.roles || []).map(r => ROLE[r]).join('، '))}${i.school ? ' · ' + esc(i.school) : ''}</div></div>`).join('') || '<span class="small muted">لا شيء.</span>'}</div>` : ''}</section>` : ''}
  ${others.length ? `<section class="panel"><h2>فرقك الأخرى</h2><div class="ledger">${others.map(p => `<div class="rec"><div class="row between"><b>${esc(p.name)}</b><button class="btn ghost small" data-act="openproj" data-id="${esc(p.id)}">فتح</button></div><div class="meta">${(p.memberUids || []).length} عضو · ${esc((p.subjects || []).join('، '))}</div></div>`).join('')}</div></section>` : ''}
  <section class="panel"><h2>ماذا يفعل كل دور؟</h2><div class="scroll"><table><tbody>
    <tr><td><b>قائد الفريق</b></td><td>يدير المشروع وإعداداته والدعوات، ويعتمد قرارات التحسين.</td></tr>
    <tr><td><b>الميسّر</b></td><td>يدير الاجتماعات ويحافظ على التركيز على أدلة التعلم، وله صلاحيات الإدارة.</td></tr>
    <tr><td><b>المعلم المنفّذ</b></td><td>ينفّذ الدرس البحثي ويكتب نسخه.</td></tr>
    <tr><td><b>خبير المحتوى</b></td><td>يتحقق من دقة المحتوى وتدرّج المفاهيم.</td></tr>
    <tr><td><b>الملاحِظ</b></td><td>يوثّق تعلّم المتعلمين أثناء الدرس: الدليل المباشر منفصلًا عن التفسير.</td></tr>
    <tr><td><b>المراجع</b></td><td>يراجع الخطط والقرارات والتقارير.</td></tr>
    <tr><td><b>الباحث</b></td><td>يعمل في «مساحة الباحث» إذا فُعّلت، ولا يصل إلا إلى البيانات المصرّح بها.</td></tr></tbody></table></div></section>`;
};
FORM.roles = async (o, f) => {
  const id = f.dataset.id; const roles = o.roles || []; if (!roles.length) { toast('اختر دورًا واحدًا على الأقل.'); return false; }
  if (!(await updDoc('members', id, {roles}))) return false;
  const P = S.P; const isMgr = roles.some(r => MANAGER_ROLES.includes(r)) || id === P.createdBy;
  const up = {managerUids: isMgr ? uniq((P.managerUids || []).concat(id)) : (P.managerUids || []).filter(x => x !== id), researcherUids: roles.includes('researcher') ? uniq((P.researcherUids || []).concat(id)) : (P.researcherUids || []).filter(x => x !== id)};
  if (!up.managerUids.length) { toast('يجب أن يبقى في المشروع مدير واحد على الأقل.'); return false; }
  await updProject(up); toast('حُفظت الأدوار.');
};
FORM.invite = async o => {
  const em = String(o.email || '').toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { toast('اكتب بريدًا صحيحًا.'); return false; }
  if (!(o.roles || []).length) { toast('اختر دورًا واحدًا على الأقل.'); return false; }
  if (D.members.some(m => m.email === em)) { toast('هذا العضو موجود في الفريق.'); return false; }
  try { await coll('invites').doc(em).set({email: em, name: o.name || '', roles: o.roles, school: o.school || '', invitedBy: ME.uid, createdAt: nowIso()}); }
  catch (x) { dbErr(x); return false; }
  await updProject({invitedEmails: uniq((S.P.invitedEmails || []).concat(em))}); toast('أُرسلت الدعوة إلى ' + em);
};
ACT.rminvite = async b => { const id = b.dataset.id; await delDoc('invites', id); await updProject({invitedEmails: (S.P.invitedEmails || []).filter(e => e !== id)}); toast('أُلغيت الدعوة.'); };
ACT.rmmember = async b => {
  const id = b.dataset.id; if (b.dataset.arm !== '1') { b.dataset.arm = '1'; b.textContent = 'اضغط مرة أخرى للتأكيد'; return; }
  await delDoc('members', id);
  await updProject({memberUids: (S.P.memberUids || []).filter(x => x !== id), managerUids: (S.P.managerUids || []).filter(x => x !== id), researcherUids: (S.P.researcherUids || []).filter(x => x !== id)});
  toast('أُزيل العضو من المشروع.');
};

/* ---------- settings (managers) ---------- */
V.settings = () => {
  if (!S.P) return head('إعدادات المشروع') + needProject();
  if (!isManager()) return head('إعدادات المشروع') + empty('الإعدادات لقائد الفريق والميسّر.');
  const P = S.P; const g = P.goals || {}; const pr = P.problem || {}; const sc = P.schedule || {};
  const t = curTab('settings', 'general');
  let body = '';
  if (t === 'general') body = `<form data-form="setGeneral" class="panel"><div class="grid wide">${field('اسم المشروع', inp('name', P.name, 'required'))}${field('المؤسسة التعليمية', inp('org', P.org))}</div>
    <div class="grid">${field('المرحلة', sel('stage', STAGES, P.stage))}${field('الصف', inp('grade', P.grade))}${field('العام الدراسي', inp('year', P.year))}${field('مدة المشروع', inp('duration', P.duration))}</div>
    ${field('المواد أو المجالات', inp('subjects', (P.subjects || []).join('، ')), 'افصل بينها بفاصلة')}<div><button class="btn" type="submit">حفظ</button></div></form>`;
  if (t === 'goal') body = `<form data-form="setGoal" class="panel">${field('الهدف البعيد للتعلم', area('longTerm', g.longTerm, 'rows="3"'))}<div class="grid wide">${field('الأفكار الكبرى', area('bigIdeas', g.bigIdeas, 'rows="3"'))}${field('عادات التفكير', area('habits', g.habits, 'rows="3"'))}</div>${field('مؤشرات النجاح', area('successIndicators', g.successIndicators, 'rows="3"'))}
    <hr style="border:0;border-top:1px solid var(--line)"><h3>مشكلة التعلم</h3>${field('المشكلة', area('statement', pr.statement, 'rows="3"'))}<div class="grid wide">${field('الأدلة', area('evidence', pr.evidence, 'rows="3"'))}${field('المتعلمون المستهدفون', area('learners', pr.learners, 'rows="3"'))}</div>${field('أسئلة الفريق', area('questions', pr.questions, 'rows="3"'))}<div><button class="btn" type="submit">حفظ</button></div></form>`;
  if (t === 'schedule') body = `<form data-form="setSchedule" class="panel"><div class="grid">${field('عدد الحصص الأسبوعية', inp('lessonsPerWeek', sc.lessonsPerWeek, 'type="number" min="0"'))}${field('مدة الحصة (دقيقة)', inp('lessonMinutes', sc.lessonMinutes, 'type="number" min="0"'))}${field('تاريخ البدء', inp('startDate', sc.startDate, 'type="date"'))}</div>
    <div class="grid">${field('يوم الاجتماع', inp('meetingDay', sc.meetingDay))}${field('وقت الاجتماع', inp('meetingTime', sc.meetingTime))}${field('مدة الاجتماع (دقيقة)', inp('meetingMinutes', sc.meetingMinutes, 'type="number" min="0"'))}</div>${field('الموارد المتاحة', area('resources', sc.resources, 'rows="2"'))}<div><button class="btn" type="submit">حفظ</button></div></form>`;
  if (t === 'modules') body = `<form data-form="setModules" class="panel"><p class="small muted">تفعيل وحدة أو إيقافها يخص هذا المشروع وحده. إيقاف وحدة يخفي صفحاتها وحقولها، ولا يحذف بياناتها.</p>
    <div class="modgrid">${MODULES.map(([k, n, ds]) => `<label><input type="checkbox" name="modules" value="${k}"${mod(k) ? ' checked' : ''}><span><b>${esc(n)}</b><small>${esc(ds)}</small></span></label>`).join('')}</div>
    ${mod('research') ? `<div class="mini"><b>ما الذي يصل إليه الباحث من بيانات المشروع؟</b><span class="small muted">مساحة الباحث منفصلة. ولا تدخل فيها بيانات الفريق إلا ما تصرّح به هنا.</span>${checks('share', [['lessons', 'خطط الدروس'], ['observations', 'الملاحظات'], ['decisions', 'القرارات'], ['meetings', 'محاضر الاجتماعات'], ['ai', 'سجل الذكاء الاصطناعي']], Object.keys(P.researchShare || {}).filter(k => P.researchShare[k]))}</div>` : ''}
    <div><button class="btn" type="submit">حفظ</button></div></form>`;
  if (t === 'obs') body = `<form data-form="setObs" class="panel">${field('مؤشرات الملاحظة', area('indicators', (P.indicators || []).join('\n'), 'rows="8"'), 'مؤشر في كل سطر. تظهر في بطاقة الملاحظة وفي التحليلات.')}
    ${mod('customObs') ? field('حقول إضافية في بطاقة الملاحظة', area('customObsFields', (P.customObsFields || []).join('\n'), 'rows="4" placeholder="مثال: الأداة المستخدمة\nزمن الاستجابة"'), 'حقل في كل سطر') : '<p class="small muted">لإضافة حقول خاصة بمادتكم في بطاقة الملاحظة فعّل وحدة «أدوات ملاحظة مخصصة».</p>'}<div><button class="btn" type="submit">حفظ</button></div></form>`;
  if (t === 'danger') body = `<section class="panel"><h2>حذف المشروع</h2><p class="small">يحذف وثيقة المشروع فيختفي من قوائم الأعضاء. ${P.createdBy === ME.uid ? '' : 'متاح لمنشئ المشروع فقط.'}</p>${P.createdBy === ME.uid ? '<div><button class="btn ghost" data-act="delproject">حذف المشروع</button></div>' : ''}</section>`;
  return `${head('إعدادات المشروع')}${tabs('settings', [['general', 'البيانات العامة'], ['goal', 'الهدف والمشكلة'], ['schedule', 'التخطيط الزمني'], ['modules', 'الوحدات الاختيارية'], ['obs', 'مؤشرات الملاحظة'], ['danger', 'حذف']])}${body}`;
};
FORM.setGeneral = async o => { if (!o.name) { toast('اكتب اسم المشروع.'); return false; } if (await updProject({name: o.name, org: o.org, stage: o.stage, grade: o.grade, year: o.year, duration: o.duration, subjects: lines(o.subjects)})) toast('حُفظ.'); };
FORM.setGoal = async o => { if (await updProject({goals: {longTerm: o.longTerm, bigIdeas: o.bigIdeas, habits: o.habits, successIndicators: o.successIndicators}, problem: {statement: o.statement, evidence: o.evidence, learners: o.learners, questions: o.questions}})) toast('حُفظ الهدف والمشكلة.'); };
FORM.setSchedule = async o => { if (await updProject({schedule: Object.assign({}, S.P.schedule || {}, o)})) toast('حُفظ التخطيط الزمني.'); };
FORM.setModules = async o => {
  const m = {}; MODULES.forEach(([k]) => { m[k] = (o.modules || []).includes(k); });
  const share = {}; ['lessons', 'observations', 'decisions', 'meetings', 'ai'].forEach(k => { share[k] = (o.share || []).includes(k); });
  const up = {modules: m, framework: m.solo ? 'solo' : (S.P.framework === 'solo' ? 'none' : (S.P.framework || 'none'))};
  if (o.share) up.researchShare = share;
  if (await updProject(up)) toast('حُفظت الوحدات.');
};
FORM.setObs = async o => { const ind = String(o.indicators || '').split('\n').map(x => x.trim()).filter(Boolean); if (await updProject({indicators: ind.length ? ind : DEFAULT_INDICATORS.slice(), customObsFields: String(o.customObsFields || '').split('\n').map(x => x.trim()).filter(Boolean)})) toast('حُفظت مؤشرات الملاحظة.'); };
ACT.delproject = async b => { if (b.dataset.arm !== '1') { b.dataset.arm = '1'; b.textContent = 'اضغط مرة أخرى لتأكيد الحذف النهائي'; return; } try { await pref().delete(); toast('حُذف المشروع.'); S.pid = ''; store.set('pid', ''); go('dash'); } catch (x) { dbErr(x); } };

/* =========================================================
   The Lesson Study cycle: schedule, research lessons,
   observation of learning, and improvement decisions
   ========================================================= */
const shortId = (p, id) => p + '-' + String(id || '').slice(-4).toUpperCase();
const lessonLabel = l => l ? `${l.title || 'درس بلا عنوان'} · V${l.version || 1}` : '—';
const lessonsOfCycle = c => D.lessons.filter(l => !c || l.cycleId === c.id).sort((a, b) => String(a.familyId).localeCompare(String(b.familyId)) || (a.version || 1) - (b.version || 1));
const memberOpts = () => D.members.map(m => [m.id, m.name || m.email]);

/* ---------- schedule ---------- */
V.schedule = () => {
  if (!S.P) return head('الجدول التنفيذي') + needProject();
  const sc = S.P.schedule || {}; const cycles = D.cycles.slice().sort((a, b) => (a.n || 0) - (b.n || 0)); const c = curCycle();
  const mgr = isManager();
  return `${head('الجدول التنفيذي', 'دورات بحث الدرس وخطواتها التسع. تكتمل كل خطوة تلقائيًا عندما يوجد دليلها في المنصة، وتظهر الخطوة التالية في لوحة التحكم.')}
  <section class="panel"><h2>إيقاع المشروع</h2><div class="kpis"><div class="kpi"><b>${esc(sc.lessonsPerWeek || '—')}</b><span>حصة أسبوعيًا</span></div><div class="kpi"><b>${esc(sc.lessonMinutes || '—')}</b><span>دقيقة للحصة</span></div><div class="kpi"><b>${esc(sc.meetingDay || '—')}</b><span>يوم الاجتماع ${esc(sc.meetingTime || '')}</span></div><div class="kpi"><b>${cycles.length}</b><span>دورة</span></div></div>${mgr ? '<div><button class="btn ghost small" data-act="go" data-v="settings">تعديل الإيقاع</button></div>' : ''}</section>
  <section class="panel"><div class="row between"><h2>الدورات</h2>${mgr ? '<button class="btn small" data-act="addcycle">دورة جديدة</button>' : ''}</div>
  <div class="ledger">${cycles.map(x => { const st = stepState(x); const n = st.filter(s => s.ok).length; return `<div class="rec${c && x.id === c.id ? ' mine' : ''}"><div class="row between"><b>${esc(cycleLabel(x))}</b><span class="row">${pill({planned: 'مخطط لها', active: 'جارية', closed: 'مغلقة'}[x.status || 'planned'] || '', x.status === 'active' ? 'good' : '')}${c && x.id === c.id ? '' : `<button class="btn ghost small" data-act="pickcycle" data-id="${esc(x.id)}">عرض</button>`}</span></div>
    <div class="meta"><span>${esc(x.topic || 'بلا موضوع بعد')}</span><span>الدرس البحثي: ${esc(fmtDate(x.lessonDate))}</span><span>المنفّذ: ${esc(x.teacherUid ? memberName(x.teacherUid) : '—')}</span></div>
    <div class="row"><div class="bar" style="flex:1"><i style="width:${Math.round(n / STEPS.length * 100)}%"></i></div><span class="small muted">${n} من ${STEPS.length}</span></div></div>`; }).join('') || empty('لا دورات بعد.')}</div></section>
  ${c ? cyclePanel(c) : ''}`;
};
function cyclePanel(c) {
  const st = stepState(c);
  return `<section class="panel hero"><h2>${esc(cycleLabel(c))}</h2>${stepChips(c)}
  <div class="scroll"><table><thead><tr><th>#</th><th>الخطوة</th><th>ما المطلوب</th><th>الحالة</th><th></th></tr></thead><tbody>${st.map((x, i) => `<tr><td>${i + 1}</td><td><b>${esc(x.s.n)}</b></td><td class="small">${esc(x.s.d)}</td><td>${x.ok ? pill('مكتملة', 'good') : pill(x.s.optional ? 'اختيارية' : 'لم تكتمل', x.s.optional ? '' : 'warn')}</td><td><button class="btn ghost small" data-act="go" data-v="${x.s.go}">افتح</button></td></tr>`).join('')}</tbody></table></div>
  <form data-form="cycle" data-id="${esc(c.id)}" class="stepsec"><h3>بيانات الدورة</h3>
    <div class="grid">${field('عنوان الدورة', inp('title', c.title))}${field('موضوع الدرس البحثي', inp('topic', c.topic))}${field('تاريخ الدرس البحثي', inp('lessonDate', c.lessonDate, 'type="date"'))}${field('المعلم المنفّذ', sel('teacherUid', memberOpts(), c.teacherUid, '—'))}</div>
    ${field('الملاحِظون', checks('observers', memberOpts(), c.observers))}
    ${field('دراسة المحتوى', area('contentStudy', c.contentStudy, 'rows="4" placeholder="المفاهيم الأساسية، والمتطلبات السابقة، وكيف تتدرج الفكرة في المنهج، والأخطاء الشائعة"'), 'هذا حقل خطوة «دراسة المحتوى».')}
    <label class="checks"><label><input type="checkbox" name="skipReteach" value="1"${c.skipReteach ? ' checked' : ''}>لن نعيد تدريس الدرس في هذه الدورة</label></label>
    ${isManager() ? field('حالة الدورة', sel('status', [['planned', 'مخطط لها'], ['active', 'جارية'], ['closed', 'مغلقة']], c.status || 'planned')) : ''}
    <div><button class="btn" type="submit">حفظ بيانات الدورة</button></div></form></section>`;
}
ACT.pickcycle = b => { S.cycleId = b.dataset.id; store.set('cycle', S.cycleId); render(); };
ACT.addcycle = async () => { const n = Math.max(0, ...D.cycles.map(c => c.n || 0)) + 1; const id = await addDoc('cycles', {n, title: '', status: 'planned', topic: ''}, 'c' + n + '_' + Date.now().toString(36)); if (id) { S.cycleId = id; toast('أُضيفت الدورة ' + n); } };
FORM.cycle = async (o, f) => { const data = {title: o.title, topic: o.topic, lessonDate: o.lessonDate, teacherUid: o.teacherUid, observers: o.observers || [], contentStudy: o.contentStudy, skipReteach: (o.skipReteach || []).length > 0}; if (o.status) data.status = o.status; if (await updDoc('cycles', f.dataset.id, data)) toast('حُفظت بيانات الدورة.'); };

/* ---------- research lessons ---------- */
const LESSON_FIELDS = [
  ['topic', 'الموضوع', 'input'], ['concepts', 'المفاهيم', 'area'], ['prerequisites', 'المتطلبات السابقة', 'area'],
  ['outcomes', 'نواتج التعلم', 'area', 'ابدأ بفعل قابل للملاحظة: يفسّر، يقارن، يبرّر، يصمّم'],
  ['tasks', 'المهام', 'area'], ['questionsText', 'الأسئلة', 'area', 'الأسئلة التي تُطرح أثناء الدرس'],
  ['expected', 'الاستجابات المتوقعة', 'area', 'كيف نتوقع أن يفكر المتعلمون؟'], ['misconceptions', 'الأخطاء الشائعة', 'area'],
  ['resources', 'الموارد', 'area'], ['time', 'الزمن', 'input', 'توزيع زمن الحصة'], ['evidence', 'أدلة التعلم', 'area', 'ما الذي سنجمعه لنعرف أن المتعلمين تعلّموا؟']];
V.lessons = () => {
  if (!S.P) return head('الدروس البحثية') + needProject();
  if (S.lessonEdit) return lessonEditor();
  if (S.compare) return lessonCompare();
  const c = curCycle(); const list = lessonsOfCycle(c);
  const fams = {}; list.forEach(l => { (fams[l.familyId || l.id] = fams[l.familyId || l.id] || []).push(l); });
  return `${head('الدروس البحثية', 'خطة الدرس البحثي ونسخها. كل نسخة جديدة تحفظ ما تغيّر ولماذا، وتُربط بقرار التحسين الذي أدى إليها. البنية نفسها تصلح لأي مادة.')}
  <section class="panel"><div class="row between">${field('الدورة', `<select data-change="lcycle">${opts(D.cycles.slice().sort((a, b) => (a.n || 0) - (b.n || 0)).map(x => [x.id, cycleLabel(x)]), c && c.id)}</select>`)}<button class="btn" data-act="newlesson">درس بحثي جديد</button></div>
  <div class="ledger">${Object.values(fams).map(vs => { const last = vs[vs.length - 1]; return `<div class="rec"><div class="row between"><b style="font-size:17px">${esc(last.title || 'بلا عنوان')}</b><span class="row">${vs.map(v => `<button class="btn ghost small" data-act="editlesson" data-id="${esc(v.id)}">V${v.version || 1}</button>`).join('')}</span></div>
    <div class="meta"><span>${esc(last.topic || '')}</span><span>آخر تعديل ${esc(fmtDate(last.updatedAt || last.createdAt))}</span>${vs.length > 1 ? `<button class="btn ghost small" data-act="compare" data-id="${esc(last.id)}">قارن النسخ</button>` : ''}</div></div>`; }).join('') || empty('لا دروس بحثية في هذه الدورة بعد.')}</div></section>`;
};
ACT.lcycle = el => { S.cycleId = el.value; store.set('cycle', S.cycleId); render(); };
ACT.newlesson = () => { const c = curCycle(); if (!c) { toast('أنشئ دورة أولًا من «الجدول التنفيذي».'); return; } S.lessonEdit = {id: '', data: {cycleId: c.id, version: 1, title: c.topic || ''}}; render(); };
ACT.editlesson = b => { const l = D.lessons.find(x => x.id === b.dataset.id); if (l) { S.lessonEdit = {id: l.id, data: l}; render(); window.scrollTo(0, 0); } };
ACT.closelesson = () => { S.lessonEdit = null; S.compare = null; S.dirty = false; render(); };
ACT.compare = b => { S.compare = b.dataset.id; render(); };
function soloBlock(l) {
  const s = l.solo || {}; const qs = (s.questions || []).concat([{}, {}, {}]).slice(0, Math.max(4, (s.questions || []).length + 2));
  const lv = SOLO.slice(1).map(x => [x[0], x[0] + ' · ' + x[1]]);
  const aligned = soloAlignment(l);
  return `<section class="stepsec"><div class="stephead"><span class="n">S</span><div><h3>تصميم وفق SOLO</h3><p>حدّد مستوى الهدف، وصنّف كل سؤال بمستواه، واختر مهمة ختامية بالمستوى نفسه. تظهر هذه الحقول لأن وحدة SOLO مفعّلة.</p></div></div>
    <div class="grid">${field('مستوى SOLO الذي يستهدفه الناتج', sel('soloOutcome', lv, s.outcomeLevel || '3'))}${field('المهمة الختامية (نشاط آخر الحصة)', inp('soloExit', s.exitTask))}${field('مستوى المهمة الختامية', sel('soloExitLevel', lv, s.exitLevel || '3'))}</div>
    <div class="hint">الأسئلة المتدرجة ومستوياتها</div>${qs.map((q, i) => `<div class="qrow"><input name="q_t_${i}" value="${esc(q.t || '')}" placeholder="السؤال ${i + 1}"><select name="q_l_${i}">${opts(lv, q.l || '')}</select><span class="tiny muted">${i + 1}</span></div>`).join('')}
    ${aligned}</section>`;
}
function soloAlignment(l) {
  const s = l.solo || {}; const qs = (s.questions || []).filter(q => q.t);
  if (!qs.length && !s.exitTask) return '';
  const target = Number(s.outcomeLevel || 3); const hi = qs.filter(q => Number(q.l) >= target).length;
  const rows = [['الناتج', soloName(s.outcomeLevel)], ['أسئلة عند مستوى الناتج فأعلى', `${hi} من ${qs.length}`], ['المهمة الختامية', soloName(s.exitLevel)]];
  const ok = qs.length && hi > 0 && Number(s.exitLevel || 0) >= target;
  return `<div class="mini"><b>مصفوفة المواءمة</b><table><tbody>${rows.map(r => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>${ok ? '<div class="ok">الناتج والأسئلة والمهمة الختامية متوائمة.</div>' : '<div class="note">انتبه: لا توجد أسئلة أو مهمة ختامية عند مستوى الناتج المستهدف.</div>'}</div>`;
}
function lessonEditor() {
  const E = S.lessonEdit; const l = E.data; const v = l.version || 1;
  const decs = D.decisions.filter(d => d.cycleId === l.cycleId);
  return `${head(E.id ? lessonLabel(l) : 'درس بحثي جديد', `${esc(cycleLabel(D.cycles.find(x => x.id === l.cycleId)))}`)}
  <div class="row"><button class="btn ghost small" data-act="closelesson">→ كل الدروس</button>${E.id ? `<button class="btn ghost small" data-act="newversion" data-id="${esc(E.id)}">نسخة جديدة V${v + 1} من هذه</button>` : ''}${E.id && v > 1 ? `<button class="btn ghost small" data-act="compare" data-id="${esc(E.id)}">قارن بالنسخة السابقة</button>` : ''}</div>
  <form data-form="lesson" class="panel">
    ${field('عنوان الدرس', inp('title', l.title, 'required'))}
    ${v > 1 ? `<div class="mini"><b>ما الذي تغيّر في هذه النسخة ولماذا؟</b>${area('changeNote', l.changeNote, 'rows="3" required placeholder="التعديل وسببه من أدلة التعلم"')}${field('قرار التحسين المرتبط', sel('decisionId', decs.map(d => [d.id, shortId('D', d.id) + ' · ' + String(d.decision || '').slice(0, 60)]), l.decisionId, '—'))}</div>` : ''}
    <div class="grid wide">${LESSON_FIELDS.map(([k, label, kind, hint]) => field(label, kind === 'input' ? inp(k, l[k]) : area(k, l[k], 'rows="3"'), hint)).join('')}</div>
    ${mod('solo') ? soloBlock(l) : ''}
    <div class="row"><button class="btn" type="submit">حفظ الخطة</button><span class="small muted">تُحفظ باسمك ويراها الفريق.</span></div></form>`;
}
FORM.lesson = async o => {
  const E = S.lessonEdit; const base = E.data;
  const data = {title: o.title, cycleId: base.cycleId, version: base.version || 1, familyId: base.familyId || '', parentId: base.parentId || ''};
  LESSON_FIELDS.forEach(([k]) => { data[k] = o[k] || ''; });
  if ((base.version || 1) > 1) { data.changeNote = o.changeNote || ''; data.decisionId = o.decisionId || ''; }
  if (mod('solo')) { const qs = []; Object.keys(o).filter(k => /^q_t_\d+$/.test(k)).sort((a, b) => Number(a.slice(4)) - Number(b.slice(4))).forEach(k => { const i = k.slice(4); if (o[k]) qs.push({t: o[k], l: o['q_l_' + i] || ''}); }); data.solo = {outcomeLevel: o.soloOutcome, exitTask: o.soloExit, exitLevel: o.soloExitLevel, questions: qs}; }
  if (E.id) { if (!(await updDoc('lessons', E.id, data))) return false; E.data = Object.assign({}, base, data); }
  else { const id = nid('le'); data.familyId = id; const ok = await addDoc('lessons', data, id); if (!ok) return false; E.id = id; E.data = Object.assign({id}, data); }
  toast('حُفظت خطة الدرس.');
};
ACT.newversion = async b => {
  const l = D.lessons.find(x => x.id === b.dataset.id); if (!l) return;
  const fam = D.lessons.filter(x => (x.familyId || x.id) === (l.familyId || l.id)); const v = Math.max(...fam.map(x => x.version || 1)) + 1;
  const copy = Object.assign({}, l); ['id', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy', 'changeNote', 'decisionId'].forEach(k => delete copy[k]);
  copy.version = v; copy.parentId = l.id; copy.familyId = l.familyId || l.id;
  const id = await addDoc('lessons', copy); if (id) { S.lessonEdit = {id, data: Object.assign({id}, copy)}; toast('أُنشئت النسخة V' + v + '. اكتب ما تغيّر ولماذا.'); }
};
function lessonCompare() {
  const b = D.lessons.find(x => x.id === S.compare); if (!b) { S.compare = null; return V.lessons(); }
  const a = D.lessons.find(x => x.id === b.parentId) || D.lessons.filter(x => (x.familyId || x.id) === (b.familyId || b.id) && (x.version || 1) === (b.version || 1) - 1)[0];
  if (!a) return `${head('مقارنة النسخ')}<div class="row"><button class="btn ghost small" data-act="closelesson">→ كل الدروس</button></div>${empty('لا توجد نسخة سابقة لهذه.')}`;
  const rows = [['title', 'العنوان']].concat(LESSON_FIELDS.map(f => [f[0], f[1]]));
  const dec = D.decisions.find(d => d.id === b.decisionId);
  const qd = l => { const q = ((l.solo || {}).questions || []).filter(x => x.t); return q.length ? SOLO.slice(1).map(s => `${s[0]}: ${q.filter(x => String(x.l) === s[0]).length}`).join(' · ') : '—'; };
  return `${head('مقارنة النسخ', esc(b.title || ''))}<div class="row"><button class="btn ghost small" data-act="closelesson">→ كل الدروس</button></div>
  <section class="panel"><div class="mini"><b>ما الذي تغيّر في V${b.version} ولماذا؟</b><span class="small">${esc(b.changeNote || 'لم يُكتب.')}</span>${dec ? `<span class="small">القرار المرتبط: ${esc(shortId('D', dec.id))} · ${esc(dec.decision)}</span>` : ''}</div>
  <div class="scroll"><table class="diff"><thead><tr><th>العنصر</th><th>V${a.version || 1}</th><th>V${b.version}</th></tr></thead><tbody>${rows.map(([k, l]) => { const x = a[k] || '', y = b[k] || ''; return `<tr class="${x !== y ? 'chg' : ''}"><td><b>${esc(l)}</b></td><td>${esc(x)}</td><td>${esc(y)}</td></tr>`; }).join('')}
  ${mod('solo') ? `<tr class="${qd(a) !== qd(b) ? 'chg' : ''}"><td><b>توزيع مستويات الأسئلة (SOLO)</b></td><td>${esc(qd(a))}</td><td>${esc(qd(b))}</td></tr>` : ''}</tbody></table></div><p class="tiny muted">الصفوف المظللة تغيّرت بين النسختين.</p></section>`;
}

/* ---------- observation and evidence ---------- */
V.obs = () => {
  if (!S.P) return head('الملاحظة والأدلة') + needProject();
  const e = editing('observations'); const keep = e || S.obsKeep || {}; const c = (e && D.cycles.find(x => x.id === e.cycleId)) || curCycle(); const ls = lessonsOfCycle(c);
  const tags = uniq(D.observations.map(o => o.tag).filter(Boolean));
  const fl = S.filters.obs || {}; let list = D.observations.slice().sort(byNew);
  if (fl.cycle) list = list.filter(o => o.cycleId === fl.cycle); if (fl.ind) list = list.filter(o => o.indicator === fl.ind);
  return `${head('الملاحظة والأدلة', 'نلاحظ تعلّم المتعلمين لا أداء المعلم. اكتب ما رأيته أو سمعته بالضبط في «الدليل المباشر»، وتفسيرك المهني منفصلًا عنه. استخدم رموزًا للمتعلمين لا أسماء.')}
  <form data-form="obs" class="panel">${e ? editBanner('هذا الدليل', e) : ''}<div class="grid">${field('الدورة', cycleSelect('cycleId', keep.cycleId))}${field('الدرس', sel('lessonId', ls.map(l => [l.id, lessonLabel(l)]), keep.lessonId, ls.length ? undefined : 'لا دروس في هذه الدورة'))}${field('المتعلم أو المجموعة', inp('focus', e ? e.focus : '', 'placeholder="S07 أو مجموعة 2"'))}${field('المؤشر', sel('indicator', (S.P.indicators || DEFAULT_INDICATORS), keep.indicator))}</div>
    <div class="split"><div class="ev">${field('الدليل المباشر: ماذا قال أو فعل؟', area('direct', e ? e.direct : '', 'rows="4" required placeholder="اكتب الكلام أو الفعل كما حدث، دون حكم"'))}</div><div class="interp">${field('التفسير المهني (اختياري)', area('interpretation', e ? e.interpretation : '', 'rows="4" placeholder="ماذا يعني هذا عن تفكيره؟"'))}</div></div>
    <div class="grid">${field('نمط صعوبة (وسم اختياري)', `<input name="tag" list="tagList" value="${esc(e ? e.tag || '' : '')}" placeholder="مثال: يخلط بين السبب والنتيجة"><datalist id="tagList">${tags.map(t => `<option value="${esc(t)}">`).join('')}</datalist>`)}${field('الوقت', inp('time', e ? e.time : '', 'type="time"'))}${mod('solo') ? field('مستوى SOLO للاستجابة', sel('soloLevel', SOLO.map(s => [s[0], s[0] + ' · ' + s[1]]), e ? e.soloLevel : '', 'لم يُصنَّف')) : ''}</div>
    ${mod('customObs') && (S.P.customObsFields || []).length ? `<div class="grid">${S.P.customObsFields.map((x, i) => field(x, inp('cf_' + i, e && e.custom ? e.custom[x] || '' : ''))).join('')}</div>` : ''}
    <div class="row"><button class="btn" type="submit">${e ? 'حفظ التعديل' : 'حفظ الدليل'}</button>${e ? '<button type="button" class="btn ghost" data-act="canceledit">إلغاء التعديل</button>' : '<span class="small muted">تبقى الدورة والدرس والمؤشر كما هي لتسجيل الدليل التالي.</span>'}</div></form>
  <section class="panel"><div class="row between"><h2>الأدلة (${list.length})</h2><div class="row"><button class="btn ghost small" data-act="xlsxlist" data-c="observations">Excel</button><select data-change="fobsc" aria-label="تصفية بالدورة">${opts(D.cycles.map(x => [x.id, cycleLabel(x)]), fl.cycle, 'كل الدورات')}</select><select data-change="fobsi" aria-label="تصفية بالمؤشر">${opts(S.P.indicators || [], fl.ind, 'كل المؤشرات')}</select></div></div>
  <div class="ledger">${list.slice(0, 60).map(obsCard).join('') || empty('لا أدلة بعد.')}</div></section>`;
};
function obsCard(o) {
  const l = D.lessons.find(x => x.id === o.lessonId);
  return `<div class="rec"><div class="meta"><b>${esc(shortId('O', o.id))}</b><span>${esc(lessonLabel(l))}</span><span>${esc(o.focus || '')}</span>${pill(o.indicator || '')}${o.tag ? pill(o.tag, 'warn') : ''}${o.soloLevel !== undefined && o.soloLevel !== '' ? pill('SOLO ' + soloName(o.soloLevel), 'good') : ''}<span>${esc(memberName(o.createdBy))}</span>${recTools('observations', o)}</div>
  <div class="body ev">${esc(o.direct)}</div>${o.interpretation ? `<div class="body interp small">${esc(o.interpretation)}</div>` : ''}${o.custom ? `<div class="tiny muted">${esc(Object.entries(o.custom).map(([k, v]) => k + ': ' + v).join(' · '))}</div>` : ''}</div>`;
}
ACT.fobsc = el => { S.filters.obs = Object.assign({}, S.filters.obs, {cycle: el.value}); render(); };
ACT.fobsi = el => { S.filters.obs = Object.assign({}, S.filters.obs, {ind: el.value}); render(); };
FORM.obs = async o => {
  if (!o.direct) { toast('اكتب الدليل المباشر.'); return false; }
  const l = D.lessons.find(x => x.id === o.lessonId);
  const custom = {}; (S.P.customObsFields || []).forEach((x, i) => { if (o['cf_' + i]) custom[x] = o['cf_' + i]; });
  const data = {cycleId: o.cycleId, lessonId: o.lessonId || '', lessonVersion: l ? (l.version || 1) : 1, focus: o.focus, indicator: o.indicator, direct: o.direct, interpretation: o.interpretation, tag: o.tag, time: o.time};
  if (mod('solo')) data.soloLevel = o.soloLevel || '';
  if (Object.keys(custom).length) data.custom = custom;
  if (editing('observations')) { if (!Object.keys(custom).length) data.custom = {}; return saveEdit(data); }
  const id = await addDoc('observations', data); if (!id) return false;
  S.obsKeep = {cycleId: o.cycleId, lessonId: o.lessonId, indicator: o.indicator}; toast('حُفظ الدليل ' + shortId('O', id));
};

/* ---------- improvement and reflection ---------- */
const DEC_TYPES = ['تعديل مهمة', 'تعديل سؤال', 'تعديل تسلسل الدرس', 'تعديل الزمن', 'تعديل أداة تقييم', 'تعديل الموارد', 'أخرى'];
V.improve = () => {
  if (!S.P) return head('التحسين والتأمل') + needProject();
  const t = curTab('improve', 'decisions'); const c = curCycle();
  let body = '';
  if (t === 'meetings') { const e = editing('meetings'); body = `<form data-form="meeting" class="panel"><h2>${e ? 'تعديل المحضر' : 'اجتماع جديد'}</h2>${e ? editBanner('هذا المحضر', e) : ''}<div class="grid">${field('التاريخ', inp('date', e ? e.date : today(), 'type="date" required'))}${field('الدورة', cycleSelect('cycleId', e && e.cycleId))}</div>
    ${field('جدول الأعمال', area('agenda', e ? e.agenda : 'عرض الأدلة\nالبحث عن نمط\nقرارات التحسين\nالمهام', 'rows="4"'))}${field('الحضور', checks('attendees', memberOpts(), e ? e.attendees : D.members.map(m => m.id)))}
    ${field('ملخص النقاش', area('notes', e ? e.notes : '', 'rows="4" placeholder="ما الأدلة التي عُرضت؟ وما الأنماط التي ظهرت؟"'))}${field('المهام والمسؤوليات', area('tasks', e ? e.tasks : '', 'rows="3" placeholder="المهمة · المسؤولة · الموعد"'))}<div class="row"><button class="btn" type="submit">${e ? 'حفظ التعديل' : 'حفظ المحضر'}</button>${e ? '<button type="button" class="btn ghost" data-act="canceledit">إلغاء التعديل</button>' : ''}</div></form>
    <section class="panel"><div class="row between"><h2>المحاضر</h2><button class="btn ghost small" data-act="xlsxlist" data-c="meetings">Excel</button></div><div class="ledger">${D.meetings.slice().sort(byNew).map(m => `<div class="rec"><div class="meta"><b>${esc(shortId('M', m.id))}</b><span>${esc(fmtDate(m.date))}</span><span>${esc(cycleLabel(D.cycles.find(x => x.id === m.cycleId)))}</span><span>${(m.attendees || []).length} حاضر</span>${recTools('meetings', m)}</div><div class="body">${esc(m.notes || '')}</div>${m.tasks ? `<div class="small muted">المهام: ${esc(m.tasks)}</div>` : ''}</div>`).join('') || empty('لا محاضر بعد.')}</div></section>`; }
  if (t === 'decisions') { const e = editing('decisions'); const cc = (e && D.cycles.find(x => x.id === e.cycleId)) || c; const obs = inCycle(D.observations, cc).sort(byNew).slice(0, 30); const ls = lessonsOfCycle(cc); const ev = new Set((e && e.evidenceIds) || []);
    body = `<form data-form="decision" class="panel"><h2>${e ? 'تعديل قرار التحسين' : 'قرار تحسين'}</h2>${e ? editBanner('هذا القرار', e) : ''}<p class="small muted">كل قرار يُبنى على دليل. اختر الأدلة من ملاحظات هذه الدورة، ثم اكتب القرار وسببه. يعتمده قائد الفريق أو الميسّر.</p>
    <div class="grid">${field('الدورة', cycleSelect('cycleId', e && e.cycleId))}${field('الدرس', sel('lessonId', ls.map(l => [l.id, lessonLabel(l)]), e ? e.lessonId : '', '—'))}${field('الاجتماع', sel('meetingId', D.meetings.slice().sort(byNew).map(m => [m.id, shortId('M', m.id) + ' · ' + fmtDate(m.date)]), e ? e.meetingId : '', '—'))}${field('نوع التعديل', sel('type', DEC_TYPES, e ? e.type : ''))}</div>
    ${obs.length ? field('الأدلة التي بُني عليها القرار', `<div class="ledger" style="max-height:260px;overflow:auto">${obs.map(o => `<label class="rec" style="flex-direction:row;gap:8px"><input type="checkbox" name="evidenceIds" value="${esc(o.id)}"${ev.has(o.id) ? ' checked' : ''}><span class="small"><b>${esc(shortId('O', o.id))}</b> ${esc(String(o.direct).slice(0, 120))}</span></label>`).join('')}</div>`) : '<div class="note">لا ملاحظات في هذه الدورة بعد. يمكنك كتابة الدليل نصًّا.</div>'}
    ${field('الدليل باختصار', area('evidenceText', e ? e.evidenceText : '', 'rows="2" placeholder="مثال: 5 من 8 ملاحظات أظهرت أن المتعلمين يتوقفون عند الخطوة الثانية"'))}
    ${field('القرار', area('decision', e ? e.decision : '', 'rows="2" required'))}${field('السبب والبدائل التي نوقشت', area('rationale', e ? e.rationale : '', 'rows="2"'))}<div class="row"><button class="btn" type="submit">${e ? 'حفظ التعديل' : 'حفظ القرار'}</button>${e ? '<button type="button" class="btn ghost" data-act="canceledit">إلغاء التعديل</button>' : ''}</div></form>
    <section class="panel"><div class="row between"><h2>القرارات</h2><button class="btn ghost small" data-act="xlsxlist" data-c="decisions">Excel</button></div><div class="ledger">${D.decisions.slice().sort(byNew).map(decCard).join('') || empty('لا قرارات بعد.')}</div></section>`; }
  if (t === 'reflections') { const e = editing('reflections'); body = `<form data-form="reflection" class="panel"><h2>${e ? 'تعديل التأمل' : 'تأمل'}</h2>${e ? editBanner('هذا التأمل', e) : ''}<div class="grid">${field('الدورة', cycleSelect('cycleId', e && e.cycleId))}${mod('pd') ? field('ساعات التطوير المهني في هذه الدورة', inp('hours', e ? e.hours : '', 'type="number" min="0" step="0.5"')) : ''}</div>
    ${field('ما الذي تعلّمته عن تفكير المتعلمين؟', area('learned', e ? e.learned : '', 'rows="3" required'))}${field('ما الذي سأغيّره في تدريسي؟', area('change', e ? e.change : '', 'rows="3"'))}<div class="row"><button class="btn" type="submit">${e ? 'حفظ التعديل' : 'حفظ التأمل'}</button>${e ? '<button type="button" class="btn ghost" data-act="canceledit">إلغاء التعديل</button>' : ''}</div></form>
    <section class="panel"><div class="row between"><h2>التأملات</h2><button class="btn ghost small" data-act="xlsxlist" data-c="reflections">Excel</button></div><div class="ledger">${D.reflections.slice().sort(byNew).map(r => `<div class="rec"><div class="meta"><b>${esc(memberName(r.createdBy))}</b><span>${esc(cycleLabel(D.cycles.find(x => x.id === r.cycleId)))}</span><span>${esc(fmtDate(r.createdAt))}</span>${r.hours ? pill(r.hours + ' ساعة') : ''}${recTools('reflections', r)}</div><div class="body">${esc(r.learned)}</div>${r.change ? `<div class="small muted">سأغيّر: ${esc(r.change)}</div>` : ''}</div>`).join('') || empty('لا تأملات بعد.')}</div></section>`; }
  return `${head('التحسين والتأمل', 'من الدليل إلى قرار التحسين: نناقش الأدلة في الاجتماع، ونتخذ قرارات مربوطة بها، ونكتب ما تعلّمناه.')}${tabs('improve', [['decisions', 'قرارات التحسين'], ['meetings', 'الاجتماعات'], ['reflections', 'التأملات']])}${body}`;
};
function decCard(d) {
  const st = d.status || 'proposed';
  return `<div class="rec"><div class="meta"><b>${esc(shortId('D', d.id))}</b><span>${esc(cycleLabel(D.cycles.find(x => x.id === d.cycleId)))}</span>${pill(Object.fromEntries(DECISION_STATUS)[st], st === 'proposed' ? 'warn' : 'good')}${d.type ? pill(d.type) : ''}<span>${esc(memberName(d.createdBy))}</span>${recTools('decisions', d)}</div>
  <div class="body"><b>${esc(d.decision)}</b></div>${d.rationale ? `<div class="small">السبب: ${esc(d.rationale)}</div>` : ''}
  <div class="small muted">الدليل: ${esc((d.evidenceIds || []).map(x => shortId('O', x)).join('، '))} ${esc(d.evidenceText || '')}</div>
  ${isManager() ? `<div class="row">${st === 'proposed' ? `<button class="btn small" data-act="decst" data-id="${esc(d.id)}" data-st="approved">اعتماد القرار</button>` : ''}${st === 'approved' ? `<button class="btn ghost small" data-act="decst" data-id="${esc(d.id)}" data-st="done">نُفّذ</button>` : ''}</div>` : ''}</div>`;
}
ACT.decst = async b => { if (await updDoc('decisions', b.dataset.id, {status: b.dataset.st, [b.dataset.st + 'By']: ME.uid, [b.dataset.st + 'At']: nowIso()})) toast(b.dataset.st === 'approved' ? 'اعتُمد القرار.' : 'سُجّل التنفيذ.'); };
FORM.meeting = async o => { if (editing('meetings')) return saveEdit({date: o.date, cycleId: o.cycleId, agenda: o.agenda, attendees: o.attendees || [], notes: o.notes, tasks: o.tasks}); const id = await addDoc('meetings', {date: o.date, cycleId: o.cycleId, agenda: o.agenda, attendees: o.attendees || [], notes: o.notes, tasks: o.tasks}); if (id) toast('حُفظ المحضر ' + shortId('M', id)); return !!id; };
FORM.decision = async o => { if (!o.decision) { toast('اكتب القرار.'); return false; } if (!(o.evidenceIds || []).length && !o.evidenceText) { toast('القرار يحتاج دليلًا: اختر ملاحظة أو اكتب الدليل.'); return false; } if (editing('decisions')) return saveEdit({cycleId: o.cycleId, lessonId: o.lessonId, meetingId: o.meetingId, type: o.type, evidenceIds: o.evidenceIds || [], evidenceText: o.evidenceText, decision: o.decision, rationale: o.rationale}); const id = await addDoc('decisions', {cycleId: o.cycleId, lessonId: o.lessonId, meetingId: o.meetingId, type: o.type, evidenceIds: o.evidenceIds || [], evidenceText: o.evidenceText, decision: o.decision, rationale: o.rationale, status: 'proposed'}); if (id) toast('حُفظ القرار ' + shortId('D', id)); return !!id; };
FORM.reflection = async o => { if (editing('reflections')) return saveEdit({cycleId: o.cycleId, learned: o.learned, change: o.change, hours: o.hours || ''}); const id = await addDoc('reflections', {cycleId: o.cycleId, learned: o.learned, change: o.change, hours: o.hours || ''}); if (id) toast('حُفظ التأمل.'); return !!id; };

const SOLO_EX = {
  'الكيمياء': ['لماذا نغيّر المعاملات لا الصيغ عند موازنة المعادلة؟', ['«لأن المعلمة قالت»', '«لأن الأرقام يجب أن تتساوى»', '«الذرات لا تفنى، ونضرب المعامل، والطرفان متساويان»', '«لأن الذرات لا تفنى، فعدد كل نوع يتساوى في الطرفين، لذلك نغيّر المعاملات لا الصيغ؛ تغيير الصيغة يغيّر المادة نفسها»', '«القاعدة نفسها تفسّر لماذا تبدو كتلة الورق ناقصة بعد احتراقه: خرجت الذرات غازات»']],
  'الرياضيات': ['في حل 2س + 3 = 11، لماذا نطرح 3 من الطرفين؟', ['«لأن هذه هي الطريقة»', '«لنتخلّص من 3»', '«نطرح 3، والطرفان متساويان، ونريد س وحدها»', '«المعادلة ميزان: ما نفعله بطرف نفعله بالآخر ليبقى التساوي، فنطرح 3 من الطرفين لتبقى 2س وحدها»', '«المبدأ نفسه يفسّر لماذا نقسم الطرفين على 2، ولماذا تنعكس إشارة المتباينة عند الضرب في سالب»']],
  'الفيزياء': ['ماذا يعني ميل منحنى السرعة–الزمن؟', ['«خط مائل»', '«هو التسارع»', '«الميل تغيّر الصادات على السينات، والسرعة تزيد، وفيه تسارع»', '«الميل هو مقدار تغيّر السرعة في كل ثانية، لذلك هو التسارع؛ وكلما زاد الميل تغيّرت السرعة أسرع»', '«وبالمنطق نفسه: ميل منحنى الموقع–الزمن هو السرعة»']],
  'التقنية الرقمية': ['لماذا نضع الشرط قبل التكرار في الخوارزمية؟', ['«لأن البرنامج يطلب ذلك»', '«حتى يعمل البرنامج»', '«الشرط يفحص، والتكرار يعيد، والترتيب مهم»', '«الشرط يقرّر هل نستمر، فلو جاء بعد التكرار لنُفّذت الخطوة مرة زائدة حتى لو كان الشرط غير متحقق»', '«الفكرة نفسها تفسّر الفرق بين while و do-while ومتى نختار كلًا منهما»']],
  'العلوم': ['لماذا تتكوّن قطرات ماء على سطح كوب بارد؟', ['«لأن الكوب مبلول»', '«بسبب التكاثف»', '«في الهواء بخار، والكوب بارد، والبخار يصير ماء»', '«الهواء الملامس للكوب يبرد، فيتكاثف بخار الماء الذي فيه قطرات على السطح»', '«السبب نفسه يفسّر الندى صباحًا وتكوّن الغيوم في طبقات الجو الباردة»']],
  'الأحياء': ['لماذا تتطابق الخليتان الناتجتان من الانقسام المتساوي؟', ['«لأنهما خليتان»', '«لأن الكروموسومات تتضاعف»', '«تتضاعف الكروموسومات، وتنفصل، وتتكوّن خليتان»', '«تتضاعف الكروموسومات قبل الانقسام، ثم تذهب كل نسخة إلى قطب، فتأخذ كل خلية نسخة كاملة مطابقة»', '«ولهذا يختلف الانقسام المنصّف: تنفصل فيه أزواج الكروموسومات فتأخذ كل خلية نصف العدد»']],
  'علم الأرض والفضاء': ['لماذا تكثر الزلازل عند حدود الصفائح؟', ['«لأن الأرض تهتز»', '«لأن الصفائح تتحرك»', '«الصفائح تتحرك وتتصادم وتحدث زلازل»', '«عند الحد تحتك الصفائح فيتراكم الضغط في الصخور، ثم ينطلق فجأة فيحدث الزلزال»', '«وبالسبب نفسه تتكوّن البراكين والجبال على الحدود نفسها»']],
  'اللغة العربية': ['ما أثر التشبيه في البيت على المعنى؟', ['«البيت جميل»', '«فيه تشبيه»', '«فيه تشبيه، والمشبّه به قوي، والشاعر حزين»', '«شبّه الشاعر حزنه بالليل الطويل، فأظهر ثقله وامتداده، فقوّى شعور الحزن في البيت»', '«تحكم على صورة جديدة في نص آخر بالمعيار نفسه: ماذا أضافت إلى المعنى؟»']],
  'اللغة الإنجليزية': ['What is the main idea of the paragraph, and how do you know?', ['"I don\'t know"', '"Plastic"', '"Plastic is bad. It is in the sea. Animals eat it."', '"The main idea is that plastic harms sea life, because the writer shows animals eating it and gives numbers to support it."', '"I can find the main idea of a new article the same way: topic + what the writer says about it + evidence."']],
  'الدراسات الإسلامية': ['ما وجه الدلالة من الدليل على الحكم؟', ['لا تجيب، أو تعيد نص السؤال', 'تذكر الحكم فقط', 'تذكر الحكم وتذكر الدليل، دون أن تربط بينهما', 'تربط لفظًا محدّدًا في الدليل بالحكم، وتبيّن كيف دلّ عليه', 'تطبّق الطريقة نفسها على مسألة جديدة لم تُدرس']],
  'الدراسات الاجتماعية': ['لماذا تنشأ المدن غالبًا قرب الأنهار والسواحل؟', ['«صدفة»', '«بسبب الماء»', '«الماء، والزراعة، والنقل»', '«الماء يسمح بالزراعة، والزراعة توفّر الغذاء، والنقل المائي يسهّل التجارة، فيستقر الناس وتنمو المدينة»', '«وتفسّر بالطريقة نفسها لماذا تنشأ مدن اليوم قرب الطرق السريعة والموانئ»']],
  'المهارات الحياتية': ['لماذا نبدأ الميزانية بالمصروفات الضرورية؟', ['«لأنها أول القائمة»', '«لأنها مهمة»', '«الضروريات مهمة، والدخل محدود، والكماليات تنتظر»', '«لأن الدخل محدود، فلو صرفنا على الكماليات أولًا قد لا يبقى ما يغطي الضروريات، لذلك نرتّب بالأولوية»', '«المبدأ نفسه ينفع في تنظيم الوقت: المهم والعاجل أولًا»']],
  'التفكير الناقد': ['هل الحجة مقنعة؟ ولماذا؟', ['«نعم»', '«لا، لأنها خطأ»', '«فيها مقدمة ونتيجة، والمقدمة غير صحيحة»', '«النتيجة تعتمد على مقدمة بلا دليل، فإن سقطت المقدمة سقطت النتيجة، لذلك الحجة ضعيفة»', '«تكشف المغالطة نفسها في إعلان أو خبر جديد»']],
  'التربية الفنية': ['لماذا استخدم الفنان الألوان الباردة في العمل؟', ['«لأنه يحبها»', '«لأنها هادئة»', '«الألوان زرقاء، والجو هادئ، والموضوع البحر»', '«الألوان الباردة توحي بالهدوء والبعد، وهذا يناسب فكرة العزلة التي يعبّر عنها العمل»', '«تختار ألوان عملها الخاص بناء على الإحساس الذي تريد إيصاله»']],
  'التربية البدنية': ['متى تختارين التمرير القصير بدل الطويل؟', ['«دائمًا»', '«عندما تكون الزميلة قريبة»', '«القصير أدق، والطويل أسرع، والمنافسة قريبة»', '«عندما تكون المنافسة قريبة، لأن القصير أدق وأصعب في القطع، فنحافظ على الكرة»', '«تطبّق المبدأ نفسه في لعبة أخرى: الدقة أولًا حين يكون الضغط عاليًا»']]};
const SOLO_GENERIC = ['سؤال «لماذا؟» أو «فسّري» في درسك', ['لا تجيب، أو تعيد نص السؤال', 'تذكر معلومة واحدة صحيحة', 'تذكر عدة معلومات صحيحة دون ربط بينها', 'تربط المعلومات: «لأن… فـ… لذلك…»', 'تنقل الفكرة إلى مثال أو موقف جديد لم يُشرح']];

/* =========================================================
   Optional modules: frameworks library, SOLO, the AI assistant
   and the researcher's space. None of them is needed to run a
   project; each appears only when the project switches it on.
   ========================================================= */
COLLS.push('soloscores'); D.soloscores = [];
const soloOf = sj => SOLO_EX[sj] || SOLO_GENERIC;
const SOLO_VERBS = [['1', 'يسمّي، يحدّد، يتذكّر، ينفّذ إجراءً بسيطًا'], ['2', 'يعدّد، يصف، يجمع، يصنّف، ينفّذ خطوات'], ['3', 'يفسّر، يقارن، يحلّل، يربط السبب بالنتيجة، يبرّر، يطبّق'], ['4', 'يعمّم، يتنبأ، يفترض، يقيّم، ينقل إلى موقف جديد، يصمّم']];
const isCode = s => /^[A-Za-z]{1,3}[-_]?\d{1,4}$/.test(String(s || '').trim());

/* ---------- frameworks library ---------- */
V.frameworks = () => {
  const t = curTab('fw', 'solo'); const P = S.P; const cur = P ? (P.framework || 'none') : '';
  const subs = uniq(projSubjects().concat(Object.keys(SOLO_EX)));
  const sj = S.soloSubj && subs.includes(S.soloSubj) ? S.soloSubj : (projSubjects().find(x => SOLO_EX[x]) || projSubjects()[0] || 'الرياضيات');
  const useBtn = k => P && isManager() ? (cur === k ? pill('الإطار المعتمد في مشروعك', 'good') : `<button class="btn small" data-act="usefw" data-k="${k}">اعتماده إطارًا لمشروعي</button>`) : '';
  let body = '';
  if (t === 'solo') {
    const [q, ex] = soloOf(sj); const pr = S.prac;
    body = `<section class="panel"><div class="row between"><h2>تصنيف SOLO: بنية الناتج التعليمي الملاحظ</h2>${useBtn('solo')}</div>
      <p>تصنيف وضعه Biggs وCollis (1982) يصف <b>عمق</b> الفهم الظاهر في استجابة المتعلم، لا كمية المعلومات. نستخدمه بثلاث طرق: نصمّم به نواتج الدرس وأسئلته ومهامه، ونصنّف به استجابات المتعلمين، ونقارن به عمق الفهم بين نسخة الدرس الأولى والمعدّلة.</p>
      <div class="hint" style="margin-bottom:6px">اختر المادة لترى مثالًا منها</div><div class="chips">${subs.map(n => `<button type="button" class="c" aria-pressed="${n === sj}" data-act="soloSubj" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>
      <div class="scroll"><table><thead><tr><th>المستوى</th><th>ماذا يعني</th><th>${SOLO_EX[sj] ? 'مثال: ' + esc(q) : 'كيف يبدو في الاستجابة'}</th></tr></thead><tbody>${SOLO.map((s, i) => `<tr${s[0] === '3' ? ' class="mine"' : ''}><td><b>${s[0]}</b> ${esc(s[1])}</td><td>${esc(s[2])}</td><td>${esc(ex[i])}</td></tr>`).join('')}</tbody></table></div>
      ${SOLO_EX[sj] ? '' : '<p class="small muted">لا يوجد مثال جاهز لهذه المادة. اكتب سؤال «لماذا؟» من درسك، وضع مع الفريق استجابة متوقعة لكل مستوى.</p>'}</section>
    <section class="panel"><h2>التصحيح في ثلاث خطوات</h2><ol style="margin:0;padding-inline-start:22px;display:flex;flex-direction:column;gap:6px"><li>هل في الاستجابة فكرة صحيحة؟ لا ← <b>0</b>. فكرة واحدة ← <b>1</b>.</li><li>أكثر من فكرة: هل يربط بينها بـ«لأن… لذلك»؟ لا ← <b>2</b>. نعم ← <b>3</b>.</li><li>هل ينقل الفكرة أو يعمّمها على موقف لم يُشرح؟ نعم ← <b>4</b>.</li></ol>
      <p class="small muted">قبل التصحيح يصحّح عضوان العينة نفسها (5 استجابات مثلًا) منفردين ثم يقارنان، حتى يتفق الفريق على معنى كل مستوى.</p></section>
    <section class="panel"><h2>مصفوفة التخطيط: أفعال كل مستوى</h2><p class="small muted">الفعل في الناتج يحدد مستواه. إن كان الهدف «علائقي» فيجب أن يوجد في الدرس سؤال ومهمة ختامية عند المستوى 3 على الأقل.</p>
      <div class="scroll"><table><thead><tr><th>المستوى</th><th>أفعال الناتج والأسئلة</th><th>شكل المهمة</th></tr></thead><tbody>${SOLO_VERBS.map((v, i) => `<tr><td><b>${v[0]}</b> ${esc(SOLO[Number(v[0])][1])}</td><td>${esc(v[1])}</td><td class="small">${esc(['سؤال تذكر أو إجراء واحد', 'قائمة أو وصف أو خطوات', 'تفسير «لماذا» أو مقارنة أو تبرير', 'موقف جديد: تنبؤ، تعميم، تصميم'][i])}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="panel"><h2>تدريب على التصنيف</h2>${pr ? `<div class="mini"><b>${esc(soloOf(pr.sj)[0])}</b><span>الاستجابة: ${esc(soloOf(pr.sj)[1][pr.i])}</span></div>
      <div class="row">${SOLO.map(s => `<button class="btn ${pr.ans === s[0] ? '' : 'ghost'} small" data-act="pracans" data-v="${s[0]}"${pr.ans != null ? ' disabled' : ''}>${s[0]} · ${esc(s[1])}</button>`).join('')}</div>
      ${pr.ans != null ? (Number(pr.ans) === pr.i ? `<div class="ok">صحيح: ${esc(soloName(pr.i))}.</div>` : `<div class="note">المستوى الصحيح: ${esc(soloName(pr.i))}. ${esc(SOLO[pr.i][2])}.</div>`) : ''}
      <div class="row"><button class="btn small" data-act="prac">استجابة أخرى</button><span class="small muted">النتيجة: ${S.pracScore ? S.pracScore.ok + ' من ' + S.pracScore.n : '—'}</span></div>` : `<p class="small">تظهر استجابة متعلم من مادة عشوائية، وتختار مستواها. تدريب سريع قبل أول تصحيح جماعي.</p><button class="btn small" data-act="prac">ابدأ التدريب</button>`}</section>`;
  }
  if (t === 'criteria') {
    const cr = (P && P.criteria) || [];
    body = `<section class="panel"><div class="row between"><h2>معايير مرنة يحددها الفريق</h2>${useBtn('criteria')}</div>
      <p>بعض الفرق لا تحتاج تصنيفًا بمستويات. يكفي أن تتفق على معايير واضحة لما تبحث عنه في عمل المتعلمين، مثل: «يستخدم دليلًا من النص» أو «يشرح خطوات الحل بلغته». تظهر المعايير مؤشراتٍ في بطاقة الملاحظة.</p>
      ${P ? `<div class="ledger">${cr.map((c, i) => `<div class="rec"><div class="row between"><b>${esc(c.name)}</b>${isManager() ? `<span class="row"><button class="btn ghost small" data-act="editcrit" data-i="${i}">تعديل</button><button class="btn ghost small" data-act="delcrit" data-i="${i}">حذف</button></span>` : ''}</div>${S.critEdit === i ? `<form data-form="critedit" data-i="${i}" class="grid wide">${field('المعيار', inp('name', c.name, 'required'))}${field('كيف يبدو عند تحققه', inp('desc', c.desc))}<div class="row"><button class="btn small" type="submit">حفظ</button><button type="button" class="btn ghost small" data-act="editcrit" data-i="-1">إلغاء</button></div></form>` : (c.desc ? `<div class="small">${esc(c.desc)}</div>` : '')}</div>`).join('') || empty('لا معايير بعد.')}</div>
      ${isManager() ? `<form data-form="crit" class="stepsec"><div class="grid wide">${field('المعيار', inp('name', '', 'required'))}${field('كيف يبدو عند تحققه', inp('desc', ''))}</div><div><button class="btn small" type="submit">إضافة المعيار</button></div></form>` : ''}` : '<p class="small muted">افتح مشروعًا لتحديد معاييره.</p>'}</section>`;
  }
  if (t === 'none') body = `<section class="panel"><div class="row between"><h2>العمل دون إطار</h2>${useBtn('none')}</div>
    <p>بحث الدرس لا يشترط إطارًا تصنيفيًا. يكفي أن يحدد الفريق هدفًا بعيدًا ومشكلة تعلم، ثم يجمع أدلة مباشرة على تفكير المتعلمين ويناقشها ويتخذ قرارات تحسين مبنية عليها. المؤشرات في بطاقة الملاحظة تُعدّل من إعدادات المشروع.</p></section>`;
  return `${head('مكتبة الأطر', 'أطر تساعد الفريق على وصف تعلّم المتعلمين بلغة مشتركة. يختار كل مشروع إطاره، أو يعمل دون إطار.')}${tabs('fw', [['solo', 'تصنيف SOLO'], ['criteria', 'معايير الفريق'], ['none', 'دون إطار']])}${body}`;
};
ACT.soloSubj = b => { S.soloSubj = b.dataset.v; render(); };
ACT.prac = () => { const subs = Object.keys(SOLO_EX); const sj = subs[Math.floor(Math.random() * subs.length)]; S.prac = {sj, i: Math.floor(Math.random() * 5), ans: null}; render(); };
ACT.pracans = b => { const p = S.prac; if (!p || p.ans != null) return; p.ans = b.dataset.v; const sc = S.pracScore || {ok: 0, n: 0}; sc.n++; if (Number(p.ans) === p.i) sc.ok++; S.pracScore = sc; render(); };
ACT.usefw = async b => { const k = b.dataset.k; const data = {framework: k}; if (k === 'solo') data.modules = Object.assign({}, S.P.modules, {solo: true}); if (k === 'criteria' && (S.P.criteria || []).length) data.indicators = uniq((S.P.indicators || []).concat(S.P.criteria.map(c => c.name))); if (await updProject(data)) toast('اعتُمد الإطار للمشروع.'); };
FORM.crit = async o => { if (!o.name) return false; const cr = (S.P.criteria || []).concat({name: o.name, desc: o.desc}); const data = {criteria: cr}; if (S.P.framework === 'criteria') data.indicators = uniq((S.P.indicators || []).concat(o.name)); if (await updProject(data)) toast('أُضيف المعيار.'); };
ACT.editcrit = b => { S.critEdit = Number(b.dataset.i); render(); };
FORM.critedit = async (o, f) => { const cr = (S.P.criteria || []).slice(); const i = Number(f.dataset.i); const old = cr[i]; cr[i] = {name: o.name, desc: o.desc}; const data = {criteria: cr}; if (old && old.name !== o.name) data.indicators = (S.P.indicators || []).map(x => x === old.name ? o.name : x); S.critEdit = null; if (await updProject(data)) toast('حُفظ المعيار.'); };
ACT.delcrit = async b => { const cr = (S.P.criteria || []).slice(); cr.splice(Number(b.dataset.i), 1); await updProject({criteria: cr}); };

/* ---------- SOLO module: depth of learning across lesson versions ---------- */
function soloDist(levels) {
  const n = levels.length; const c = [0, 0, 0, 0, 0]; levels.forEach(l => { const k = Number(l); if (k >= 0 && k <= 4) c[k]++; });
  return {n, c, mean: avg(levels.map(Number)), rel: n ? (c[3] + c[4]) / n : null};
}
function soloBars(dist) {
  if (!dist.n) return '<span class="small muted">لا بيانات.</span>';
  return `<div class="lvlbars">${SOLO.map((s, i) => `<div class="r"><span>${s[0]} · ${esc(s[1])}</span><div class="bar"><i style="width:${Math.round(dist.c[i] / dist.n * 100)}%"></i></div><span class="small">${dist.c[i]}</span></div>`).join('')}</div><p class="small muted">العدد ${dist.n} · المتوسط ${f2(dist.mean)} · علائقي فأعلى ${Math.round((dist.rel || 0) * 100)}%</p>`;
}
const soloLevelsFor = (c, version) => {
  const ex = D.soloscores.filter(s => s.cycleId === c.id && (s.lessonVersion || 1) === version).flatMap(s => Object.values(s.scores || {}));
  const ob = D.observations.filter(o => o.cycleId === c.id && (o.lessonVersion || 1) === version && o.soloLevel !== undefined && o.soloLevel !== '').map(o => o.soloLevel);
  return {ex, ob};
};
V.solo = () => {
  if (!S.P) return head('تصنيف SOLO') + needProject();
  if (!mod('solo')) return head('تصنيف SOLO') + `<section class="panel">${empty('وحدة SOLO غير مفعّلة في هذا المشروع.')}</section>`;
  const c = curCycle(); const ls = lessonsOfCycle(c);
  const v1 = c ? soloLevelsFor(c, 1) : {ex: [], ob: []}; const v2 = c ? soloLevelsFor(c, 2) : {ex: [], ob: []};
  const d1 = soloDist(v1.ex), d2 = soloDist(v2.ex); const se = editing('soloscores');
  return `${head('تصنيف SOLO في المشروع', 'نرصد مستوى كل متعلم في المهمة الختامية للدرس، ثم نقارن توزيع المستويات بين النسخة الأولى من الدرس والنسخة المعدّلة. المتعلمون برموز فقط.')}
  <section class="panel"><div class="row between">${field('الدورة', `<select data-change="lcycle">${opts(D.cycles.slice().sort((a, b) => (a.n || 0) - (b.n || 0)).map(x => [x.id, cycleLabel(x)]), c && c.id)}</select>`)}<button class="btn ghost small" data-act="go" data-v="frameworks">دليل SOLO والتدريب</button></div>
    <div class="cols"><div class="mini"><b>النسخة الأولى V1: المهمة الختامية</b>${soloBars(d1)}</div><div class="mini"><b>النسخة المعدّلة V2: المهمة الختامية</b>${soloBars(d2)}</div></div>
    ${d1.n && d2.n ? `<div class="${d2.mean > d1.mean ? 'ok' : 'note'}">تغيّر المتوسط من ${f2(d1.mean)} إلى ${f2(d2.mean)}، ونسبة «علائقي فأعلى» من ${Math.round(d1.rel * 100)}% إلى ${Math.round(d2.rel * 100)}%. هذه قراءة وصفية للفريق، وليست اختبارًا إحصائيًا.</div>` : '<p class="small muted">تظهر المقارنة عندما يُرصد نشاط الختام في النسختين.</p>'}
    ${(v1.ob.length || v2.ob.length) ? `<p class="small muted">ومن بطاقات الملاحظة: ${v1.ob.length} استجابة مصنّفة في V1 بمتوسط ${f2(avg(v1.ob.map(Number)))}، و${v2.ob.length} في V2 بمتوسط ${f2(avg(v2.ob.map(Number)))}.</p>` : ''}</section>
  <form data-form="soloscore" class="panel"><h2>${se ? 'تعديل الرصد' : 'رصد مستويات المهمة الختامية'}</h2>${se ? editBanner('هذا الرصد', se) : ''}
    <div class="grid">${field('الدرس', sel('lessonId', (se ? D.lessons.filter(l => l.cycleId === se.cycleId) : ls).map(l => [l.id, lessonLabel(l)]), se ? se.lessonId : '', ls.length || se ? undefined : 'لا دروس في هذه الدورة'))}${field('الصف أو الشعبة (رمز)', inp('group', se ? se.group : '', 'placeholder="مثال: 1/3"'))}${field('التاريخ', inp('date', se ? se.date : today(), 'type="date"'))}</div>
    ${field('المستويات', area('scores', se ? Object.entries(se.scores || {}).map(([k, v]) => k + ' ' + v).join('\n') : '', 'rows="6" dir="ltr" placeholder="S001 3\nS002 2\nS003 1"'), 'سطر لكل متعلم: الرمز ثم المستوى من 0 إلى 4. لا تكتب أسماء.')}
    <div class="row"><button class="btn" type="submit">${se ? 'حفظ التعديل' : 'حفظ الرصد'}</button>${se ? '<button type="button" class="btn ghost" data-act="canceledit">إلغاء التعديل</button>' : ''}</div></form>
  <section class="panel"><h2>الرصد المحفوظ</h2><div class="ledger">${D.soloscores.slice().sort(byNew).map(s => { const l = D.lessons.find(x => x.id === s.lessonId); const dd = soloDist(Object.values(s.scores || {})); return `<div class="rec"><div class="meta"><b>${esc(lessonLabel(l))}</b><span>${esc(cycleLabel(D.cycles.find(x => x.id === s.cycleId)))}</span><span>${esc(s.group || '')}</span><span>${esc(fmtDate(s.date))}</span><span>${dd.n} متعلم · متوسط ${f2(dd.mean)}</span>${recTools('soloscores', s)}</div></div>`; }).join('') || empty('لا رصد بعد.')}</div></section>
  <section class="panel"><h2>مواءمة الدروس</h2><div class="ledger">${ls.map(l => `<div class="rec"><b>${esc(lessonLabel(l))}</b>${soloAlignment(l) || '<span class="small muted">لم تُصنّف أسئلته بعد.</span>'}</div>`).join('') || empty('لا دروس.')}</div></section>`;
};
function parseScores(txt, max = 4) {
  const out = {}; const bad = [];
  String(txt || '').split(/\n/).map(x => x.trim()).filter(Boolean).forEach(line => {
    const p = line.split(/[\s,؛;:\t]+/).filter(Boolean); const code = (p[0] || '').toUpperCase();
    const nums = p.slice(1).map(Number);
    if (!isCode(code) || !nums.length || nums.some(n => isNaN(n) || n < 0 || n > max)) { bad.push(line); return; }
    out[code] = nums.length === 1 ? nums[0] : nums;
  });
  return {out, bad};
}
FORM.soloscore = async o => {
  const l = D.lessons.find(x => x.id === o.lessonId); if (!l) { toast('اختر الدرس.'); return false; }
  const {out, bad} = parseScores(o.scores, 4);
  if (bad.length) { toast('سطر غير صحيح: «' + bad[0] + '». اكتب رمزًا مثل S001 ثم مستوى من 0 إلى 4.'); return false; }
  if (Object.values(out).some(Array.isArray)) { toast('اكتب مستوى واحدًا لكل متعلم.'); return false; }
  if (!Object.keys(out).length) { toast('لا مستويات.'); return false; }
  if (editing('soloscores')) return saveEdit({cycleId: l.cycleId, lessonId: l.id, lessonVersion: l.version || 1, group: o.group, date: o.date, scores: out});
  const id = await addDoc('soloscores', {cycleId: l.cycleId, lessonId: l.id, lessonVersion: l.version || 1, group: o.group, date: o.date, scores: out});
  if (id) toast('حُفظ رصد ' + Object.keys(out).length + ' متعلم.'); return !!id;
};
ACT.delsolo = async b => { if (b.dataset.sure) { await delDoc('soloscores', b.dataset.id); return; } b.dataset.sure = 1; b.textContent = 'اضغط للتأكيد'; };

/* ---------- AI assistant: prompt builder + human judgment log ---------- */
const AI_PURPOSES = [
  ['tasks', 'اقتراح مهام وأسئلة', 'اقترح 3 مهام و6 أسئلة متدرجة لهذا الدرس، مع الاستجابات المتوقعة والأخطاء الشائعة لكل سؤال.'],
  ['alt', 'بدائل تدريسية', 'اقترح بديلين مختلفين لتدريس الجزء الذي تعثر فيه المتعلمون، مع مزايا كل بديل وحدوده.'],
  ['check', 'فحص اتساق الخطة', 'افحص اتساق خطة الدرس: هل تقيس الأسئلة والمهام نواتج التعلم المكتوبة؟ وأين الفجوات؟ لا تُعد كتابة الخطة.'],
  ['evidence', 'قراءة أدلة الملاحظة', 'اقرأ أدلة الملاحظة التالية واقترح أنماطًا محتملة في تفكير المتعلمين، مع التمييز بين ما تدل عليه الأدلة مباشرة وما هو تفسير.'],
  ['solo', 'تصنيف الأسئلة وفق SOLO', 'صنّف كل سؤال في الخطة وفق مستويات SOLO (1–4) مع التعليل، واقترح سؤالًا عند المستوى العلائقي وآخر عند التجريدي الممتد إن غابا.']];
const AI_JUDGE = [['accept', 'قبول'], ['modify', 'قبول بتعديل'], ['reject', 'رفض']];
function aiPrompt(o) {
  const P = S.P; const pur = AI_PURPOSES.find(x => x[0] === o.purpose) || AI_PURPOSES[0];
  const l = D.lessons.find(x => x.id === o.lessonId); const c = D.cycles.find(x => x.id === o.cycleId);
  const parts = [`أنت مساعد لفريق بحث درس من المعلمين. السياق: المرحلة ${P.stage || '—'}${P.grade ? '، الصف ' + P.grade : ''}، المادة ${projSubjects().join(' و') || '—'}.`];
  if (P.goals && P.goals.longTerm) parts.push('الهدف البعيد للفريق: ' + P.goals.longTerm);
  if (P.problem && P.problem.statement) parts.push('مشكلة التعلم: ' + P.problem.statement);
  if (c && c.topic) parts.push('موضوع الدورة: ' + c.topic);
  if (l) { parts.push('خطة الدرس الحالية:'); [['title', 'العنوان']].concat(LESSON_FIELDS).forEach(([k, lb]) => { if (l[k]) parts.push(`- ${lb}: ${l[k]}`); }); if (mod('solo') && l.solo) { parts.push(`- مستوى SOLO المستهدف: ${soloName(l.solo.outcomeLevel)}`); (l.solo.questions || []).forEach((q, i) => parts.push(`  سؤال ${i + 1} (${soloName(q.l)}): ${q.t}`)); } }
  if (o.purpose === 'evidence' && c) { const ob = inCycle(D.observations, c).slice(0, 25); if (ob.length) { parts.push('أدلة الملاحظة (رموز لا أسماء):'); ob.forEach(x => parts.push(`- [${x.indicator || ''}] ${x.direct}`)); } }
  if (mod('solo') && o.purpose !== 'solo') parts.push('يستخدم الفريق تصنيف SOLO (ما قبل البنية، أحادي، متعدد، علائقي، تجريدي ممتد)؛ اذكر مستوى كل سؤال تقترحه.');
  parts.push('المطلوب: ' + pur[2]); if (o.extra) parts.push('ملاحظة من الفريق: ' + o.extra);
  parts.push('اكتب بالعربية، بإيجاز، بما يناسب هذه المرحلة. هذه مقترحات يراجعها الفريق ولا تُعتمد آليًا.');
  return parts.join('\n');
}
const privacyIssue = t => /@|\b\d{9,}\b/.test(t) ? 'النص يحتوي بريدًا أو رقمًا طويلًا (قد يكون هوية أو جوالًا). احذفه قبل الإرسال.' : '';
V.ai = () => {
  if (!S.P) return head('مساعد الذكاء الاصطناعي') + needProject();
  if (!mod('ai')) return head('مساعد الذكاء الاصطناعي') + `<section class="panel">${empty('الوحدة غير مفعّلة في هذا المشروع.')}</section>`;
  const c = curCycle(); const ls = lessonsOfCycle(c); const d = S.aiDraft || {purpose: 'tasks', cycleId: c && c.id, lessonId: (ls[0] || {}).id};
  const purposes = AI_PURPOSES.filter(p => p[0] !== 'solo' || mod('solo'));
  const log = D.ai.slice().sort(byNew); const cnt = k => log.filter(x => x.judgment === k).length;
  return `${head('مساعد الذكاء الاصطناعي', 'يبني لك طلبًا (برومبت) من سياق المشروع والدرس دون أي بيانات شخصية، فتنسخه إلى أداة الذكاء الاصطناعي التي تستخدمها، ثم تسجّل ما اقترحته وحكم الفريق عليه: قبول أو تعديل أو رفض، مع السبب.')}
  <form data-form="aibuild" class="panel"><h2>1. ابنِ الطلب</h2><div class="grid">${field('الغرض', sel('purpose', purposes.map(p => [p[0], p[1]]), d.purpose))}${field('الدورة', cycleSelect('cycleId', d.cycleId))}${field('الدرس', sel('lessonId', ls.map(l => [l.id, lessonLabel(l)]), d.lessonId, '—'))}</div>
    ${field('إضافة من الفريق (اختياري)', area('extra', d.extra, 'rows="2" placeholder="مثال: المتعلمون يخلطون بين المفهومين"'))}<div><button class="btn" type="submit">ابنِ الطلب</button></div></form>
  ${editing('ai') ? aiEditForm(editing('ai')) : ''}
  ${d.prompt && !editing('ai') ? `<section class="panel"><h2>2. انسخ الطلب واستخدمه</h2>${privacyIssue(d.prompt) ? `<div class="note">${esc(privacyIssue(d.prompt))}</div>` : '<div class="ok">لا يحتوي الطلب أسماء أو بيانات شخصية.</div>'}<textarea id="aiPrompt" rows="10" dir="rtl">${esc(d.prompt)}</textarea>
    <div class="row"><button class="btn small" data-act="copyprompt">نسخ</button><a class="btn ghost small" target="_blank" rel="noopener" href="https://claude.ai/new?q=${encodeURIComponent(d.prompt.slice(0, 6000))}">فتح في Claude</a></div></section>
  <form data-form="ailog" class="panel"><h2>3. سجّل المقترح وحكم الفريق</h2>${field('ما اقترحه الذكاء الاصطناعي', area('output', '', 'rows="5" required placeholder="الصق المقترح هنا"'))}
    <div class="grid">${field('حكم الفريق', sel('judgment', AI_JUDGE, 'modify'))}${field('السبب', inp('reason', '', 'required placeholder="لماذا قبلناه أو عدّلناه أو رفضناه؟"'))}</div>
    ${field('النص المعتمد بعد المراجعة', area('adopted', '', 'rows="3" placeholder="ما الذي دخل الخطة فعلًا؟"'))}<div><button class="btn" type="submit">حفظ في السجل</button></div></form>` : ''}
  <section class="panel"><div class="row between"><h2>سجل الاستخدام (${log.length})</h2><button class="btn ghost small" data-act="xlsxlist" data-c="ai">Excel</button></div><div class="kpis"><div class="kpi"><b>${cnt('accept')}</b><span>قبول</span></div><div class="kpi"><b>${cnt('modify')}</b><span>قبول بتعديل</span></div><div class="kpi"><b>${cnt('reject')}</b><span>رفض</span></div></div>
    <div class="ledger">${log.map(x => `<div class="rec"><div class="meta"><b>${esc(shortId('AI', x.id))}</b><span>${esc((AI_PURPOSES.find(p => p[0] === x.purpose) || [, ''])[1])}</span><span>${esc(lessonLabel(D.lessons.find(l => l.id === x.lessonId)))}</span>${pill(Object.fromEntries(AI_JUDGE)[x.judgment] || '', x.judgment === 'reject' ? 'warn' : 'good')}<span>${esc(memberName(x.createdBy))}</span>${recTools('ai', x)}</div><div class="small">${esc(String(x.output || '').slice(0, 300))}</div><div class="small"><b>السبب:</b> ${esc(x.reason)}</div>${x.adopted ? `<div class="small"><b>المعتمد:</b> ${esc(x.adopted)}</div>` : ''}</div>`).join('') || empty('لا استخدامات مسجلة بعد.')}</div></section>`;
};
function aiEditForm(e) {
  return `<form data-form="aiedit" class="panel"><h2>تعديل سجل الذكاء الاصطناعي</h2>${editBanner('هذا السجل', e)}${field('ما اقترحه الذكاء الاصطناعي', area('output', e.output, 'rows="5" required'))}
    <div class="grid">${field('حكم الفريق', sel('judgment', AI_JUDGE, e.judgment))}${field('السبب', inp('reason', e.reason, 'required'))}</div>
    ${field('النص المعتمد بعد المراجعة', area('adopted', e.adopted, 'rows="3"'))}<div class="row"><button class="btn" type="submit">حفظ التعديل</button><button type="button" class="btn ghost" data-act="canceledit">إلغاء التعديل</button></div></form>`;
}
FORM.aiedit = async o => saveEdit({output: o.output, judgment: o.judgment, reason: o.reason, adopted: o.adopted});
FORM.aibuild = async o => { S.aiDraft = Object.assign({}, o, {prompt: aiPrompt(o)}); };
ACT.copyprompt = async () => { const t = $('#aiPrompt'); try { await navigator.clipboard.writeText(t.value); toast('نُسخ الطلب.'); } catch (x) { t.select(); toast('حدّد النص وانسخه.'); } };
FORM.ailog = async o => {
  const d = S.aiDraft || {}; if (!o.output || !o.reason) { toast('الصق المقترح واكتب سبب الحكم.'); return false; }
  const id = await addDoc('ai', {purpose: d.purpose, cycleId: d.cycleId, lessonId: d.lessonId || '', prompt: d.prompt, output: o.output, judgment: o.judgment, reason: o.reason, adopted: o.adopted});
  if (id) { S.aiDraft = null; toast('سُجّل في سجل الذكاء الاصطناعي.'); } return !!id;
};

/* ---------- researcher's space ---------- */
const RDESIGN = () => D.research.find(r => r.id === 'design') || {};
const RSCORES = () => D.research.filter(r => r.kind === 'scores');
const tTwo = (t, df) => { if (!isFinite(t) || !(df > 0)) return null; return ibeta(df / (df + t * t), df / 2, 0.5); };
function lgamma(x) { const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5]; let y = x; const tmp = x + 5.5 - (x + 0.5) * Math.log(x + 5.5); let s = 1.000000000190015; for (let j = 0; j < 6; j++) s += g[j] / ++y; return -tmp + Math.log(2.5066282746310005 * s / x); }
function betacf(x, a, b) { let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < 1e-30) d = 1e-30; d = 1 / d; let h = d; for (let m = 1; m <= 200; m++) { const m2 = 2 * m; let aa = m * (b - m) * x / ((qam + m2) * (a + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; h *= d * c; aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2)); d = 1 + aa * d; if (Math.abs(d) < 1e-30) d = 1e-30; c = 1 + aa / c; if (Math.abs(c) < 1e-30) c = 1e-30; d = 1 / d; const del = d * c; h *= del; if (Math.abs(del - 1) < 3e-12) break; } return h; }
function ibeta(x, a, b) { if (x <= 0) return 0; if (x >= 1) return 1; const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)); return x < (a + 1) / (a + b + 2) ? bt * betacf(x, a, b) / a : 1 - bt * betacf(1 - x, b, a) / b; }
const fp = p => p == null ? '—' : (p < 0.001 ? '< .001' : p.toFixed(3));
const total = v => Array.isArray(v) ? v.reduce((s, x) => s + Number(x), 0) : Number(v);
function scoreMap(measureId, groupId, time) { const r = RSCORES().find(x => x.measureId === measureId && x.groupId === groupId && x.time === time); const m = {}; if (r) Object.entries(r.data || {}).forEach(([k, v]) => { m[k] = total(v); }); return m; }
function groupStats(measureId, g) {
  const pre = scoreMap(measureId, g.id, 'pre'), post = scoreMap(measureId, g.id, 'post');
  const both = Object.keys(pre).filter(k => k in post); const gains = both.map(k => post[k] - pre[k]);
  const sdg = sd(gains); const tg = sdg ? avg(gains) / (sdg / Math.sqrt(gains.length)) : null;
  return {g, pre: Object.values(pre), post: Object.values(post), paired: both.length, gains, mg: avg(gains), sdg, t: tg, p: tg == null ? null : tTwo(tg, gains.length - 1), dz: sdg ? avg(gains) / sdg : null};
}
function welch(a, b) {
  if (a.length < 2 || b.length < 2) return null;
  const ma = avg(a), mb = avg(b), va = sd(a) ** 2, vb = sd(b) ** 2; const se = Math.sqrt(va / a.length + vb / b.length); if (!se) return null;
  const t = (ma - mb) / se; const df = (va / a.length + vb / b.length) ** 2 / ((va / a.length) ** 2 / (a.length - 1) + (vb / b.length) ** 2 / (b.length - 1));
  const sp = Math.sqrt(((a.length - 1) * va + (b.length - 1) * vb) / (a.length + b.length - 2));
  return {t, df, p: tTwo(t, df), d: sp ? (ma - mb) / sp : null};
}
V.research = () => {
  if (!S.P) return head('مساحة الباحث') + needProject();
  if (!mod('research') || !isResearcher()) return head('مساحة الباحث') + `<section class="panel">${empty('هذه المساحة لمن يحمل دور الباحث في مشروع فعّل وحدة البحث الأكاديمي.')}</section>`;
  const R = RDESIGN(); const t = curTab('res', 'design'); const groups = R.groups || []; const measures = R.measures || [];
  let body = '';
  if (t === 'design') body = `<form data-form="rdesign" class="panel"><h2>تصميم الدراسة</h2>
    ${field('عنوان الدراسة', area('title', R.title, 'rows="2"'))}${field('أسئلة البحث', area('questions', R.questions, 'rows="4" placeholder="سؤال في كل سطر"'))}
    <div class="grid">${field('المنهج', sel('method', [['qual', 'نوعي'], ['quant', 'كمي'], ['mixed', 'مختلط']], R.method || 'mixed'))}${field('التصميم الكمي', sel('quantDesign', [['none', 'لا يوجد'], ['one', 'مجموعة واحدة: قبلي وبعدي'], ['two', 'مجموعتان: تجريبية وضابطة، قبلي وبعدي']], R.quantDesign || 'none'))}${field('نوع التصميم المختلط', inp('mixedType', R.mixedType, 'placeholder="مثال: مدمج QUAN(qual)"'))}</div>
    ${field('مراحل الدراسة', area('phases', R.phases, 'rows="4" placeholder="الإعداد ← تطوير التدخل ← اختبار الفاعلية ← التحليل والدمج"'))}
    ${field('حدود الاستدلال', area('limits', R.limits, 'rows="3"'))}<div><button class="btn" type="submit">حفظ التصميم</button></div></form>
    <section class="panel"><h2>ما يصل إلى الباحث من بيانات الفريق</h2><p class="small">يحدد قائد الفريق ما يُشارَك مع مساحة الباحث من إعدادات المشروع. المشارك حاليًا: ${esc(Object.entries(S.P.researchShare || {}).filter(x => x[1]).map(x => ({lessons: 'خطط الدروس', observations: 'الملاحظات', decisions: 'القرارات', meetings: 'المحاضر', ai: 'سجل الذكاء الاصطناعي'}[x[0]])).join('، ') || 'لا شيء')}.</p>
    <div class="row">${Object.entries(S.P.researchShare || {}).filter(x => x[1]).map(x => `<button class="btn ghost small" data-act="rexport" data-c="${x[0]}">تصدير ${esc({lessons: 'الدروس', observations: 'الملاحظات', decisions: 'القرارات', meetings: 'المحاضر', ai: 'سجل الذكاء الاصطناعي'}[x[0]])} CSV</button>`).join('')}</div></section>`;
  if (t === 'groups') body = `<section class="panel"><h2>المجموعات</h2><p class="small muted">تُعرَّف المجموعات فقط إذا احتاجها التصميم. افصل الفصل التجريبي الأولي (Pilot) الذي طُوّر فيه التدخل عن مجموعات التجربة الرئيسة.</p>
    <table><thead><tr><th>المجموعة</th><th>الدور</th><th>المرحلة</th><th></th></tr></thead><tbody>${groups.map((g, i) => `<tr><td>${esc(g.name)}</td><td>${esc({exp: 'تجريبية', ctrl: 'ضابطة', single: 'مجموعة الدراسة'}[g.role] || '')}</td><td>${esc(g.kind === 'pilot' ? 'تطوير (Pilot)' : 'رئيسة (Formal)')}</td><td><button class="btn ghost small" data-act="rdel" data-k="groups" data-i="${i}">حذف</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">لا مجموعات.</td></tr>'}</tbody></table>
    <form data-form="rgroup" class="row">${inp('name', '', 'placeholder="مثال: 1/2 التجريبية" required')}${sel('role', [['exp', 'تجريبية'], ['ctrl', 'ضابطة'], ['single', 'مجموعة الدراسة']])}${sel('kind', [['formal', 'رئيسة'], ['pilot', 'تطوير (Pilot)']])}<button class="btn small" type="submit">إضافة</button></form></section>
    <section class="panel"><h2>أدوات القياس</h2><table><thead><tr><th>الأداة</th><th>عدد البنود</th><th>أعلى درجة للبند</th><th></th></tr></thead><tbody>${measures.map((m, i) => `<tr><td>${esc(m.name)}</td><td>${esc(m.items)}</td><td>${esc(m.max)}</td><td><button class="btn ghost small" data-act="rdel" data-k="measures" data-i="${i}">حذف</button></td></tr>`).join('') || '<tr><td colspan="4" class="muted">لا أدوات.</td></tr>'}</tbody></table>
    <form data-form="rmeasure" class="row">${inp('name', '', 'placeholder="مثال: مهام أداء وفق SOLO" required')}${inp('items', '4', 'type="number" min="1" style="width:90px" aria-label="عدد البنود"')}${inp('max', '4', 'type="number" min="1" style="width:90px" aria-label="أعلى درجة"')}<button class="btn small" type="submit">إضافة</button></form></section>`;
  if (t === 'ethics') { const e = R.ethics || {}; body = `<form data-form="rethics" class="panel"><h2>البروتوكول والموافقات</h2>
    <div class="grid">${field('رقم موافقة لجنة الأخلاقيات', inp('approval', e.approval))}${field('تاريخ الموافقة', inp('approvalDate', e.approvalDate, 'type="date"'))}${field('إذن إدارة التعليم أو المدرسة', inp('permission', e.permission))}</div>
    ${field('موافقات المشاركين', area('consents', e.consents, 'rows="3" placeholder="المعلمات: موافقة مكتوبة طوعية… أولياء الأمور: …"'))}${field('بروتوكول البيانات', area('protocol', e.protocol || 'المتعلمون والمعلمون برموز فقط. ملف ربط الرموز بالأسماء خارج المنصة لدى الباحث. لا تُرسل بيانات شخصية لأدوات الذكاء الاصطناعي. الملاحظة لتعلّم المتعلمين لا لتقييم المعلمين. المشاركة طوعية. بيانات التطوير (Pilot) منفصلة عن بيانات التجربة الرئيسة.', 'rows="5"'))}
    ${e.approval ? '<div class="ok">سُجّلت موافقة الأخلاقيات. يمكن جمع البيانات الرئيسة.</div>' : '<div class="note">لم تُسجّل موافقة الأخلاقيات بعد. اجمع بيانات التطوير (Pilot) فقط حتى تُعتمد.</div>'}<div><button class="btn" type="submit">حفظ</button></div></form>`; }
  if (t === 'scores') { const k = S.rscore || {}; body = measures.length && groups.length ? `<form data-form="rscore" class="panel"><h2>إدخال الدرجات</h2><div class="grid">${field('الأداة', sel('measureId', measures.map(m => [m.id, m.name]), k.measureId))}${field('المجموعة', sel('groupId', groups.map(g => [g.id, g.name]), k.groupId))}${field('التطبيق', sel('time', [['pre', 'قبلي'], ['post', 'بعدي']], k.time))}</div>
    ${field('الدرجات', area('data', '', 'rows="8" dir="ltr" placeholder="S001 3 2 4 1\nS002 2 2 3 0"'), 'سطر لكل متعلم: الرمز ثم درجة كل بند مفصولة بمسافة. يستبدل الحفظ أي إدخال سابق لنفس الأداة والمجموعة والتطبيق.')}<div><button class="btn" type="submit">حفظ</button></div></form>
    <section class="panel"><h2>الإدخالات</h2><table><thead><tr><th>الأداة</th><th>المجموعة</th><th>التطبيق</th><th>عدد المتعلمين</th></tr></thead><tbody>${RSCORES().map(r => `<tr><td>${esc((measures.find(m => m.id === r.measureId) || {}).name || '')}</td><td>${esc((groups.find(g => g.id === r.groupId) || {}).name || '')}</td><td>${r.time === 'pre' ? 'قبلي' : 'بعدي'}</td><td>${Object.keys(r.data || {}).length}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">لا إدخالات.</td></tr>'}</tbody></table></section>` : `<section class="panel">${empty('عرّف المجموعات وأدوات القياس أولًا من تبويب «المجموعات والأدوات».')}</section>`; }
  if (t === 'analysis') body = researchAnalysis(R);
  return `${head('مساحة الباحث', 'مساحة مستقلة لا يراها إلا من يحمل دور الباحث في هذا المشروع. الباحث يختار المنهج، والمنصة لا تفرض تصميمًا.')}${tabs('res', [['design', 'التصميم'], ['groups', 'المجموعات والأدوات'], ['ethics', 'البروتوكول والموافقات'], ['scores', 'الدرجات'], ['analysis', 'التحليل']])}${body}`;
};
function researchAnalysis(R) {
  const groups = (R.groups || []).filter(g => S.rPilot || g.kind !== 'pilot'); const measures = R.measures || [];
  if (!measures.length || !groups.length) return `<section class="panel">${empty('لا توجد أدوات أو مجموعات للتحليل.')}</section>`;
  return measures.map(m => {
    const st = groups.map(g => groupStats(m.id, g)); const maxT = (Number(m.items) || 1) * (Number(m.max) || 4);
    const exp = st.find(x => x.g.role === 'exp'), ctl = st.find(x => x.g.role === 'ctrl');
    const wg = exp && ctl ? welch(exp.gains, ctl.gains) : null; const wpost = exp && ctl ? welch(exp.post, ctl.post) : null; const wpre = exp && ctl ? welch(exp.pre, ctl.pre) : null;
    return `<section class="panel"><h2>${esc(m.name)} <span class="small muted">(الدرجة العظمى ${maxT})</span></h2>
    <div class="scroll"><table><thead><tr><th>المجموعة</th><th>ن قبلي</th><th>متوسط قبلي (ع)</th><th>ن بعدي</th><th>متوسط بعدي (ع)</th><th>ن مزدوج</th><th>متوسط الكسب</th><th>t مزدوج</th><th>p</th><th>dz</th></tr></thead><tbody>${st.map(x => `<tr><td>${esc(x.g.name)}${x.g.kind === 'pilot' ? ' ' + pill('Pilot', 'warn') : ''}</td><td>${x.pre.length}</td><td>${f2(avg(x.pre))} (${f2(sd(x.pre))})</td><td>${x.post.length}</td><td>${f2(avg(x.post))} (${f2(sd(x.post))})</td><td>${x.paired}</td><td>${f2(x.mg)}</td><td>${f2(x.t)}</td><td>${fp(x.p)}</td><td>${f2(x.dz)}</td></tr>`).join('')}</tbody></table></div>
    ${wg ? `<div class="mini"><b>المقارنة بين التجريبية والضابطة (Welch)</b><span class="small">تكافؤ القبلي: t = ${f2(wpre && wpre.t)}، p = ${fp(wpre && wpre.p)} · البعدي: t = ${f2(wpost && wpost.t)}، p = ${fp(wpost && wpost.p)}، d = ${f2(wpost && wpost.d)} · الكسب: t = ${f2(wg.t)}، df = ${f2(wg.df)}، p = ${fp(wg.p)}، d = ${f2(wg.d)}</span><span class="tiny muted">قراءة أولية. للتقرير النهائي استخدم تحليل التغاير ANCOVA (البعدي مع ضبط القبلي) في SPSS أو R من ملف التصدير.</span></div>` : ''}
    <div class="row"><button class="btn ghost small" data-act="rcsv" data-m="${esc(m.id)}">تصدير البيانات CSV (صيغة عريضة)</button><label class="small"><input type="checkbox" data-change="rpilot"${S.rPilot ? ' checked' : ''}> إظهار مجموعات Pilot</label></div></section>`;
  }).join('');
}
const rsave = data => updDoc('research', 'design', data);
FORM.rdesign = async o => { if (await rsave(o)) toast('حُفظ التصميم.'); };
FORM.rgroup = async o => { const R = RDESIGN(); if (await rsave({groups: (R.groups || []).concat({id: nid('g'), name: o.name, role: o.role, kind: o.kind})})) toast('أُضيفت المجموعة.'); };
FORM.rmeasure = async o => { const R = RDESIGN(); if (await rsave({measures: (R.measures || []).concat({id: nid('m'), name: o.name, items: Number(o.items) || 1, max: Number(o.max) || 4})})) toast('أُضيفت الأداة.'); };
FORM.rethics = async o => { if (await rsave({ethics: o})) toast('حُفظ.'); };
ACT.rdel = async b => { const R = RDESIGN(); const a = (R[b.dataset.k] || []).slice(); a.splice(Number(b.dataset.i), 1); await rsave({[b.dataset.k]: a}); };
ACT.rpilot = el => { S.rPilot = el.checked; render(); };
FORM.rscore = async o => {
  const R = RDESIGN(); const m = (R.measures || []).find(x => x.id === o.measureId); const g = (R.groups || []).find(x => x.id === o.groupId); if (!m || !g) return false;
  if (g.kind !== 'pilot' && !(R.ethics && R.ethics.approval)) { toast('سجّل موافقة الأخلاقيات قبل إدخال بيانات التجربة الرئيسة.'); return false; }
  const items = Number(m.items) || 1, mx = Number(m.max) || 4;
  const {out, bad} = parseScores(o.data, items * mx);
  if (bad.length) { toast('سطر غير صحيح: «' + bad[0] + '». اكتب رمزًا مثل S001 ثم الدرجات.'); return false; }
  /* each line is either one total, or exactly one score per item */
  const wrong = Object.entries(out).find(([, v]) => Array.isArray(v) ? (v.length !== items || v.some(x => x > mx)) : false);
  if (wrong) { toast('درجات ' + wrong[0] + ': المطلوب ' + items + ' درجات، كل منها من 0 إلى ' + mx + '، أو درجة كلية واحدة.'); return false; }
  if (!Object.keys(out).length) { toast('لا درجات.'); return false; }
  S.rscore = {measureId: o.measureId, groupId: o.groupId, time: o.time};
  const ok = await updDoc('research', `sc_${o.measureId}_${o.groupId}_${o.time}`, {kind: 'scores', measureId: o.measureId, groupId: o.groupId, time: o.time, data: out});
  if (ok) toast('حُفظت درجات ' + Object.keys(out).length + ' متعلم.'); return ok;
};
function csvOf(rows, cols) { const q = v => { const s = Array.isArray(v) ? v.join(' ') : String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }; return '﻿' + [cols.join(',')].concat(rows.map(r => cols.map(c => q(r[c])).join(','))).join('\n'); }
function download(name, content, type = 'text/csv;charset=utf-8') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([content], {type})); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
ACT.rcsv = b => {
  const R = RDESIGN(); const m = (R.measures || []).find(x => x.id === b.dataset.m); if (!m) return; const rows = [];
  (R.groups || []).forEach(g => { const pre = scoreMap(m.id, g.id, 'pre'), post = scoreMap(m.id, g.id, 'post'); uniq(Object.keys(pre).concat(Object.keys(post))).sort().forEach(code => rows.push({code, group: g.name, role: g.role, phase: g.kind, pre: pre[code] ?? '', post: post[code] ?? '', gain: code in pre && code in post ? post[code] - pre[code] : ''})); });
  download(`burhan_${m.name}_${today()}.csv`, csvOf(rows, ['code', 'group', 'role', 'phase', 'pre', 'post', 'gain']));
};
const EXPORT_COLS = {lessons: ['id', 'cycleId', 'familyId', 'version', 'title', 'topic', 'outcomes', 'tasks', 'questionsText', 'changeNote', 'decisionId', 'createdAt'], observations: ['id', 'cycleId', 'lessonId', 'lessonVersion', 'focus', 'indicator', 'direct', 'interpretation', 'tag', 'soloLevel', 'createdAt'], decisions: ['id', 'cycleId', 'lessonId', 'type', 'evidenceIds', 'evidenceText', 'decision', 'rationale', 'status', 'createdAt'], meetings: ['id', 'cycleId', 'date', 'agenda', 'notes', 'createdAt'], ai: ['id', 'cycleId', 'lessonId', 'purpose', 'output', 'judgment', 'reason', 'adopted', 'createdAt']};
ACT.rexport = b => { const c = b.dataset.c; if (!(S.P.researchShare || {})[c]) { toast('هذه البيانات غير مشاركة مع الباحث.'); return; } download(`burhan_${c}_${today()}.csv`, csvOf(D[c], EXPORT_COLS[c])); };

/* =========================================================
   Real Word (.docx) and Excel (.xlsx) files, built in the browser
   with no outside library: a tiny ZIP writer + Office XML.
   ========================================================= */
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = CRC_T[(c ^ b[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zipFiles(files) {
  const enc = new TextEncoder(); const parts = []; const central = []; let off = 0;
  const u16 = v => [v & 255, (v >>> 8) & 255], u32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  files.forEach(([name, text]) => {
    const nb = enc.encode(name), db = enc.encode(text), crc = crc32(db);
    const common = [...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(db.length), ...u32(db.length), ...u16(nb.length), ...u16(0)];
    const local = new Uint8Array([...u32(0x04034b50), ...common]);
    parts.push(local, nb, db);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...common, ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nb);
    off += local.length + nb.length + db.length;
  });
  const cdSize = central.reduce((s, p) => s + p.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(off), ...u16(0)]);
  return new Blob([...parts, ...central, end]);
}
const xesc = s => String(s ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const XML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
function downloadBlob(name, blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 800); }

/* ---- Excel: sheets = [{name, rows: [[...], ...], widths: [..], head: true}] ---- */
function colName(i) { let s = ''; i++; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
function xlsxBlob(sheets) {
  const used = new Set(); const names = sheets.map(sh => { let n = String(sh.name || 'ورقة').replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'ورقة'; let k = n, i = 2; while (used.has(k)) k = n.slice(0, 25) + ' ' + i++; used.add(k); return k; });
  const sheetXml = sh => {
    const rows = sh.rows || []; const ncol = Math.max(1, ...rows.map(r => r.length));
    const widths = Array.from({length: ncol}, (_, i) => (sh.widths && sh.widths[i]) || Math.min(60, Math.max(10, ...rows.map(r => String(r[i] ?? '').length * 0.9))));
    return XML + `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" rightToLeft="1"${sh.head ? '' : ''}/></sheetViews><cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${Math.round(w)}" customWidth="1"/>`).join('')}</cols><sheetData>${rows.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => { const ref = colName(ci) + (ri + 1); const st = sh.head && ri === 0 ? 1 : 2; if (typeof v === 'number' && isFinite(v)) return `<c r="${ref}" s="${st}"><v>${v}</v></c>`; if (v === '' || v == null) return ''; return `<c r="${ref}" s="${st}" t="inlineStr"><is><t xml:space="preserve">${xesc(v)}</t></is></c>`; }).join('')}</row>`).join('')}</sheetData></worksheet>`;
  };
  const files = [
    ['[Content_Types].xml', XML + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
    ['_rels/.rels', XML + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
    ['xl/workbook.xml', XML + `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${names.map((n, i) => `<sheet name="${xesc(n)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets></workbook>`],
    ['xl/_rels/workbook.xml.rels', XML + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['xl/styles.xml', XML + `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Arial"/></font><font><b/><sz val="11"/><color rgb="FF0E5B58"/><name val="Arial"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDDEDEA"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFBBBBBB"/></left><right style="thin"><color rgb="FFBBBBBB"/></right><top style="thin"><color rgb="FFBBBBBB"/></top><bottom style="thin"><color rgb="FFBBBBBB"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top" wrapText="1" readingOrder="2"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="right" vertical="top" wrapText="1" readingOrder="2"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`]
  ].concat(sheets.map((sh, i) => [`xl/worksheets/sheet${i + 1}.xml`, sheetXml(sh)]));
  return zipFiles(files);
}
const tableRows = t => Array.from(t.rows).map(r => Array.from(r.cells).map(c => { const v = (c.innerText || c.textContent || '').trim(); return /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v; }));

/* ---- Word: converts a report's HTML (h2, h3, p, ul/ol, table) into a right-to-left A4 .docx ---- */
function docxBlob(root, title) {
  const run = (t, o = {}) => `<w:r><w:rPr><w:rtl/>${o.b ? '<w:b/><w:bCs/>' : ''}${o.color ? `<w:color w:val="${o.color}"/>` : ''}${o.sz ? `<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>` : ''}</w:rPr><w:t xml:space="preserve">${xesc(t)}</w:t></w:r>`;
  const runsOf = (el, o = {}) => { const out = []; el.childNodes.forEach(n => { if (n.nodeType === 3) { if (n.textContent.trim()) out.push(run(n.textContent.replace(/\s+/g, ' '), o)); } else if (n.nodeName === 'BR') out.push('<w:r><w:br/></w:r>'); else if (n.nodeType === 1) out.push(runsOf(n, Object.assign({}, o, /^(B|STRONG|TH)$/.test(n.nodeName) ? {b: true} : {}))); }); return out.join(''); };
  const para = (inner, o = {}) => `<w:p><w:pPr><w:bidi/>${o.style ? `<w:pStyle w:val="${o.style}"/>` : ''}<w:spacing w:before="${o.before || 0}" w:after="${o.after == null ? 120 : o.after}"/></w:pPr>${inner}</w:p>`;
  const tableXml = t => {
    const rows = Array.from(t.rows); const ncol = Math.max(1, ...rows.map(r => r.cells.length)); const w = Math.floor(9638 / ncol);
    const b = '<w:top w:val="single" w:sz="4" w:color="999999"/><w:left w:val="single" w:sz="4" w:color="999999"/><w:bottom w:val="single" w:sz="4" w:color="999999"/><w:right w:val="single" w:sz="4" w:color="999999"/><w:insideH w:val="single" w:sz="4" w:color="999999"/><w:insideV w:val="single" w:sz="4" w:color="999999"/>';
    return `<w:tbl><w:tblPr><w:bidiVisual/><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${b}</w:tblBorders><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${Array.from({length: ncol}, () => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>${rows.map(r => `<w:tr>${Array.from(r.cells).map(c => { const head = c.nodeName === 'TH'; return `<w:tc><w:tcPr><w:tcW w:w="${w * (c.colSpan || 1)}" w:type="dxa"/>${c.colSpan > 1 ? `<w:gridSpan w:val="${c.colSpan}"/>` : ''}${head ? '<w:shd w:val="clear" w:color="auto" w:fill="DDEDEA"/>' : ''}</w:tcPr>${para(runsOf(c, head ? {b: true, sz: 20} : {sz: 20}), {after: 0})}</w:tc>`; }).join('')}${Array.from({length: Math.max(0, ncol - Array.from(r.cells).reduce((s, c) => s + (c.colSpan || 1), 0))}, () => `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/></w:tcPr><w:p/></w:tc>`).join('')}</w:tr>`).join('')}</w:tbl>${para('', {after: 60})}`;
  };
  const body = [];
  const walk = el => Array.from(el.children).forEach(n => {
    const tag = n.nodeName;
    if (n.classList && n.classList.contains('rephead')) { const sp = n.querySelector('span'); const top = Array.from(n.childNodes).filter(x => x !== sp).map(x => x.textContent).join('').trim(); body.push(para(run(top, {b: true, color: '0E5B58'}), {after: 0})); if (sp) body.push(para(run(sp.textContent.trim(), {sz: 18, color: '666666'}), {after: 200})); return; }
    if (tag === 'H2') body.push(para(run(n.textContent.trim(), {b: true, sz: 32, color: '0E5B58'}), {before: 120, after: 160}));
    else if (tag === 'H3') body.push(para(run(n.textContent.trim(), {b: true, sz: 26, color: '0E5B58'}), {before: 200, after: 80}));
    else if (tag === 'TABLE') body.push(tableXml(n));
    else if (tag === 'UL' || tag === 'OL') Array.from(n.children).forEach((li, i) => body.push(para(run(tag === 'OL' ? (i + 1) + '. ' : '• ') + runsOf(li), {after: 60})));
    else if (tag === 'P' || tag === 'SPAN' || tag === 'B') { if (n.textContent.trim()) body.push(para(runsOf(n, n.classList && n.classList.contains('tiny') ? {sz: 16, color: '666666'} : {}))); }
    else if (n.children.length) walk(n);
    else if (n.textContent.trim()) body.push(para(runsOf(n)));
  });
  walk(root);
  const doc = XML + `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/><w:bidi/></w:sectPr></w:body></w:document>`;
  const styles = XML + `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" w:eastAsia="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="ar-SA" w:bidi="ar-SA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:bidi/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>`;
  return zipFiles([
    ['[Content_Types].xml', XML + `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`],
    ['_rels/.rels', XML + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`],
    ['word/_rels/document.xml.rels', XML + `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['word/document.xml', doc], ['word/styles.xml', styles],
    ['docProps/core.xml', XML + `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xesc(title || 'بُرهان')}</dc:title><dc:creator>بُرهان</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created></cp:coreProperties>`]]);
}

/* =========================================================
   Analytics and the eight reports (print/PDF, Word, CSV),
   demo projects, and backups
   ========================================================= */
const decLabel = st => Object.fromEntries(DECISION_STATUS)[st || 'proposed'];
const cyclesSorted = () => D.cycles.slice().sort((a, b) => (a.n || 0) - (b.n || 0));
const countBy = (arr, f) => { const m = {}; arr.forEach(x => { const k = f(x); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
const tbl = (cols, rows) => rows.length ? `<table><thead><tr>${cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '<p class="small muted">لا بيانات.</p>';
const kv = rows => `<table><tbody>${rows.filter(r => r[1] !== undefined).map(r => `<tr><th style="width:30%">${esc(r[0])}</th><td>${r[1] === '' || r[1] == null ? '—' : esc(r[1]).replace(/\n/g, '<br>')}</td></tr>`).join('')}</tbody></table>`;

/* ---------- analytics ---------- */
function analyticsView() {
  const cs = cyclesSorted(); const tags = countBy(D.observations, o => o.tag); const inds = countBy(D.observations, o => o.indicator);
  const maxInd = Math.max(1, ...inds.map(x => x[1]));
  let html = `<section class="panel"><h2>تقدّم الدورات</h2>${tbl(['الدورة', 'الخطوات', 'نسخ الدرس', 'أدلة V1', 'أدلة V2+', 'القرارات', 'التأملات'], cs.map(c => { const n = stepState(c).filter(x => x.ok).length; const ob = inCycle(D.observations, c); return [esc(cycleLabel(c)), `<div class="row"><div class="bar" style="flex:1"><i style="width:${Math.round(n / STEPS.length * 100)}%"></i></div><span class="small">${n}/${STEPS.length}</span></div>`, inCycle(D.lessons, c).length, ob.filter(o => (o.lessonVersion || 1) === 1).length, ob.filter(o => (o.lessonVersion || 1) > 1).length, inCycle(D.decisions, c).length, inCycle(D.reflections, c).length]; }))}</section>
  <section class="panel"><h2>القرارات</h2><div class="kpis">${DECISION_STATUS.map(([k, l]) => `<div class="kpi"><b>${D.decisions.filter(d => (d.status || 'proposed') === k).length}</b><span>${esc(l)}</span></div>`).join('')}<div class="kpi"><b>${D.decisions.filter(d => (d.evidenceIds || []).length).length}</b><span>مربوطة بأدلة ملاحظة</span></div></div></section>
  <div class="cols"><section class="panel"><h2>مؤشرات الفريق</h2><div class="lvlbars">${inds.map(([k, n]) => `<div class="r"><span>${esc(k)}</span><div class="bar"><i style="width:${Math.round(n / maxInd * 100)}%"></i></div><span class="small">${n}</span></div>`).join('') || '<span class="small muted">لا أدلة بعد.</span>'}</div></section>
  <section class="panel"><h2>الصعوبات المتكررة</h2>${tags.length ? tbl(['النمط', 'مرات الظهور'], tags.slice(0, 10).map(([k, n]) => [esc(k), n])) : '<p class="small muted">استخدم «نمط صعوبة» في بطاقة الملاحظة لتظهر الأنماط هنا.</p>'}</section></div>`;
  if (mod('solo')) html += `<section class="panel"><h2>لوحة SOLO</h2>${tbl(['الدورة', 'رصد V1 (ن · متوسط · علائقي+)', 'رصد V2 (ن · متوسط · علائقي+)'], cs.map(c => { const a = soloDist(soloLevelsFor(c, 1).ex), b = soloDist(soloLevelsFor(c, 2).ex); const f = d => d.n ? `${d.n} · ${f2(d.mean)} · ${Math.round(d.rel * 100)}%` : '—'; return [esc(cycleLabel(c)), f(a), f(b)]; }))}</section>`;
  if (mod('pd')) html += `<section class="panel"><h2>المشاركة والتطوير المهني</h2>${tbl(['العضو', 'الأدوار', 'اجتماعات حضرها', 'نسخ دروس', 'ملاحظات', 'تأملات', 'ساعات'], D.members.map(m => [esc(m.name || m.email), esc((m.roles || []).map(r => ROLE[r]).join('، ')), D.meetings.filter(x => (x.attendees || []).includes(m.id)).length, D.lessons.filter(x => x.createdBy === m.id).length, D.observations.filter(x => x.createdBy === m.id).length, D.reflections.filter(x => x.createdBy === m.id).length, f2(D.reflections.filter(x => x.createdBy === m.id).reduce((s, x) => s + (Number(x.hours) || 0), 0))]))}</section>`;
  return html + '<p class="tiny muted">التحليلات داخل المشروع فقط. لا تقارن المنصة مشاريع مختلفة رقميًا لأن أهدافها وموادها وفرقها مختلفة.</p>';
}

/* ---------- the eight reports ---------- */
function repWrap(title, body, sub) {
  const P = S.P;
  return `<div class="report" dir="rtl"><div class="rephead"><b>بُرهان</b> · ${esc(P.name)}<span>${esc(P.org || '')} · ${esc(P.stage || '')} · ${esc(projSubjects().join('، '))} · ${esc(fmtDate(today()))}</span></div><h2>${esc(title)}</h2>${sub ? `<p class="small">${esc(sub)}</p>` : ''}${body}
  <p class="tiny muted">المتعلمون مشار إليهم برموز. الملاحظة لتعلّم المتعلمين، لا لتقييم المعلمين.</p></div>`;
}
const lessonBody = l => kv([['العنوان', l.title], ['النسخة', 'V' + (l.version || 1)]].concat(l.changeNote ? [['ما تغيّر ولماذا', l.changeNote]] : []).concat(LESSON_FIELDS.map(([k, lb]) => [lb, l[k] || '']))) + (mod('solo') && l.solo ? `<h3>تصميم SOLO</h3>${kv([['مستوى الناتج', soloName(l.solo.outcomeLevel)], ['المهمة الختامية', (l.solo.exitTask || '') + ' (' + soloName(l.solo.exitLevel) + ')']])}${tbl(['السؤال', 'المستوى'], (l.solo.questions || []).map(q => [esc(q.t), esc(soloName(q.l))]))}` : '');
const obsRows = list => list.map(o => [esc(shortId('O', o.id)), esc('V' + (o.lessonVersion || 1)), esc(o.focus || ''), esc(o.indicator || ''), esc(o.direct), esc(o.interpretation || '')].concat(mod('solo') ? [esc(o.soloLevel === '' || o.soloLevel == null ? '' : soloName(o.soloLevel))] : []));
const obsCols = () => ['الرمز', 'النسخة', 'المتعلم', 'المؤشر', 'الدليل المباشر', 'التفسير المهني'].concat(mod('solo') ? ['SOLO'] : []);
const decRows = list => list.map(d => [esc(shortId('D', d.id)), esc(d.type || ''), esc(d.decision), esc((d.evidenceIds || []).map(x => shortId('O', x)).join('، ') + ' ' + (d.evidenceText || '')), esc(decLabel(d.status))]);
const decCols = ['الرمز', 'النوع', 'القرار', 'الدليل', 'الحالة'];
const REPORTS = [
  {k: 'team', n: 'تقرير تأسيس الفريق', d: 'الفريق وأدواره، والإيقاع، والوحدات، والالتزامات الأخلاقية.', build() { const P = S.P; const sc = P.schedule || {};
    return repWrap(this.n, `<h3>بيانات المشروع</h3>${kv([['المؤسسة', P.org], ['المرحلة والصف', (P.stage || '') + ' ' + (P.grade || '')], ['المادة أو المجال', projSubjects().join('، ')], ['العام والمدة', (P.year || '') + ' ' + (P.duration || '')]])}
      <h3>أعضاء الفريق</h3>${tbl(['العضو', 'المدرسة', 'الأدوار'], D.members.map(m => [esc(m.name || m.email), esc(m.school || ''), esc((m.roles || []).map(r => ROLE[r]).join('، '))]))}
      ${(P.invitedEmails || []).length ? `<p class="small">دعوات لم تُقبل بعد: ${(P.invitedEmails || []).length}</p>` : ''}
      <h3>الإيقاع</h3>${kv([['الحصص الأسبوعية', sc.lessonsPerWeek], ['مدة الحصة', sc.lessonMinutes], ['الاجتماع', (sc.meetingDay || '') + ' ' + (sc.meetingTime || '')], ['مدة الاجتماع', sc.meetingMinutes], ['عدد الدورات', D.cycles.length], ['الموارد', sc.resources]])}
      <h3>الوحدات المفعّلة</h3><p>${esc(MODULES.filter(m => mod(m[0])).map(m => m[1]).join('، ') || 'لا شيء: بحث الدرس وحده.')}</p>
      <h3>التزامات الفريق</h3><ul><li>المشاركة طوعية.</li><li>نلاحظ تعلّم المتعلمين لا أداء المعلم، ولا تُستخدم الملاحظات في التقييم الوظيفي.</li><li>المتعلمون برموز، ولا تُرسل بيانات شخصية لأدوات الذكاء الاصطناعي.</li><li>كل قرار تحسين يُبنى على دليل.</li></ul>`); }},
  {k: 'plan', n: 'خطة المشروع', d: 'الهدف البعيد، ومشكلة التعلم، والدورات، والمؤشرات.', build() { const P = S.P; const g = P.goals || {}, p = P.problem || {};
    return repWrap(this.n, `<h3>الهدف البعيد</h3>${kv([['الهدف', g.longTerm], ['الأفكار الكبرى', g.bigIdeas], ['عادات التفكير', g.habits], ['مؤشرات النجاح', g.successIndicators]])}
      <h3>مشكلة التعلم</h3>${kv([['المشكلة', p.statement], ['الأدلة', p.evidence], ['المتعلمون المستهدفون', p.learners], ['أسئلة الفريق', p.questions]])}
      <h3>الدورات</h3>${tbl(['الدورة', 'الموضوع', 'تاريخ الدرس البحثي', 'المنفّذ', 'الحالة'], cyclesSorted().map(c => [esc(cycleLabel(c)), esc(c.topic || ''), esc(fmtDate(c.lessonDate)), esc(c.teacherUid ? memberName(c.teacherUid) : '—'), esc({planned: 'مخطط لها', active: 'جارية', closed: 'مغلقة'}[c.status || 'planned'])]))}
      <h3>مؤشرات الملاحظة</h3><p>${esc((P.indicators || []).join('، '))}</p>${P.framework && P.framework !== 'none' ? `<p class="small">الإطار المعتمد: ${esc(P.framework === 'solo' ? 'تصنيف SOLO' : 'معايير الفريق')}</p>` : ''}`); }},
  {k: 'lesson', n: 'خطة الدرس البحثي', d: 'كل عناصر الخطة لنسخة محددة.', p: 'lesson', build(o) { const l = D.lessons.find(x => x.id === o.lessonId); if (!l) return ''; return repWrap(this.n, `<p class="small">${esc(cycleLabel(D.cycles.find(c => c.id === l.cycleId)))}</p>${lessonBody(l)}`); }},
  {k: 'meeting', n: 'محضر الاجتماع', d: 'جدول الأعمال والحضور والنقاش والقرارات.', p: 'meeting', build(o) { const m = D.meetings.find(x => x.id === o.meetingId); if (!m) return ''; const decs = D.decisions.filter(d => d.meetingId === m.id);
    return repWrap(this.n + ' ' + shortId('M', m.id), `${kv([['التاريخ', fmtDate(m.date)], ['الدورة', cycleLabel(D.cycles.find(c => c.id === m.cycleId))], ['الحضور', (m.attendees || []).map(memberName).join('، ')], ['جدول الأعمال', m.agenda], ['ملخص النقاش', m.notes], ['المهام والمسؤوليات', m.tasks || '']])}<h3>القرارات</h3>${tbl(decCols, decRows(decs))}`); }},
  {k: 'obs', n: 'تقرير الملاحظة', d: 'أدلة الدورة: الدليل المباشر منفصلًا عن التفسير.', p: 'cycle', csv: true, build(o) { const c = D.cycles.find(x => x.id === o.cycleId); if (!c) return ''; const list = inCycle(D.observations, c).sort(byOld);
    return repWrap(this.n, `<p class="small">${esc(cycleLabel(c))} · ${list.length} دليل</p><h3>حسب المؤشر</h3>${tbl(['المؤشر', 'العدد'], countBy(list, x => x.indicator).map(([k, n]) => [esc(k), n]))}<h3>الأدلة</h3>${tbl(obsCols(), obsRows(list))}`); },
    rows(o) { return inCycle(D.observations, D.cycles.find(x => x.id === o.cycleId)).map(x => ({id: shortId('O', x.id), version: x.lessonVersion || 1, focus: x.focus, indicator: x.indicator, direct: x.direct, interpretation: x.interpretation, tag: x.tag, solo: x.soloLevel ?? ''})); }},
  {k: 'cycle', n: 'تقرير دورة بحث الدرس', d: 'من الدليل إلى قرار التحسين: الخطوات والنسخ والأدلة والقرارات والتأملات.', p: 'cycle', build(o) { const c = D.cycles.find(x => x.id === o.cycleId); if (!c) return ''; const ls = lessonsOfCycle(c); const ob = inCycle(D.observations, c);
    let solo = ''; if (mod('solo')) { const a = soloDist(soloLevelsFor(c, 1).ex), b = soloDist(soloLevelsFor(c, 2).ex); solo = `<h3>عمق الفهم وفق SOLO (المهمة الختامية)</h3>${tbl(['المستوى', 'V1', 'V2'], SOLO.map((s, i) => [esc(s[0] + ' · ' + s[1]), a.c[i], b.c[i]]).concat([['المتوسط', f2(a.mean), f2(b.mean)], ['علائقي فأعلى', a.n ? Math.round(a.rel * 100) + '%' : '—', b.n ? Math.round(b.rel * 100) + '%' : '—']]))}<p class="tiny muted">قراءة وصفية للفريق.</p>`; }
    return repWrap(this.n, `${kv([['الدورة', cycleLabel(c)], ['الموضوع', c.topic], ['تاريخ الدرس البحثي', fmtDate(c.lessonDate)], ['المنفّذ', c.teacherUid ? memberName(c.teacherUid) : ''], ['الملاحِظون', (c.observers || []).map(memberName).join('، ')]])}
      <h3>الخطوات</h3>${tbl(['الخطوة', 'الحالة'], stepState(c).map(x => [esc(x.s.n), x.ok ? 'مكتملة' : (x.s.optional ? 'اختيارية' : 'لم تكتمل')]))}
      <h3>دراسة المحتوى</h3><p>${esc(c.contentStudy || '—')}</p>
      <h3>نسخ الدرس</h3>${tbl(['الدرس', 'النسخة', 'ما تغيّر ولماذا', 'القرار'], ls.map(l => [esc(l.title || ''), 'V' + (l.version || 1), esc(l.changeNote || (l.version > 1 ? '' : 'النسخة الأولى')), esc(l.decisionId ? shortId('D', l.decisionId) : '')]))}
      <h3>أدلة التعلم</h3><p>${ob.length} دليل: ${ob.filter(x => (x.lessonVersion || 1) === 1).length} في النسخة الأولى و${ob.filter(x => (x.lessonVersion || 1) > 1).length} في المعدّلة.</p>${tbl(['النمط المتكرر', 'العدد'], countBy(ob, x => x.tag).map(([k, n]) => [esc(k), n]))}
      <h3>قرارات التحسين</h3>${tbl(decCols, decRows(inCycle(D.decisions, c)))}${solo}
      <h3>التأملات</h3>${tbl(['العضو', 'ما تعلّمته', 'ما سأغيّره'], inCycle(D.reflections, c).map(r => [esc(memberName(r.createdBy)), esc(r.learned), esc(r.change || '')]))}`); }},
  {k: 'project', n: 'تقرير إنجاز المشروع', d: 'ملخص كل الدورات والأرقام والقرارات والمشاركة.', csv: true, build() {
    return repWrap(this.n, `${kv([['الهدف البعيد', (S.P.goals || {}).longTerm], ['مشكلة التعلم', (S.P.problem || {}).statement]])}
      <h3>بالأرقام</h3>${tbl(['الأعضاء', 'الدورات', 'نسخ الدروس', 'الأدلة', 'الاجتماعات', 'القرارات المعتمدة أو المنفذة', 'التأملات'], [[D.members.length, D.cycles.length, D.lessons.length, D.observations.length, D.meetings.length, D.decisions.filter(d => d.status && d.status !== 'proposed').length, D.reflections.length]])}
      <h3>الدورات</h3>${tbl(['الدورة', 'الموضوع', 'الخطوات المكتملة', 'القرارات'], cyclesSorted().map(c => [esc(cycleLabel(c)), esc(c.topic || ''), stepState(c).filter(x => x.ok).length + '/' + STEPS.length, inCycle(D.decisions, c).length]))}
      <h3>قرارات التحسين</h3>${tbl(decCols, decRows(D.decisions.slice().sort(byOld)))}
      ${mod('pd') ? '<h3>المشاركة</h3>' + tbl(['العضو', 'ملاحظات', 'تأملات', 'ساعات'], D.members.map(m => [esc(m.name || m.email), D.observations.filter(x => x.createdBy === m.id).length, D.reflections.filter(x => x.createdBy === m.id).length, f2(D.reflections.filter(x => x.createdBy === m.id).reduce((s, x) => s + (Number(x.hours) || 0), 0))])) : ''}`); },
    rows() { return D.decisions.map(d => ({id: shortId('D', d.id), cycle: cycleLabel(D.cycles.find(c => c.id === d.cycleId)), type: d.type, decision: d.decision, evidence: (d.evidenceIds || []).map(x => shortId('O', x)).join(' ') + ' ' + (d.evidenceText || ''), status: decLabel(d.status)})); }},
  {k: 'lessons', n: 'الدروس المستفادة', d: 'ما تعلّمه الفريق عن تفكير المتعلمين وعن التدريس.', build() {
    return repWrap(this.n, `<h3>ما تعلّمناه عن تفكير المتعلمين</h3><ul>${D.reflections.slice().sort(byOld).map(r => `<li>${esc(r.learned)} <span class="tiny muted">(${esc(memberName(r.createdBy))})</span></li>`).join('') || '<li>لا تأملات بعد.</li>'}</ul>
      <h3>ما سنغيّره في تدريسنا</h3><ul>${D.reflections.filter(r => r.change).map(r => `<li>${esc(r.change)}</li>`).join('') || '<li>—</li>'}</ul>
      <h3>التعديلات التي ثبتت</h3>${tbl(decCols, decRows(D.decisions.filter(d => d.status === 'done' || d.status === 'approved')))}
      <h3>الصعوبات المتكررة</h3>${tbl(['النمط', 'العدد'], countBy(D.observations, x => x.tag).map(([k, n]) => [esc(k), n]))}`); }}];

/* Each report: preview, Word, Excel, and print/PDF — straight from its card. */
const REP_KIND = {team: 'word', plan: 'word', lesson: 'word', meeting: 'word', obs: 'excel', cycle: 'word', project: 'excel', lessons: 'word'};
const latest = arr => arr.slice().sort(byNew)[0];
function repParams(r) {
  const o = Object.assign({}, (S.repParams || {})[r.k]);
  if (r.p === 'cycle' && !D.cycles.some(c => c.id === o.cycleId)) o.cycleId = (curCycle() || {}).id;
  if (r.p === 'lesson' && !D.lessons.some(l => l.id === o.lessonId)) o.lessonId = (latest(D.lessons) || {}).id;
  if (r.p === 'meeting' && !D.meetings.some(m => m.id === o.meetingId)) o.meetingId = (latest(D.meetings) || {}).id;
  return o;
}
const REP_NEED = {cycle: 'أنشئي دورة أولًا من «الجدول التنفيذي».', lesson: 'اكتبي خطة درس أولًا من «الدروس البحثية».', meeting: 'سجّلي محضر اجتماع أولًا من «التحسين والتأمل».'};
function repParamField(r, o) {
  if (r.p === 'cycle') return D.cycles.length ? `<select data-change="repparam" data-k="${r.k}" data-p="cycleId" aria-label="الدورة">${opts(cyclesSorted().map(c => [c.id, cycleLabel(c)]), o.cycleId)}</select>` : '';
  if (r.p === 'lesson') return D.lessons.length ? `<select data-change="repparam" data-k="${r.k}" data-p="lessonId" aria-label="الدرس">${opts(D.lessons.slice().sort((a, b) => String(a.cycleId).localeCompare(String(b.cycleId)) || (a.version || 1) - (b.version || 1)).map(l => [l.id, cycleLabel(D.cycles.find(c => c.id === l.cycleId)) + ' · ' + lessonLabel(l)]), o.lessonId)}</select>` : '';
  if (r.p === 'meeting') return D.meetings.length ? `<select data-change="repparam" data-k="${r.k}" data-p="meetingId" aria-label="الاجتماع">${opts(D.meetings.slice().sort(byNew).map(m => [m.id, shortId('M', m.id) + ' · ' + fmtDate(m.date)]), o.meetingId)}</select>` : '';
  return '';
}
V.reports = () => {
  if (!S.P) return head('التقارير والتحليلات') + needProject();
  const t = curTab('rep', 'reports');
  let body = '';
  if (t === 'analytics') body = analyticsView();
  else {
    body = `<section class="panel"><p class="small muted">كل تقرير يُبنى من بيانات المشروع مباشرة. الصيغة الموصى بها لكل تقرير مميّزة باللون. ملف Word يُفتح ويُعدَّل في Microsoft Word، وملف Excel فيه كل جداول التقرير كل جدول في ورقة.</p>
      <div class="repgrid">${REPORTS.map(r => { const o = repParams(r); const html = r.build(o); const kind = REP_KIND[r.k];
        return `<div class="repcard${S.rep && S.rep.k === r.k ? ' on' : ''}"><b>${esc(r.n)}</b><span class="small muted">${esc(r.d)}</span>${repParamField(r, o)}
        ${html ? `<div class="row"><button class="btn small ${kind === 'word' ? '' : 'ghost'}" data-act="repword" data-k="${r.k}">Word</button><button class="btn small ${kind === 'excel' ? '' : 'ghost'}" data-act="repxlsx" data-k="${r.k}">Excel</button><button class="btn ghost small" data-act="repprint" data-k="${r.k}">طباعة / PDF</button><button class="btn ghost small" data-act="pickrep" data-k="${r.k}">معاينة</button></div>` : `<div class="note small">${esc(REP_NEED[r.p] || 'لا بيانات بعد.')}</div>`}</div>`; }).join('')}</div></section>`;
    const r = REPORTS.find(x => x.k === (S.rep || {}).k);
    if (r) { const html = r.build(repParams(r)); if (html) body += `<section class="panel" id="repPreview"><div class="row between"><h2>معاينة: ${esc(r.n)}</h2><button class="btn ghost small" data-act="closerep">إغلاق المعاينة</button></div>${html}</section>`; }
  }
  return `${head('التقارير والتحليلات', 'تقارير بحث الدرس بالعربية وبمقاس A4: نزّليها Word أو Excel، أو اطبعيها واحفظيها PDF.')}${tabs('rep', [['reports', 'التقارير'], ['analytics', 'التحليلات']])}${body}`;
};
ACT.pickrep = b => { S.rep = {k: b.dataset.k}; render(); const el = $('#repPreview'); if (el) el.scrollIntoView({behavior: 'smooth'}); };
ACT.closerep = () => { S.rep = null; render(); };
ACT.repparam = el => { S.repParams = S.repParams || {}; S.repParams[el.dataset.k] = Object.assign({}, S.repParams[el.dataset.k], {[el.dataset.p]: el.value}); render(); };
const repOf = k => { const r = REPORTS.find(x => x.k === k); if (!r) return null; const o = repParams(r); const html = r.build(o); return html ? {r, o, html} : null; };
const fileName = (r, ext) => `${r.n} - ${S.P.name} - ${today()}.${ext}`.replace(/[\\/:*?"<>|]/g, '-');
ACT.repprint = b => { const x = repOf(b.dataset.k); if (!x) return; $('#printArea').innerHTML = x.html; setTimeout(() => window.print(), 50); };
const wordDoc = html => `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>بُرهان</title><style>@page{size:21cm 29.7cm;margin:2cm}body{font-family:Arial,'Traditional Arabic';direction:rtl;font-size:12pt}table{border-collapse:collapse;width:100%;margin:6pt 0}th,td{border:1px solid #999;padding:4pt;text-align:right;vertical-align:top}th{background:#eee}.rephead span{display:block;color:#555;font-size:10pt}.tiny,.small{font-size:9pt;color:#555}</style></head><body dir="rtl" lang="ar">${html}</body></html>`;
ACT.repword = b => { const x = repOf(b.dataset.k); if (!x) return; const box = document.createElement('div'); box.innerHTML = x.html; downloadBlob(fileName(x.r, 'docx'), docxBlob(box.firstElementChild || box, x.r.n)); toast('نُزّل ملف Word: ' + x.r.n); };
/* Excel: a cover sheet, then every table in the report as its own sheet. */
async function saveWorkbook(name, sheets) { downloadBlob(name, xlsxBlob(sheets)); toast('نُزّل ملف Excel.'); }
ACT.repxlsx = async b => {
  const x = repOf(b.dataset.k); if (!x) return;
  const box = document.createElement('div'); box.innerHTML = x.html;
  const sheets = [{name: 'التقرير', rows: [['بُرهان', ''], ['التقرير', x.r.n], ['المشروع', S.P.name], ['المؤسسة', S.P.org || ''], ['المادة', projSubjects().join('، ')], ['تاريخ الإصدار', today()], [], ['المتعلمون مشار إليهم برموز.']], widths: [18, 60]}];
  $$('table', box).forEach((t, i) => { let h = t.previousElementSibling; while (h && !/^H[23]$/.test(h.tagName)) h = h.previousElementSibling; sheets.push({name: h ? h.textContent : 'جدول ' + (i + 1), rows: tableRows(t), head: !!t.querySelector('th') && !!t.tHead}); });
  await saveWorkbook(fileName(x.r, 'xlsx'), sheets);
};
/* Excel straight from a list (observations, meetings, decisions, reflections, AI log) */
const LIST_X = {
  observations: ['الملاحظات', o => ({'الرمز': shortId('O', o.id), 'الدورة': cycleLabel(D.cycles.find(c => c.id === o.cycleId)), 'الدرس': lessonLabel(D.lessons.find(l => l.id === o.lessonId)), 'النسخة': 'V' + (o.lessonVersion || 1), 'المتعلم': o.focus || '', 'المؤشر': o.indicator || '', 'الدليل المباشر': o.direct || '', 'التفسير المهني': o.interpretation || '', 'نمط الصعوبة': o.tag || '', 'SOLO': o.soloLevel ?? '', 'الملاحِظ': memberName(o.createdBy), 'التاريخ': fmtDate(o.createdAt)})],
  meetings: ['المحاضر', m => ({'الرمز': shortId('M', m.id), 'التاريخ': m.date || '', 'الدورة': cycleLabel(D.cycles.find(c => c.id === m.cycleId)), 'الحضور': (m.attendees || []).map(memberName).join('، '), 'جدول الأعمال': m.agenda || '', 'ملخص النقاش': m.notes || '', 'المهام': m.tasks || ''})],
  decisions: ['القرارات', d => ({'الرمز': shortId('D', d.id), 'الدورة': cycleLabel(D.cycles.find(c => c.id === d.cycleId)), 'النوع': d.type || '', 'القرار': d.decision || '', 'السبب': d.rationale || '', 'الدليل': (d.evidenceIds || []).map(x => shortId('O', x)).join('، ') + ' ' + (d.evidenceText || ''), 'الحالة': decLabel(d.status), 'بواسطة': memberName(d.createdBy), 'التاريخ': fmtDate(d.createdAt)})],
  reflections: ['التأملات', r => ({'العضو': memberName(r.createdBy), 'الدورة': cycleLabel(D.cycles.find(c => c.id === r.cycleId)), 'ما تعلّمته': r.learned || '', 'ما سأغيّره': r.change || '', 'الساعات': r.hours || '', 'التاريخ': fmtDate(r.createdAt)})],
  ai: ['سجل الذكاء الاصطناعي', x => ({'الرمز': shortId('AI', x.id), 'الغرض': (AI_PURPOSES.find(p => p[0] === x.purpose) || [, ''])[1], 'الدرس': lessonLabel(D.lessons.find(l => l.id === x.lessonId)), 'المقترح': x.output || '', 'الحكم': Object.fromEntries(AI_JUDGE)[x.judgment] || '', 'السبب': x.reason || '', 'النص المعتمد': x.adopted || '', 'بواسطة': memberName(x.createdBy), 'التاريخ': fmtDate(x.createdAt)})]};
ACT.xlsxlist = async b => {
  const c = b.dataset.c; const L = LIST_X[c]; if (!L) return; const rows = D[c].slice().sort(byOld).map(L[1]);
  if (!rows.length) { toast('لا سجلات للتصدير بعد.'); return; }
  const cols = Object.keys(rows[0]);
  await saveWorkbook(`${L[0]} - ${S.P.name} - ${today()}.xlsx`.replace(/[\\/:*?"<>|]/g, '-'), [{name: L[0], head: true, rows: [cols].concat(rows.map(r => cols.map(k => r[k]))), widths: cols.map(k => /الدليل|القرار|ملخص|المقترح|تعلّمته|التفسير/.test(k) ? 50 : 16)}]);
};

/* ---------- backups ---------- */
const LEGACY = ['access', 'team', 'classes', 'cycles', 'lessons', 'ai', 'notes', 'meetings', 'decisions', 'evidence', 'tasks', 'practice', 'exports', 'instruments', 'rqs', 'library', 'config'];
const isOwner = () => (window.BURHAN_OWNERS || []).map(x => String(x).toLowerCase()).includes(ME.email);
const _vprojects = V.projects;
V.projects = () => { const h = _vprojects(); if (S.wiz) return h;
  return h + `<section class="panel"><h2>نسخ احتياطية</h2><p class="small muted">ملف JSON يحفظ كل بيانات المشروع الحالي على جهازك. احفظه في مكان آمن ولا ترفعه إلى GitHub.</p><div class="row">${S.P ? '<button class="btn ghost small" data-act="projbackup">نسخة احتياطية للمشروع الحالي</button>' : ''}${isOwner() ? '<button class="btn ghost small" data-act="legacybackup">نسخة احتياطية من بيانات النسخة السابقة من بُرهان</button>' : ''}</div></section>`; };
ACT.projbackup = () => { const out = {exportedAt: nowIso(), project: S.P}; COLLS.forEach(c => { out[c] = D[c]; }); download(`burhan_backup_${S.P.name}_${today()}.json`, JSON.stringify(out, null, 1), 'application/json'); };
ACT.legacybackup = async b => {
  b.disabled = true; const out = {exportedAt: nowIso(), source: 'burhan v1'}; let n = 0;
  for (const c of LEGACY) { try { const s = await db.collection(c).get(); out[c] = snapList(s); n += out[c].length; } catch (x) { out[c] = {error: x.code || String(x)}; } }
  download(`burhan_v1_backup_${today()}.json`, JSON.stringify(out, null, 1), 'application/json'); toast('نُزّلت النسخة: ' + n + ' سجلًا.'); b.disabled = false;
};

/* ---------- three demo projects (acceptance test) ---------- */
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const codes = (p, n, from = 1) => Array.from({length: n}, (_, i) => p + pad(from + i, 3));
const DEMOS = [
  {wiz: {name: 'عمق الفهم المفاهيمي في التقنية الرقمية', org: 'ثانوية تجريبية (بيانات للتجربة)', stage: 'الثانوية', grade: 'الأول الثانوي', year: '1448هـ', duration: 'فصل دراسي', subjects: ['التقنية الرقمية', 'الرياضيات', 'العلوم'], myRoles: ['leader', 'researcher'],
    team: [{name: 'T02 معلمة التقنية الرقمية', email: 't02.demo@example.com', roles: ['teacher'], school: ''}, {name: 'T03 معلمة الرياضيات', email: 't03.demo@example.com', roles: ['content', 'observer'], school: ''}, {name: 'T04 معلمة العلوم', email: 't04.demo@example.com', roles: ['observer', 'reviewer'], school: ''}],
    longTerm: 'أن تفسّر الطالبات المفاهيم الرقمية وتربط بينها وتنقلها إلى مواقف جديدة، لا أن تحفظ الإجراءات فقط.', bigIdeas: 'الخوارزمية تسلسل قرارات؛ البيانات تمثيل للواقع', habits: 'التبرير، التساؤل، التحقق من الحل', successIndicators: 'ارتفاع نسبة الاستجابات عند المستوى العلائقي فأعلى في المهام الختامية',
    statement: 'معظم إجابات الطالبات عن أسئلة «لماذا» في الخوارزميات تقف عند المستوى أحادي البنية أو متعدد البنية.', evidence: 'تحليل الفريق لإجابات مهمة تشخيصية: أغلبها يذكر خطوات دون ربطها بالسبب.', learners: 'طالبات الأول الثانوي', questions: 'كيف نصمّم مهام وأسئلة تنقل الطالبات إلى الفهم العلائقي؟',
    lessonsPerWeek: '3', lessonMinutes: '45', cycles: 2, meetingDay: 'الاثنين', meetingTime: 'الحصة السادسة', meetingMinutes: '45', modules: ['solo', 'ai', 'research', 'pd']},
   topic: 'الشروط والتكرار في الخوارزميات', solo: true, ai: true, research: true,
   lesson: {title: 'لماذا نضع الشرط قبل التكرار؟', concepts: 'الشرط، التكرار، شرط التوقف', prerequisites: 'تمثيل الخوارزمية بمخطط انسيابي', outcomes: 'تفسّر الطالبة أثر موضع الشرط على تنفيذ التكرار', tasks: 'تتبّع خوارزميتين تختلفان في موضع الشرط', questionsText: 'ماذا يحدث لو جاء الشرط بعد التكرار؟', expected: 'بعضهن يصف الخطوات دون ذكر السبب', misconceptions: 'الظن أن الترتيب لا يغيّر النتيجة', resources: 'بطاقات تتبع', time: '5 تهيئة · 25 مهمة · 10 نقاش · 5 ختام', evidence: 'بطاقات التتبع والمهمة الختامية',
     solo: {outcomeLevel: '3', exitTask: 'فسّري لماذا تتوقف الحلقة في الخوارزمية (أ) ولا تتوقف في (ب)', exitLevel: '3', questions: [{t: 'ما الشرط في الخوارزمية؟', l: '1'}, {t: 'اذكري خطوات التنفيذ', l: '2'}, {t: 'لماذا تختلف النتيجتان؟', l: '3'}]}},
   change: 'أضفنا سؤال تنبؤ قبل التتبع ومهمة نقل إلى موقف جديد (آلة بيع)، لأن الأدلة أظهرت أن الطالبات يصفن الخطوات دون تفسير.', decision: 'إضافة سؤال تنبؤ «ماذا تتوقعين؟» قبل التتبع، ومهمة نقل في الختام', indicators: ['التفسير المفاهيمي', 'الاستدلال', 'المشاركة في النقاش', 'نقل التعلم'],
   obs: [['S004', 'التفسير المفاهيمي', '«الشرط يفحص والتكرار يعيد» ثم توقفت ولم تذكر أثر الترتيب', 'تعدد بنية: أفكار صحيحة غير مترابطة', '2', 'تصف دون تفسير'], ['S009', 'الاستدلال', 'تتبعت (أ) صحيحًا وكتبت لـ(ب) النتيجة نفسها', 'تفترض أن الترتيب لا يؤثر', '1', 'تتجاهل الترتيب'], ['S002', 'التفسير المفاهيمي', '«لو جاء الشرط بعد، تُنفّذ الخطوة مرة زائدة لأن الفحص يأتي متأخرًا»', 'ربط السبب بالنتيجة', '3', '']],
   obs2: [['S004', 'التفسير المفاهيمي', '«لأن الفحص يأتي أولًا فلا تُنفّذ الخطوة إذا كان الشرط خاطئًا، لذلك تتوقف»', 'انتقلت إلى الربط', '3', ''], ['S011', 'نقل التعلم', 'طبقت الفكرة على آلة البيع: «تتحقق الآلة من الرصيد قبل الصرف»', 'نقل إلى موقف جديد', '4', '']],
   scores: [[1, 2, 2, 1, 2, 3, 1, 2, 2, 1, 2, 2], [2, 3, 3, 2, 3, 3, 2, 3, 4, 2, 3, 3]]},
  {wiz: {name: 'الفهم القرائي في اللغة العربية', org: 'متوسطة تجريبية (بيانات للتجربة)', stage: 'المتوسطة', grade: 'الثاني المتوسط', year: '1448هـ', duration: 'فصل دراسي', subjects: ['اللغة العربية'], myRoles: ['leader', 'facilitator'],
    team: [{name: 'T11 معلمة لغة عربية', email: 't11.demo@example.com', roles: ['teacher'], school: ''}, {name: 'T12 معلمة لغة عربية', email: 't12.demo@example.com', roles: ['observer'], school: ''}],
    longTerm: 'أن يقرأ المتعلمون النص قراءة ناقدة ويدعموا آراءهم بشواهد منه.', statement: 'يستخرج المتعلمون تفاصيل النص لكنهم يتعثرون في تحديد الفكرة الرئيسة ودعمها.', evidence: 'نتائج اختبار الفهم القرائي ومراجعة دفاتر المتعلمين.', learners: 'الثاني المتوسط',
    lessonsPerWeek: '5', lessonMinutes: '45', cycles: 2, meetingDay: 'الأربعاء', meetingTime: 'بعد الحصة الخامسة', modules: ['pd']},
   topic: 'استنتاج الفكرة الرئيسة في نص معلوماتي', indicators: ['استخراج الفكرة الرئيسة', 'الاستدلال من النص', 'دعم الرأي بشاهد', 'المفردات في السياق'],
   lesson: {title: 'الفكرة الرئيسة وشواهدها', concepts: 'الفكرة الرئيسة، الأفكار الداعمة، الشاهد', outcomes: 'يحدد المتعلم الفكرة الرئيسة ويدعمها بشاهدين من النص', tasks: 'قراءة نص عن المياه الجوفية ورسم خريطة فكرة', questionsText: 'ما الذي يريد الكاتب أن نقتنع به؟ ما الدليل؟', expected: 'سيختار بعضهم الجملة الأولى دائمًا', misconceptions: 'الفكرة الرئيسة هي الجملة الأولى', time: '45 دقيقة', evidence: 'خرائط الفكرة'},
   change: 'أضفنا نموذجًا مفكرًا بصوت عالٍ لنص قصير قبل المهمة.', decision: 'نمذجة التفكير بصوت عالٍ قبل المهمة المستقلة',
   obs: [['S021', 'استخراج الفكرة الرئيسة', 'كتب الجملة الأولى من النص فكرةً رئيسة', 'يعتمد قاعدة شكلية', '', 'الجملة الأولى = الفكرة'], ['S025', 'دعم الرأي بشاهد', 'ذكر الفكرة دون أي شاهد', '', '', 'رأي بلا شاهد'], ['S030', 'الاستدلال من النص', '«الكاتب يكرر كلمة الهدر في كل فقرة، إذن يريدنا أن نوفر الماء»', 'استدلال من التكرار', '', '']],
   obs2: [['S021', 'استخراج الفكرة الرئيسة', 'قارن بين فقرتين قبل أن يكتب الفكرة، وكتبها بلغته', 'تحسّن', '', '']], hours: '6'},
  {wiz: {name: 'الاستقصاء العلمي في العلوم: فريق مدرستين', org: 'مدرستان ابتدائيتان (بيانات للتجربة)', stage: 'الابتدائية', grade: 'الخامس الابتدائي', year: '1448هـ', duration: 'ثمانية أسابيع', subjects: ['العلوم'], myRoles: ['leader'],
    team: [{name: 'T21 معلم علوم', email: 't21.demo@example.com', roles: ['teacher'], school: 'ابتدائية (أ)'}, {name: 'T22 معلم علوم', email: 't22.demo@example.com', roles: ['observer', 'content'], school: 'ابتدائية (ب)'}, {name: 'T23 مشرف', email: 't23.demo@example.com', roles: ['facilitator'], school: 'مكتب التعليم'}],
    longTerm: 'أن يطرح المتعلمون أسئلة قابلة للاختبار ويصمموا تجارب بسيطة عادلة.', statement: 'يجري المتعلمون التجارب باتباع الخطوات، لكنهم لا يغيّرون متغيرًا واحدًا فقط.', evidence: 'ملاحظة حصص المختبر في المدرستين.', learners: 'الخامس الابتدائي',
    lessonsPerWeek: '3', lessonMinutes: '40', cycles: 1, meetingDay: 'الخميس', meetingTime: 'عن بُعد', modules: ['customObs']},
   topic: 'أثر درجة الحرارة في سرعة الذوبان', indicators: ['طرح سؤال قابل للاختبار', 'ضبط المتغيرات', 'القياس', 'تفسير النتائج'], customObsFields: ['المجموعة', 'أداة القياس المستخدمة', 'هل طرح المتعلم سؤالًا؟'],
   lesson: {title: 'هل يذوب السكر أسرع في الماء الساخن؟', concepts: 'الذوبان، المتغير المستقل والتابع، التجربة العادلة', outcomes: 'يصمم المتعلم تجربة يغيّر فيها متغيرًا واحدًا', tasks: 'تصميم تجربة في مجموعات وتسجيل الزمن', questionsText: 'ما الذي ستغيّره؟ ما الذي سيبقى ثابتًا؟', expected: 'تغيير الحرارة وكمية الماء معًا', misconceptions: 'كل التغييرات مسموحة', time: '40 دقيقة', evidence: 'ورقة تصميم التجربة'},
   obs: [['م2', 'ضبط المتغيرات', 'غيّرت المجموعة درجة الحرارة وكمية السكر في الوقت نفسه', 'لا تميّز المتغير المستقل', '', 'تغيير أكثر من متغير', {'المجموعة': '2', 'أداة القياس المستخدمة': 'ساعة إيقاف', 'هل طرح المتعلم سؤالًا؟': 'لا'}], ['S043', 'طرح سؤال قابل للاختبار', '«هل يذوب أسرع لو حرّكناه؟»', 'سؤال قابل للاختبار', '', '', {'المجموعة': '3', 'أداة القياس المستخدمة': 'ساعة إيقاف', 'هل طرح المتعلم سؤالًا؟': 'نعم'}]],
   decision: 'إضافة جدول «ما أغيّره / ما أقيسه / ما أثبّته» في ورقة التصميم', proposeOnly: true}];
async function seedDemo(spec) {
  const pid = await createProject(spec.wiz, {demo: true, indicators: spec.indicators || DEFAULT_INDICATORS.slice(), customObsFields: spec.customObsFields || []}); if (!pid) return null;
  try { await fillDemo(pid, spec); return pid; } catch (x) { await failedCreate(pid, x); return null; }
}
async function fillDemo(pid, spec) {
  const pr = db.collection('projects').doc(pid); const put = (c, id, data) => pr.collection(c).doc(id).set(Object.assign({createdBy: ME.uid, createdAt: nowIso()}, data));
  await pr.collection('cycles').doc('c1').set({title: '', topic: spec.topic, status: 'active', lessonDate: today(), teacherUid: ME.uid, observers: [ME.uid], contentStudy: 'دراسة الفريق للموضوع في المنهج: المفاهيم الأساسية والمتطلبات السابقة والأخطاء الشائعة وتدرّج الفكرة.'}, {merge: true});
  await put('lessons', 'le1', Object.assign({cycleId: 'c1', version: 1, familyId: 'le1', parentId: '', topic: spec.topic}, spec.lesson));
  const addObs = async (list, v) => { const ids = []; for (const [focus, indicator, direct, interpretation, sl, tag, custom] of list) { const d = {cycleId: 'c1', lessonId: v === 1 ? 'le1' : 'le2', lessonVersion: v, focus, indicator, direct, interpretation, tag: tag || '', time: ''}; if (spec.solo) d.soloLevel = sl; if (custom) d.custom = custom; const id = nid('ob'); ids.push(id); await put('observations', id, d); } return ids; };
  const obIds = await addObs(spec.obs, 1); const meId = nid('me'), deId = nid('de');
  await put('meetings', meId, {date: today(), cycleId: 'c1', agenda: 'عرض الأدلة\nالبحث عن نمط\nقرارات التحسين', attendees: [ME.uid], notes: 'عرض الملاحظون أدلتهم، وظهر نمط متكرر: ' + (spec.obs.map(o => o[5]).filter(Boolean)[0] || '—')});
  await put('decisions', deId, {cycleId: 'c1', lessonId: 'le1', meetingId: meId, type: 'تعديل مهمة', evidenceIds: obIds.slice(0, 2), evidenceText: '', decision: spec.decision, rationale: 'بناءً على الأدلة المختارة', status: spec.proposeOnly ? 'proposed' : 'approved'});
  if (!spec.proposeOnly) {
    await put('lessons', 'le2', Object.assign({}, spec.lesson, {cycleId: 'c1', version: 2, familyId: 'le1', parentId: 'le1', topic: spec.topic, changeNote: spec.change, decisionId: deId}));
    await addObs(spec.obs2 || [], 2);
  }
  await put('reflections', 'rf1', {cycleId: 'c1', learned: 'الأدلة المباشرة كشفت أن المتعلمين يحتاجون إلى ' + (spec.proposeOnly ? 'ضبط المتغيرات صراحة' : 'سؤال يدفعهم إلى التفسير لا الوصف') + '.', change: 'أبدأ بسؤال تنبؤ وأطلب التبرير دائمًا.', hours: spec.hours || ''});
  if (spec.solo) { const r = rng(7); const cs = codes('S', spec.scores[0].length); for (const v of [1, 2]) await put('soloscores', 'ss' + v, {cycleId: 'c1', lessonId: v === 1 ? 'le1' : 'le2', lessonVersion: v, group: 'فصل التطوير', date: today(), scores: Object.fromEntries(cs.map((c, i) => [c, spec.scores[v - 1][i]]))}); }
  if (spec.ai) await put('ai', 'ai1', {purpose: 'solo', cycleId: 'c1', lessonId: 'le1', prompt: '(طلب تجريبي)', output: 'السؤال 3 علائقي؛ لا يوجد سؤال تجريدي ممتد. مقترح: «صمّمي خوارزمية لآلة بيع تتحقق من الرصيد قبل الصرف وفسّري موضع الشرط».', judgment: 'modify', reason: 'المقترح مناسب لكن صغناه بسياق مألوف للطالبات', adopted: 'مهمة نقل: آلة البيع'});
  if (spec.research) {
    const r = rng(11); const g = [{id: 'gp', name: '1/1 فصل التطوير', role: 'single', kind: 'pilot'}, {id: 'ge', name: '1/2 التجريبية', role: 'exp', kind: 'formal'}, {id: 'gc', name: '1/3 الضابطة', role: 'ctrl', kind: 'formal'}];
    await pr.collection('research').doc('design').set({title: 'فاعلية التدريس المصمم وفق تصنيف SOLO عبر بحث الدرس المدعوم بالذكاء الاصطناعي التوليدي في تنمية عمق الفهم المفاهيمي لدى طالبات المرحلة الثانوية: دراسة مختلطة', questions: 'ما فاعلية التدريس المصمم وفق SOLO في تنمية عمق الفهم المفاهيمي مقارنة بالتدريس المعتاد؟\nكيف طوّر الفريق تصميم التدريس وفق SOLO عبر دورات بحث الدرس؟\nكيف استخدمت المعلمات مخرجات الذكاء الاصطناعي التوليدي في التخطيط والمراجعة؟\nكيف يفسّر تحليل عملية التطوير الفروق في عمق الفهم؟', method: 'mixed', quantDesign: 'two', mixedType: 'مدمج QUAN(qual)', phases: 'الإعداد ← تطوير التدخل (دورات بحث الدرس في فصل التطوير) ← اختبار الفاعلية (قبلي، تدريس مطوّر مقابل معتاد، بعدي) ← التحليل والدمج', limits: 'تُنسب النتيجة إلى التدخل المتكامل لا إلى عنصر منفرد. بيانات التطوير منفصلة عن التجربة الرئيسة. يُوثّق التدريس المعتاد ودرجة الالتزام بالتنفيذ.', groups: g, measures: [{id: 'm1', name: 'مهام أداء وفق SOLO', items: 4, max: 4}], ethics: {approval: 'تجريبي-001', approvalDate: today(), permission: 'إذن تجريبي', consents: 'موافقات طوعية مكتوبة (تجريبية)'}, createdBy: ME.uid, createdAt: nowIso()});
    const gen = (base, n, from) => Object.fromEntries(codes('S', n, from).map(c => [c, [0, 1, 2, 3].map(() => Math.max(0, Math.min(4, Math.round(base + (r() - 0.5) * 2.2))))]));
    const sets = [['ge', 'pre', 1.4, 101], ['ge', 'post', 2.2, 101], ['gc', 'pre', 1.5, 201], ['gc', 'post', 1.8, 201]];
    for (const [gid, time, base, from] of sets) await pr.collection('research').doc(`sc_m1_${gid}_${time}`).set({kind: 'scores', measureId: 'm1', groupId: gid, time, data: gen(base, 14, from), createdBy: ME.uid, createdAt: nowIso()});
  }
  return pid;
}
ACT.demos = async b => {
  if (b.dataset.busy) return; b.dataset.busy = 1; b.disabled = true; toast('يجري إنشاء المشاريع التجريبية…');
  const ids = []; for (const sp of DEMOS) { const id = await seedDemo(sp); if (!id) break; ids.push(id); }
  if (ids.length) { S.pid = ids[0]; store.set('pid', ids[0]); S.subKey = ''; S.cycleId = 'c1'; store.set('cycle', 'c1'); if (S.projects.some(p => p.id === ids[0])) selectProject(ids[0]); S.view = 'dash'; store.set('view', 'dash'); toast('أُنشئت ' + ids.length + ' مشاريع تجريبية. بدّل بينها من القائمة الجانبية.'); render(); }
};

/* ---------- deleting a project, and repairing one whose creation stopped half-way ---------- */
ACT.delproj = async b => {
  if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'اضغطي مرة أخرى للحذف النهائي'; return; }
  try { await db.collection('projects').doc(b.dataset.id).delete(); toast('حُذف المشروع.'); if (S.pid === b.dataset.id) { S.pid = ''; store.set('pid', ''); } } catch (x) { dbErr(x); }
};
ACT.repairproj = async b => {
  b.disabled = true; const P = S.P; const pr = pref();
  try {
    await pr.collection('members').doc(ME.uid).set({uid: ME.uid, email: ME.email, name: ME.name || ME.email, roles: (P.researcherUids || []).includes(ME.uid) ? ['leader', 'researcher'] : ['leader'], school: P.org || '', joinedAt: nowIso()});
    if (!D.cycles.length) { const n = Math.max(1, Math.min(12, Number((P.schedule || {}).cycles) || 1)); for (let k = 1; k <= n; k++) await pr.collection('cycles').doc('c' + k).set({n: k, title: '', status: k === 1 ? 'active' : 'planned', topic: '', createdBy: ME.uid, createdAt: nowIso()}); }
    toast('اكتمل إنشاء المشروع.');
  } catch (x) { b.disabled = false; if (x.code === 'permission-denied') toast('ما زالت قواعد الأمان القديمة مفعّلة. انشري القواعد الجديدة في Firebase أولًا.'); else dbErr(x); }
};

/* ---------- after each render, and start-up ---------- */
const invPending = new Set();
function afterRender() {
  S.invited.forEach(p => {
    if (S.invRoles[p.id] || invPending.has(p.id)) return; invPending.add(p.id);
    db.collection('projects').doc(p.id).collection('invites').doc(ME.email).get()
      .then(d => { S.invRoles[p.id] = d.exists ? (d.data().roles || ['teacher']) : ['teacher']; schedule(); })
      .catch(() => { S.invRoles[p.id] = ['teacher']; });
  });
}
(async function boot() {
  try { await db.collection('users').doc(ME.uid).set({email: ME.email, name: ME.name || '', lastSeen: nowIso()}, {merge: true}); } catch (x) { console.warn(x); }
  watchProjects(); render();
})();
(() => { const mb = $('#menuBtn'); if (mb) mb.addEventListener('click', () => { const r = $('.rail'); const o = r.classList.toggle('open'); mb.setAttribute('aria-expanded', o); }); })();
if (window.BURHAN_NEWNAME && B.auth.currentUser) B.auth.currentUser.updateProfile({displayName: window.BURHAN_NEWNAME}).catch(() => {});

})();
