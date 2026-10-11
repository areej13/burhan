(() => {
'use strict';

/* =========================================================
   1. Content: subjects, phases (the leader's playbook), practices
   ========================================================= */
const SUBJ = [
  {k:'dt', n:'التقنية الرقمية', ex:'تصميم خوارزمية لحل مشكلة', obs:'كتبت الطالبة خطوات الخوارزمية صحيحة لكنها لم تستطع تفسير سبب ترتيب الشرط قبل التكرار.'},
  {k:'math', n:'الرياضيات', ex:'حل المعادلات الأسية', obs:'حلت المجموعة المعادلة إجرائيًا، وعند سؤالها «لماذا أخذتِ اللوغاريتم؟» لم تربط الخطوة بخصائص الأسس.'},
  {k:'chem', n:'الكيمياء', ex:'سرعة التفاعل الكيميائي', obs:'فسّرت الطالبة أثر درجة الحرارة على سرعة التفاعل، لكنها لم تنقل التفسير إلى أثر التركيز.'},
  {k:'phys', n:'الفيزياء', ex:'تفسير منحنيات السرعة–الزمن', obs:'قرأت الطالبة الميل رقمًا ولم تفسّره معدل تغيّر للسرعة إلا بعد تلميح «ماذا يحدث للسرعة كل ثانية؟».'}];
const SUBJ_BY_NAME = Object.fromEntries(SUBJ.map(s => [s.n, s]));
const subjCls = n => 'chip sub-' + ((SUBJ_BY_NAME[n] || {}).k || 'x');
const subjChip = n => n ? `<span class="${subjCls(n)}">${esc(n)}</span>` : '';

const PRACTICES = [
  ['diag','تشخيص احتياجات المتعلمات'],['evid','استخدام أدلة التعلّم'],['diff','تصميم التعليم المتمايز'],['scaf','بناء المهام المتدرجة'],
  ['ques','أسئلة تكشف التفكير'],['feed','التغذية الراجعة'],['adapt','تعديل التدريس بالأدلة'],['ai','استخدام AI تربويًا'],
  ['refl','التأمل في الممارسة'],['collab','التعاون المهني']];
const PRACTICE_NAME = Object.fromEntries(PRACTICES);
const TIMEPOINTS = [['Baseline','خط الأساس (قبل)'],['During','أثناء الدورة'],['Post','بعد الدورة'],['Delayed','احتفاظ (بعد 3–4 أسابيع)']];
const T_POINTS = [['Baseline','قبلي'],['Midpoint','منتصف'],['Post','بعدي']];
const INDICATORS = [['explanation','التفسير','تشرح الطالبة لماذا، لا ماذا فقط'],['transfer','نقل التعلّم','تطبّق الفكرة في موقف جديد'],['independence','الاستقلالية','تنجز دون دعم أو بأقل دعم'],['verification','التحقق من الأخطاء','تراجع إجابتها وتكتشف خطأها']];
const RUBRIC = ['0 لا يظهر','1 بداية','2 جزئي','3 واضح','4 متمكّن'];
const CONTEXTS = {
  in:{n:'أثناء الحصة',d:'ملاحظة تعلّم الطالبات في درس البحث: لحظة فهم، تعثّر، أو أثر دعم.',icon:'eye'},
  out:{n:'خارج الحصة',d:'تخطيط، تصحيح أعمال، تجريب استراتيجية، أو ملاحظة عن فصلك.',icon:'notes'},
  meeting:{n:'في الاجتماع',d:'ما عرضتِه من أدلة وما نوقش ومقترحك للفريق.',icon:'meetings'},
  after:{n:'بعد الاجتماع',d:'تأمل قصير: ماذا تعلّمتُ، وماذا سأغيّر في حصتي القادمة.',icon:'refl'}};
const OUT_KINDS = ['تشخيص: عينات أعمال الطالبات','تخطيط درس البحث','تنفيذ درس البحث','تصحيح وتحليل أعمال','تجريب استراتيجية في فصلي','تواصل مع زميلة من مقرر آخر','ملاحظة عامة'];
const AI_MODES = ['تصميم درس جديد','تعديل درس قائم','مستويات دعم متدرجة','أسئلة تكشف التفكير','مهمة نقل التعلّم','بطاقة خروج','تحليل أنماط الأخطاء','أخرى'];
const AI_TOOLS = ['Claude داخل بُرهان','Microsoft Copilot','ChatGPT','Gemini','أداة أخرى'];
const DEC = {accepted:'قبول',modified:'تعديل',rejected:'رفض'};
const LESSON_FIELDS = [
  ['outcomes','نواتج التعلّم','ماذا ستعرف الطالبة وتستطيع أن تفعل في نهاية الدرس؟ ابدئي بفعل قابل للملاحظة: تفسّر، تقارن، تبرّر.'],
  ['problem','مشكلة التعلّم المستهدفة','الجزء من المشكلة المشتركة الذي يعالجه هذا الدرس.'],
  ['prior','المعرفة السابقة','ما الذي يجب أن تعرفه الطالبة قبل الدرس؟'],
  ['expected','التوقعات حول استجابات الطالبات','كيف نتوقع أن تفكر الطالبات؟ اكتبي إجابتين أو ثلاثًا متوقعة.'],
  ['stumbles','نقاط التعثّر المتوقعة','أين ستتعثر الطالبات غالبًا؟ هذه ما ستراقبه الملاحِظات.'],
  ['diffMethods','أساليب التعليم المتمايز','كيف يختلف المدخل أو المهمة أو المنتج بين الطالبات؟'],
  ['support','مستويات الدعم','دعم 1: تلميح، دعم 2: بطاقة موجّهة، دعم 3: مثال محلول جزئيًا.'],
  ['formative','الأسئلة التكوينية','أسئلة تكشف التفكير: كيف عرفتِ؟ ماذا لو…؟'],
  ['evidencePlan','أدلة التعلّم المطلوبة','ما الذي سنجمعه ونصححه بمقياس 0–4؟'],
  ['aiRole','دور الذكاء الاصطناعي','أين ساعد AI في التصميم، وأين سيُستخدم في الحصة إن وُجد؟'],
  ['independent','ما تؤديه الطالبة باستقلالية','الجزء الذي تنجزه الطالبة دون دعم.'],
  ['transfer','مهمة نقل التعلّم','موقف جديد تطبّق فيه الطالبة الفكرة.'],
  ['exit','بطاقة الخروج','سؤال أو سؤالان قصيران يُصحَّحان بمقياس 0–4.']];

/* The leader's playbook: what each phase is for, what to do, what counts as done. */
const PHASES = [
 {n:'التشخيص',wk:'الأسبوع 1',goal:'نتفق على مشكلة تعلّم واحدة مشتركة تظهر في جميع المقررات المشاركة.',
  do:['كل معلمة تجمع 5–6 عينات أعمال من فصلها (بلا أسماء) وتدوّن نمط الصعوبة من «خارج الحصة».','اجتماع تشخيص: كل معلمة تعرض نمطها في 3 دقائق.','صياغة المشكلة المشتركة وسؤال الاستقصاء في «الإعداد».'],
  who:'كل الفريق · تقود القائدة الاجتماع',out:'مشكلة تعلّم مشتركة + سؤال استقصاء مهني',
  ev:[['ملاحظات تشخيص من كل مقرر', c => [subjCount(inCy(D.notes, c).filter(n => n.context === 'out')),, Math.max(1, SUBJ.length)]],['اجتماع تشخيص مسجّل', c => [inCy(D.meetings, c).length, 1]],['قرار بصياغة المشكلة', c => [inCy(D.decisions, c).length, 1]],['المشكلة مكتوبة في الإعداد', () => [D.settings.learningProblem ? 1 : 0, 1]]],
  act:[['تدوين خارج الحصة','rec','out'],['تسجيل اجتماع','meet','meetings'],['تسجيل قرار','meet','decisions']]},
 {n:'جمع خط الأساس',wk:'الأسبوع 1',goal:'نقيس مستوى الطالبات قبل أي تدخل حتى نعرف لاحقًا ماذا تغيّر.',
  do:['مهمة قصيرة بنفس الفكرة مكيّفة لكل مقرر (10–15 دقيقة).','تصحيح كل عمل بمقياس 0–4 في المؤشرات الأربعة.','إدخال الدرجات برموز الطالبات من «دليل تعلّم» بنقطة «خط الأساس».'],
  who:'كل معلمة في فصلها',out:'درجات خط أساس مرمّزة لكل مقرر',
  ev:[['مقررات لها خط أساس', c => [subjCount(inCy(D.evidence, c).filter(e => e.timePoint === 'Baseline')),, Math.max(1, SUBJ.length)]],['أدلة خط أساس (20 على الأقل)', c => [inCy(D.evidence, c).filter(e => e.timePoint === 'Baseline').length, 20]]],
  act:[['إدخال دليل تعلّم','rec','evidence']]},
 {n:'التخطيط',wk:'الأسبوع 2',goal:'نحوّل نتائج خط الأساس إلى هدف ودرس بحث واضح.',
  do:['اجتماع تخطيط: ماذا أظهر خط الأساس؟','اختيار مقرر درس البحث والفصل الذي سيُنفَّذ فيه.','كتابة نواتج التعلّم والتوقعات ونقاط التعثّر.'],
  who:'الفريق · المعلمة المنفّذة تقود المحتوى',out:'هدف بعيد المدى + مسودة درس',
  ev:[['اجتماع تخطيط', c => [inCy(D.meetings, c).length, 2]],['تدوين تخطيط', c => [inCy(D.notes, c).filter(n => n.kind === OUT_KINDS[1]).length, 1]],['الهدف بعيد المدى في الإعداد', () => [D.settings.goal ? 1 : 0, 1]]],
  act:[['تدوين تخطيط','rec','out'],['تسجيل اجتماع','meet','meetings']]},
 {n:'تصميم درس البحث',wk:'الأسبوع 2',goal:'نكتب النسخة الأولى من درس البحث بكل عناصرها.',
  do:['كتابة V1 في «الدروس» أو بمساعدة «استوديو AI».','مراجعة الفريق: هل نقاط التعثّر قابلة للملاحظة؟','توزيع الملاحِظات على المجموعات.'],
  who:'المعلمة المنفّذة + زميلة من مقرر آخر',out:'خطة درس البحث V1',
  ev:[['نسخة أولى من الدرس', c => [inCy(D.lessons, c).filter(l => l.version === 1).length, 1]],['توثيق AI قبل الدرس بحكم بشري (اجتماع 1–4)', c => [inCy(D.ai, c).filter(a => ['S1','S2','S3','S4'].includes(a.stage) && a.reason).length, 1]]],
  act:[['استوديو AI','go','ai'],['كتابة درس','go','lessons']]},
 {n:'التنفيذ',wk:'الأسبوع 3',goal:'تنفّذ معلمة الدرس، والفريق يلاحظ الطالبات لا المعلمة.',
  do:['تنفيذ V1 في الفصل المحدد.','كل ملاحِظة تتابع مجموعة أو طالبتين برموزهن.','تدوين التنفيذ من «خارج الحصة» بنوع «تنفيذ درس البحث».'],
  who:'المعلمة المنفّذة + 2–3 ملاحِظات',out:'درس منفَّذ وملاحظات',
  ev:[['تدوين التنفيذ', c => [inCy(D.notes, c).filter(n => n.kind === OUT_KINDS[2]).length, 1]]],
  act:[['تدوين التنفيذ','rec','out']]},
 {n:'الملاحظة',wk:'الأسبوع 3',goal:'نجمع لحظات التعلّم والتعثّر كما حدثت.',
  do:['3 ملاحظات على الأقل لكل ملاحِظة من «أثناء الحصة».','كل ملاحظة: الوقت، الطالبة/المجموعة، ما حدث، التلميح، الاستجابة.'],
  who:'الملاحِظات',out:'ملاحظات صفية مرمّزة',
  ev:[['ملاحظات أثناء الحصة (6 على الأقل)', c => [inCy(D.notes, c).filter(n => n.context === 'in').length, 6]]],
  act:[['ملاحظة أثناء الحصة','rec','in']]},
 {n:'جمع الأدلة',wk:'الأسبوع 3',goal:'نجمع أعمال الطالبات وبطاقات الخروج ونصححها.',
  do:['تصحيح بطاقات الخروج بمقياس 0–4.','إدخالها بنقطة «أثناء الدورة».'],
  who:'المعلمة المنفّذة + زميلة للتصحيح المزدوج',out:'أدلة أثناء الدورة',
  ev:[['أدلة «أثناء الدورة»', c => [inCy(D.evidence, c).filter(e => e.timePoint === 'During').length, 15]]],
  act:[['إدخال دليل تعلّم','rec','evidence']]},
 {n:'تحليل الأدلة',wk:'الأسبوع 4',goal:'نقارن ما توقعناه بما حدث، ونقرر ماذا نغيّر.',
  do:['اجتماع تحليل وفق البروتوكول (45 دقيقة).','كل قرار يُسجَّل مع دليله وبدائله وسببه.','مهام إعادة التصميم توزَّع في نهاية الاجتماع.'],
  who:'كل الفريق',out:'قرارات مبنية على أدلة',
  ev:[['قرار مرتبط بدليل', c => [inCy(D.decisions, c).filter(d => d.evidence).length, 1]],['ملاحظات «في الاجتماع»', c => [inCy(D.notes, c).filter(n => n.context === 'meeting').length, 2]]],
  act:[['تسجيل قرار','meet','decisions'],['ملاحظة في الاجتماع','rec','meeting']]},
 {n:'إعادة التصميم',wk:'الأسبوع 4',goal:'نكتب V2 ونربط كل تغيير بالقرار الذي أدى إليه.',
  do:['إنشاء نسخة جديدة من الدرس مع «ما الذي تغيّر ولماذا».','ربط النسخة بالقرار.'],
  who:'معلمة من مقرر آخر غالبًا',out:'خطة درس البحث V2',
  ev:[['نسخة ثانية مرتبطة بقرار', c => [inCy(D.lessons, c).filter(l => l.version >= 2 && (l.decisionId || l.changeNote)).length, 1]],['توثيق AI بعد الملاحظة بحكم بشري (اجتماع 5)', c => [inCy(D.ai, c).filter(a => a.stage === 'S5' && a.reason).length, 1]]],
  act:[['استوديو AI (تعديل)','go','ai'],['نسخة جديدة','go','lessons']]},
 {n:'إعادة التطبيق',wk:'الأسبوع 5',goal:'نطبّق V2 في فصل آخر، ويفضل في مقرر آخر.',
  do:['تنفيذ V2 وملاحظته بنفس الطريقة.','تسجيل ملاحظات «أثناء الحصة» على V2.'],
  who:'معلمة ثانية + ملاحِظات',out:'ملاحظات على V2',
  ev:[['ملاحظات على النسخة الثانية', c => [inCy(D.notes, c).filter(n => n.context === 'in' && /-V[2-9]/.test(n.lessonCode || '')).length, 3]]],
  act:[['ملاحظة أثناء الحصة','rec','in']]},
 {n:'قياس الأثر',wk:'الأسبوع 5–6',goal:'نقيس الطالبات بعد الدورة ونقارن بخط الأساس.',
  do:['مهمة بعدية مكافئة لمهمة خط الأساس.','إدخال الدرجات بنقطة «بعد الدورة»، والاحتفاظ بعد 3–4 أسابيع.'],
  who:'كل معلمة في فصلها',out:'مقارنة قبل/بعد لكل مقرر',
  ev:[['أدلة «بعد الدورة»', c => [inCy(D.evidence, c).filter(e => e.timePoint === 'Post').length, Math.max(1, inCy(D.evidence, c).filter(e => e.timePoint === 'Baseline').length)]],['مقررات لها قياس بعدي', c => [subjCount(inCy(D.evidence, c).filter(e => e.timePoint === 'Post')),, Math.max(1, SUBJ.length)]]],
  act:[['إدخال دليل تعلّم','rec','evidence'],['تقرير أثر الطالبات','report','impact']]},
 {n:'التأمل',wk:'الأسبوع 6',goal:'كل معلمة توثّق ما تغيّر في ممارستها، ثم نغلق الدورة بتقرير.',
  do:['تأمل «بعد الاجتماع» من كل معلمة.','إصدار «تقرير الدورة» ومناقشته.','تحديد مشكلة الدورة التالية.'],
  who:'كل الفريق',out:'تأملات + تقرير الدورة',
  ev:[['تأملات من أعضاء الفريق', c => [new Set(inCy(D.notes, c).filter(n => n.context === 'after').map(n => n.author)).size, Math.max(1, D.team.length)]],['سلسلة AI مكتملة: دليل ← مقترح ← حكم ← قرار تمايز', c => [chainComplete(c), 2]]],
  act:[['كتابة تأمل','rec','after'],['تقرير الدورة','report','cycle']]}];

const COLLS = ['access','team','classes','cycles','lessons','ai','notes','meetings','decisions','evidence','tasks','practice','exports','instruments','rqs','library'];
const ICONS = {
  dash:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  analysis:'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
  library:'<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7M8 11h7"/>',
  home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  rec:'<path d="M12 5v14M5 12h14"/>',
  notes:'<path d="M5 4h11l3 3v13H5z"/><path d="M8 10h8M8 14h8M8 18h5"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  refl:'<path d="M4 5h16v11H8l-4 4z"/>',
  cycle:'<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>',
  ai:'<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
  lessons:'<path d="M4 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H4z"/><path d="M20 5h-4a2 2 0 0 0-2 2"/><path d="M20 5v13h-6"/>',
  meetings:'<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M3 19c0-3 2.5-5 5-5s5 2 5 5M11 19c0-3 2.5-5 5-5s5 2 5 5"/>',
  evidence:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  reports:'<path d="M6 3h9l4 4v14H6z"/><path d="M9 13h6M9 17h6M9 9h3"/>',
  research:'<path d="M10 3h4M11 3v6L5 19a1 1 0 0 0 .9 1.5h12.2A1 1 0 0 0 19 19l-6-10V3"/>',
  playbook:'<path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h4"/>',
  setup:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>'};
const NAV = [
  ['العمل اليومي',[['home','ماذا أفعل الآن؟'],['rec','سجّلي'],['cycle','دورة بحث الدرس'],['ai','الذكاء الاصطناعي'],['lessons','الدروس ونسخها'],['meetings','الاجتماعات والقرارات']]],
  ['الأدلة والتحليل',[['dash','لوحة المعلومات'],['evidence','أدلة تعلّم الطالبات'],['analysis','التحليل'],['reports','التقارير']]],
  ['المعرفة والمراجع',[['library','المكتبة والمراجع'],['playbook','دليل القيادة والتطبيق']]],
  ['البحث والإدارة',[['research','البحث والبيانات'],['setup','الإعداد']]]];
const VIEW_KEYS = NAV.flatMap(g => g[1].map(v => v[0]));

/* =========================================================
   2. State and helpers
   ========================================================= */
const D = {settings:{}}; COLLS.forEach(c => D[c] = []);
const S = {aiTab:'studio',assets:null,dashCycle:'',dashInd:'explanation',anTab:'growth',anInd:'explanation',anFrom:'Baseline',anTo:'Post',libCat:'',libq:'',qq:'',qctx:'',qpr:'',repMeeting:'',delArm:'',db:null,user:null,sample:null,downloads:null,uid:null,canEdit:false,view:'home',dirty:false,recType:'',meetTab:'live',resTab:'map',
  pbTab:'design',repType:'weekly',phaseSel:0,subj:'',aiAbort:null,aiBusy:false,sig:{},ready:false,err:''};
try { const v = localStorage.getItem('burhan.view'); if (VIEW_KEYS.includes(v)) S.view = v; S.subj = localStorage.getItem('burhan.subj') || ''; } catch (e) {}

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad = (n, w) => String(n).padStart(w, '0');
const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2); };
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2); };
const nowTime = () => { const d = new Date(); return pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2); };
const fmtDate = s => { if (!s) return '—'; try { return new Date(String(s).length <= 10 ? s + 'T12:00:00' : s).toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', {day:'numeric',month:'short',year:'numeric'}); } catch (e) { return s; } };
const dateOf = r => String(r.date || r.createdAt || '').slice(0, 10);
const byNewest = (a, b) => String(b.createdAt || b.date || '').localeCompare(String(a.createdAt || a.date || ''));
const icon = k => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ''}</svg>`;
const phase = () => D.settings.studyPhase || 'Pilot';
const myMember = () => D.team.find(t => t.userId && t.userId === S.uid);
const myCode = () => (myMember() || {}).code || '';
const mySubject = () => { const m = myMember(); return m && SUBJ_BY_NAME[m.discipline] ? m.discipline : ''; };
const curCycle = () => D.cycles.find(c => c.code === D.settings.currentCycle) || D.cycles.slice().sort((a, b) => String(b.code).localeCompare(String(a.code)))[0];
const inCy = (arr, c) => c ? arr.filter(r => r.cycleId === c.code) : [];
const subjCount = arr => new Set(arr.map(r => r.subject).filter(Boolean)).size;
const bySubj = arr => S.subj ? arr.filter(r => r.subject === S.subj) : arr;
const classLabel = c => c ? `${c.name} · ${c.count || '؟'} طالبة` : '';
const latestLessons = () => { const m = {}; D.lessons.forEach(l => { if (!m[l.lessonId] || (l.version || 0) > (m[l.lessonId].version || 0)) m[l.lessonId] = l; }); return Object.values(m).sort((a, b) => String(a.lessonId).localeCompare(String(b.lessonId))); };
const lessonOf = id => D.lessons.find(l => l._id === id);
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
const f1 = v => v == null ? '—' : v.toFixed(1);
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 4200); }
function opts(list, sel, blank) { return (blank !== undefined ? `<option value="">${esc(blank)}</option>` : '') + list.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}"${String(v) === String(sel ?? '') ? ' selected' : ''}>${esc(l)}</option>`; }).join(''); }
function checks(name, list, sel) { const s = new Set(sel || []); return `<div class="checks" role="group">${list.map(([v, l]) => `<label><input type="checkbox" name="${name}" value="${esc(v)}"${s.has(v) ? ' checked' : ''}>${esc(l)}</label>`).join('')}</div>`; }
function field(label, inner, hint) { return `<label class="f"><span>${esc(label)}</span>${hint ? `<span class="hint">${esc(hint)}</span>` : ''}${inner}</label>`; }
const inp = (name, val, attrs = '') => `<input name="${name}" id="f-${name}" value="${esc(val ?? '')}" ${attrs}>`;
const area = (name, val, attrs = '') => `<textarea name="${name}" id="f-${name}" ${attrs}>${esc(val ?? '')}</textarea>`;
const help = (title, body) => `<details class="help"><summary>${esc(title)}</summary>${body}</details>`;
const stepHead = (n, title, desc) => `<div class="stephead"><span class="n">${n}</span><div><h3>${esc(title)}</h3>${desc ? `<p>${esc(desc)}</p>` : ''}</div></div>`;
function formData(form) { const fd = new FormData(form); const o = {}; const multi = new Set($$('input[type=checkbox]', form).map(c => c.name)); for (const [k, v] of fd.entries()) { if (multi.has(k)) (o[k] = o[k] || []).push(v); else o[k] = typeof v === 'string' ? v.trim() : v; } multi.forEach(k => { if (!(k in o)) o[k] = []; }); return o; }

async function nextCode(coll, prefix, width) {
  const nums = D[coll].map(r => String(r.code || r._id || '')).filter(s => s.startsWith(prefix)).map(s => parseInt(s.slice(prefix.length), 10)).filter(n => !isNaN(n));
  let n = (nums.length ? Math.max(...nums) : 0) + 1;
  for (let i = 0; i < 6; i++) { const code = prefix + pad(n, width); const snap = await S.db.collection(coll).doc(code).get(); if (!snap.exists) return code; n++; }
  return prefix + pad(n, width) + '-' + Math.random().toString(36).slice(2, 5);
}
function base(extra) { const c = curCycle(); const cyc = D.cycles.find(x => x.code === (extra && extra.cycleId)) || c; return Object.assign({studyPhase: (cyc && cyc.studyPhase) || phase(), cycleId: c ? c.code : '', author: myCode() || '—', createdAt: new Date().toISOString()}, extra); }
async function create(coll, prefix, width, data) {
  if (!S.db) { toast('لا يمكن الحفظ: قاعدة البيانات غير متاحة في هذا العرض.'); return null; }
  try { const code = await nextCode(coll, prefix, width); await S.db.collection(coll).doc(code).set(Object.assign({code}, data)); return code; }
  catch (e) { handleDbErr(e); return null; }
}
function handleDbErr(e) {
  const c = e && e.code;
  if (c === 'quota_exceeded') toast('امتلأت سعة قاعدة البيانات. صدّري البيانات ثم احذفي سجلات قديمة.');
  else if (c === 'invalid_argument' || c === 'permission-denied') toast('لم يُحفظ: ليست لديكِ صلاحية الكتابة. اطلبي من صاحبة المنصة مشاركتها معكِ بصلاحية الاستخدام.');
  else toast('تعذّر الحفظ مؤقتًا. حاولي مرة أخرى بعد لحظات.');
}

/* =========================================================
   3. The shared context block (subject → class → lesson → cycle → date)
   ========================================================= */
function ctxBlockFull(n, pre = {}) {
  const subj = pre.subject || S.subj || mySubject() || '';
  const c = curCycle();
  return `<section class="stepsec">${stepHead(n, 'السياق', 'المقرر والفصل والدرس. يُحفظ اسم الفصل وعدد طالباته تلقائيًا مع السجل.')}
  <div role="radiogroup" aria-label="المقرر"><div class="hint" style="margin-bottom:6px">المقرر</div><div class="seg">${SUBJ.map(s => `<label class="sub-${s.k}" style="background:var(--surface)"><input type="radio" name="subject" value="${esc(s.n)}"${s.n === subj ? ' checked' : ''} required>${esc(s.n)}</label>`).join('')}</div></div>
  <div class="grid">
    ${field('الفصل', `<select name="classId" id="f-classId" data-classfor>${classOptions(subj, pre.classId)}</select>`, 'يظهر فصول المقرر المختار فقط')}
    <div class="grid" data-newclass hidden style="grid-column:1/-1">${field('اسم الفصل الجديد', inp('newClassName', '', 'placeholder="مثال: 2/3 علمي"'))}${field('عدد الطالبات', inp('newClassCount', '', 'type="number" min="1" max="60" inputmode="numeric" placeholder="28"'))}</div>
    ${field('اسم الدرس', inp('lessonTitle', pre.lessonTitle, `list="dl-lessons" placeholder="${esc(subj ? (SUBJ_BY_NAME[subj].ex) : 'مثال: تفسير منحنيات السرعة–الزمن')}"`), 'اكتبيه أو اختاريه من الدروس السابقة')}
    ${field('دورة البحث', `<select name="cycleId" id="f-cycleId">${opts(D.cycles.map(x => [x.code, x.code + ' · ' + (x.title || '')]), pre.cycleId || (c && c.code), 'بلا دورة')}</select>`)}
    ${field('التاريخ', inp('date', pre.date || today(), 'type="date"'))}
  </div><datalist id="dl-lessons">${latestLessons().map(l => `<option value="${esc(l.title)}">${esc(l.lessonId + ' · ' + (l.subject || ''))}</option>`).join('')}</datalist></section>`;
}
function classOptions(subj, sel) {
  const list = D.classes.filter(c => !subj || c.subject === subj);
  return `<option value="">${list.length ? 'اختاري الفصل' : 'لا فصول لهذا المقرر بعد'}</option>` + list.map(c => `<option value="${esc(c.code)}"${c.code === sel ? ' selected' : ''}>${esc(classLabel(c))}</option>`).join('') + `<option value="__new">＋ إضافة فصل جديد…</option>`;
}
async function ctxResolve(o) {
  if (o.classId === '__new') {
    if (!o.newClassName) { toast('اكتبي اسم الفصل الجديد وعدد طالباته.'); return false; }
    const code = await create('classes', 'CL', 2, {name: o.newClassName, count: Number(o.newClassCount) || null, subject: o.subject || '', teacher: myCode(), createdAt: new Date().toISOString()});
    if (!code) return false; o.classId = code;
    o.className = o.newClassName; o.studentCount = Number(o.newClassCount) || null;
  } else { const cl = D.classes.find(c => c.code === o.classId); o.className = cl ? cl.name : ''; o.studentCount = cl ? Number(cl.count) || null : null; }
  delete o.newClassName; delete o.newClassCount;
  const ls = latestLessons().find(l => l.title && o.lessonTitle && l.title.trim() === o.lessonTitle.trim()) || lessonOf(o.lessonId);
  if (ls) { o.lessonId = ls._id; o.lessonCode = ls.lessonId + '-V' + ls.version; if (!o.lessonTitle) o.lessonTitle = ls.title; } else { o.lessonId = o.lessonId || ''; o.lessonCode = ''; }
  return true;
}
function ctxMeta(r) {
  const bits = [];
  if (r.subject) bits.push(subjChip(r.subject));
  if (r.className) bits.push(`<span>الفصل ${esc(r.className)}${r.studentCount ? ' · ' + esc(r.studentCount) + ' طالبة' : ''}</span>`);
  if (r.lessonTitle) bits.push(`<span>الدرس: ${esc(r.lessonTitle)}${r.lessonCode ? ' (' + esc(r.lessonCode) + ')' : ''}</span>`);
  if (r.cycleId) bits.push(`<span>${esc(r.cycleId)}</span>`);
  bits.push(`<span>${esc(fmtDate(r.date || r.createdAt))}${r.time ? ' · ' + esc(r.time) : ''}</span>`);
  if (r.author) bits.push(`<span>${esc(r.author)}</span>`);
  return `<div class="meta">${bits.join('')}</div>`;
}
const practiceChips = p => (p || []).length ? `<div class="row">${p.map(k => `<span class="chip plain">${esc(PRACTICE_NAME[k] || k)}</span>`).join('')}</div>` : '';
const practiceStep = (n, sel) => `<section class="stepsec">${stepHead(n, 'الممارسات المهنية', 'أي ممارسات ظهرت في هذا العمل؟ هذا ما نتتبّع به نمو الممارسة عبر الدورات.')}${checks('practices', PRACTICES, sel)}</section>`;
function subjBar() {
  return `<div class="row" role="group" aria-label="تصفية حسب المقرر"><span class="small muted">المقرر:</span><button class="btn small ${S.subj ? 'ghost' : ''}" data-act="subj" data-s="">الكل</button>${SUBJ.map(s => `<button class="btn small ghost sub-${s.k}" style="${S.subj === s.n ? 'box-shadow:inset 0 0 0 2px currentColor' : ''}" data-act="subj" data-s="${esc(s.n)}" aria-pressed="${S.subj === s.n}">${esc(s.n)}</button>`).join('')}</div>`;
}

/* =========================================================
   4. Word diff
   ========================================================= */
function tokens(s) { return String(s || '').split(/(\s+)/).filter(t => t !== ''); }
function diff(a, b) {
  const A = tokens(a), B = tokens(b); const n = A.length, m = B.length;
  if (n * m > 4000000) return {html: esc(b), kept: 0, added: 0, removed: 0, sim: 0};
  const L = Array.from({length: n + 1}, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  let i = 0, j = 0, out = '', kept = 0, added = 0, removed = 0; const isW = t => /\S/.test(t);
  while (i < n && j < m) {
    if (A[i] === B[j]) { out += esc(A[i]); if (isW(A[i])) kept++; i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) { if (isW(A[i])) { out += `<del>${esc(A[i])}</del>`; removed++; } i++; }
    else { if (isW(B[j])) { out += `<ins>${esc(B[j])}</ins>`; added++; } else out += esc(B[j]); j++; }
  }
  while (i < n) { if (isW(A[i])) { out += `<del>${esc(A[i])}</del>`; removed++; } i++; }
  while (j < m) { if (isW(B[j])) { out += `<ins>${esc(B[j])}</ins>`; added++; } else out += esc(B[j]); j++; }
  const sim = (kept + removed) ? Math.round(kept / Math.max(kept + removed, kept + added) * 100) : 0;
  return {html: out, kept, added, removed, sim};
}
const diffSummary = d => `<div class="grid"><div class="stat"><b>${d.sim}%</b><span>ما بقي من نص AI</span></div><div class="stat"><b>${d.kept}</b><span>كلمة أبقتها المعلمة</span></div><div class="stat"><b>${d.added}</b><span>كلمة أضافتها</span></div><div class="stat"><b>${d.removed}</b><span>كلمة حذفتها</span></div></div>`;
const suggestDecision = d => d.sim >= 90 ? 'accepted' : (d.sim <= 25 ? 'rejected' : 'modified');
function aiDiffHtml(a, b) { if (!a || !b) return '<div class="empty">تظهر المقارنة هنا بعد وجود النصّين: مخرج الذكاء الاصطناعي ونسخة المعلمة.</div>'; const d = diff(a, b); return `${diffSummary(d)}<p class="tiny muted">الأخضر: ما أضافته المعلمة. الأحمر المشطوب: ما حذفته من نص الذكاء الاصطناعي.</p><div class="diff">${d.html}</div>`; }

/* =========================================================
   5. Views
   ========================================================= */
const V = {};
const SLOTS = {};

/* ---- Home: what do I do now? ---- */
function setupStatus() {
  return [
    ['اربطي حسابك برمزك', !!myMember(), 'setup'],
    ['اكتبي مشكلة التعلّم المشتركة', !!D.settings.learningProblem, 'setup'],
    ['أضيفي فصولك (اسم الفصل وعدد الطالبات)', D.classes.length > 0, 'setup'],
    ['أنشئي دورة البحث الأولى', D.cycles.length > 0, 'setup']];
}
function phaseCard(c, idx, compact) {
  const p = PHASES[idx]; const ev = p.ev.map(([t, fn]) => { const [n, target] = fn(c); return {t, n, target, ok: target === 0 ? true : n >= target}; });
  const done = ev.filter(e => e.ok).length;
  return `<div class="row between"><div><span class="chip ${idx + 1 === Number(c.phase) ? 'solid' : 'plain'}">المرحلة ${idx + 1} من 12 · ${esc(p.wk)}</span><h2 style="margin-top:6px">${esc(p.n)}</h2></div><span class="small muted">${done} من ${ev.length} أدلة مكتملة</span></div>
  <p><b>الهدف:</b> ${esc(p.goal)}</p>
  <div class="cols"><div><h3>ماذا نفعل؟</h3><ul style="margin:6px 0 0;padding-inline-start:20px">${p.do.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="small muted" style="margin-top:8px">المسؤولة: ${esc(p.who)} · المخرج: ${esc(p.out)}</p></div>
  <div><h3>متى تكتمل المرحلة؟</h3><ul class="checklist" style="margin-top:6px">${ev.map(e => `<li><span class="tick ${e.ok ? 'y' : 'n'}" aria-hidden="true">${e.ok ? '✓' : ''}</span><span>${esc(e.t)} <span class="muted small">(${e.n}${e.target ? ' من ' + e.target : ''})</span></span></li>`).join('')}</ul></div></div>
  ${compact ? '' : ''}<div class="row">${p.act.map(([l, a, t]) => `<button class="btn ${a === 'rec' ? '' : 'ghost'} small" data-act="${a === 'rec' ? 'go-rec' : (a === 'meet' ? 'go-meet' : (a === 'report' ? 'go-report' : 'nav'))}" data-view="${esc(t)}" data-t="${esc(t)}">${esc(l)}</button>`).join('')}</div>`;
}
V.home = () => {
  const st = setupStatus(); const setupDone = st.every(s => s[1]); const c = curCycle(); const me = myMember();
  const myTasks = D.tasks.filter(t => t.status !== 'done' && (!me || t.owner === me.code || t.owner === 'الفريق')).sort((a, b) => String(a.due).localeCompare(String(b.due)));
  const nextMeeting = D.meetings.filter(m => m.date >= today()).sort((a, b) => a.date.localeCompare(b.date))[0];
  return `<div><h1>ماذا أفعل الآن؟</h1><p class="lede">${me ? `مرحبًا ${esc(me.code)} (${esc(me.discipline || '')}). ` : ''}هذه الصفحة تخبرك بالمرحلة الحالية، وما المطلوب منك هذا الأسبوع، وأين تسجّلينه.</p></div>
  ${setupDone ? '' : `<section class="panel"><h2>ابدئي هنا: إعداد المنصة في 4 خطوات</h2><p class="lede small">تُنجز مرة واحدة. بعدها تعمل كل الصفحات بفصولكِ ودورتكِ.</p><ul class="checklist">${st.map(([t, ok]) => `<li><span class="tick ${ok ? 'y' : 'n'}" aria-hidden="true">${ok ? '✓' : ''}</span><span>${esc(t)}</span></li>`).join('')}</ul><div><button class="btn" data-act="nav" data-view="setup">افتحي الإعداد</button></div></section>`}
  ${c ? `<section class="panel">${phaseCard(c, Math.min(11, Math.max(0, Number(c.phase || 1) - 1)))}</section>` : ''}
  <section class="panel"><h2>سجّلي بسرعة</h2><div class="grid">
    ${Object.entries(CONTEXTS).map(([k, x]) => `<button class="action" data-act="go-rec" data-t="${k}"><b>${icon(x.icon)}${esc(x.n)}</b><span>${esc(x.d)}</span></button>`).join('')}
    <button class="action" data-act="go-rec" data-t="evidence"><b>${icon('evidence')}دليل تعلّم طالبة</b><span>درجات 0–4 في التفسير والنقل والاستقلالية والتحقق.</span></button>
    <button class="action" data-act="nav" data-view="ai"><b>${icon('ai')}تصميم أو تعديل درس مع AI</b><span>يحفظ ما كتبه الذكاء الاصطناعي وما غيّرتِه ولماذا.</span></button></div></section>
  <div class="cols">
    <section class="panel"><h2>مهامي</h2><div class="ledger">${myTasks.length ? myTasks.slice(0, 6).map(taskRow).join('') : '<div class="empty">لا مهام مفتوحة لك. تُوزَّع المهام في نهاية كل اجتماع من «الاجتماعات والقرارات».</div>'}</div>
    ${nextMeeting ? `<div class="ok">الاجتماع القادم ${esc(nextMeeting.code)}: ${esc(fmtDate(nextMeeting.date))}${nextMeeting.goal ? ' — ' + esc(nextMeeting.goal) : ''}</div>` : '<div class="note">لا اجتماع قادم مسجّل. الإيقاع المقترح: اجتماع أسبوعي ثابت 45 دقيقة.</div>'}</section>
    <section class="panel"><h2>المقررات المشاركة</h2><div class="ledger">${SUBJ.map(s => { const cls = D.classes.filter(x => x.subject === s.n); return `<div class="rec"><div class="row between">${subjChip(s.n)}<span class="small muted">${cls.length} فصل · ${cls.reduce((a, x) => a + (Number(x.count) || 0), 0)} طالبة</span></div><div class="small">${D.notes.filter(n => n.subject === s.n).length} ملاحظة · ${D.evidence.filter(n => n.subject === s.n).length} دليل تعلّم · ${D.lessons.filter(n => n.subject === s.n).length} نسخة درس · ${D.ai.filter(n => n.subject === s.n).length} سجل AI</div></div>`; }).join('')}</div></section>
  </div>`;
};
function taskRow(t) {
  const late = t.status !== 'done' && t.due && t.due < today();
  return `<div class="rec"><div class="row between"><b>${esc(t.title)}</b><span class="chip ${t.status === 'done' ? 'plain' : (late ? 'warn' : '')}">${t.status === 'done' ? 'مكتملة' : (late ? 'متأخرة' : 'مفتوحة')}</span></div>
  <div class="meta"><span>${esc(t.code)}</span><span>المسؤولة: ${esc(t.owner || '—')}</span><span>الاستحقاق: ${esc(fmtDate(t.due))}</span>${t.phase ? '<span>المرحلة ' + esc(t.phase) + '</span>' : ''}${t.meetingId ? '<span>من ' + esc(t.meetingId) + '</span>' : ''}
  <button class="btn ghost small" data-act="task-toggle" data-id="${esc(t._id)}">${t.status === 'done' ? 'إعادة فتح' : 'تمّت ✓'}</button></div></div>`;
}

/* ---- Record hub ---- */
V.rec = () => {
  const t = S.recType;
  if (!t) return `<div><h1>سجّلي</h1><p class="lede">اختاري متى تسجّلين. كل نوع له نموذج قصير بخطوات وأمثلة، ويُحفظ مع المقرر والفصل وعدد الطالبات والدرس.</p></div>
  <div class="grid wide">${Object.entries(CONTEXTS).map(([k, x]) => `<button class="action" data-act="go-rec" data-t="${k}"><b>${icon(x.icon)}${esc(x.n)}</b><span>${esc(x.d)}</span><span class="tiny">${D.notes.filter(n => n.context === k).length} سجل</span></button>`).join('')}
  <button class="action" data-act="go-rec" data-t="evidence"><b>${icon('evidence')}دليل تعلّم طالبة</b><span>درجات مرمّزة بمقياس 0–4 لخط الأساس وأثناء الدورة وبعدها.</span><span class="tiny">${D.evidence.length} دليل</span></button></div>
  ${help('كيف أختار؟', `<ul><li><b>أثناء الحصة:</b> وأنتِ تلاحظين درس بحث، أو مباشرة بعده.</li><li><b>خارج الحصة:</b> وأنتِ تخططين أو تصححين أو تجربين شيئًا في فصلك.</li><li><b>في الاجتماع:</b> ما عرضتِه وما قيل ومقترحك.</li><li><b>بعد الاجتماع:</b> تأملك الشخصي وما ستغيّرينه.</li></ul>`)}`;
  if (t === 'evidence') return V.evidenceForm();
  const x = CONTEXTS[t]; let body = '';
  if (t === 'in') body = inBody();
  if (t === 'out') body = `<section class="stepsec">${stepHead(2, 'ماذا عملتِ؟', 'دوّني ما فعلتِه أو لاحظتِه خارج درس البحث.')}
    ${field('نوع العمل', `<select name="kind" id="f-kind">${opts(OUT_KINDS)}</select>`, 'اختيار النوع الصحيح يُكمل أدلة المرحلة تلقائيًا')}
    ${field('التدوين', area('text', '', 'class="tall" required placeholder="ماذا فعلتِ؟ ماذا لاحظتِ في أعمال الطالبات؟ ما الذي فاجأكِ؟"'))}
    ${field('الدليل المرتبط', inp('evidenceRef', '', 'placeholder="مثال: E0012 أو 6 عينات أعمال مجهّلة"'))}</section>`;
  if (t === 'meeting') body = `<section class="stepsec">${stepHead(2, 'في الاجتماع', 'دوّني ما يخصك: ما عرضتِه، ما قيل، ومقترحك.')}
    ${field('الاجتماع', `<select name="meetingId" id="f-meetingId">${opts(D.meetings.slice().sort(byNewest).map(m => [m.code, m.code + ' · ' + fmtDate(m.date)]), (D.meetings.slice().sort(byNewest)[0] || {}).code, 'اجتماع غير مسجّل')}</select>`)}
    <div class="grid wide">${field('الأدلة التي عرضتُها', area('discussed', '', 'placeholder="مثال: 4 من 6 بطاقات خروج في فصلي فسّرت دون نقل"'))}${field('ما الذي نوقش؟', area('text', '', 'required'))}${field('مقترحي للفريق', area('proposal'))}</div></section>`;
  if (t === 'after') body = `<section class="stepsec">${stepHead(2, 'تأمل بعد الاجتماع', 'ستة أسئلة قصيرة. جملة أو جملتان لكل سؤال تكفي.')}
    ${field('بعد أي اجتماع؟', `<select name="meetingId" id="f-meetingId">${opts(D.meetings.slice().sort(byNewest).map(m => [m.code, m.code + ' · ' + fmtDate(m.date)]), (D.meetings.slice().sort(byNewest)[0] || {}).code, '—')}</select>`)}
    <div class="grid wide">${field('ماذا لاحظتُ؟', area('noticed', '', 'required'))}${field('ماذا تعلّمتُ؟', area('learned'))}${field('ما الممارسة التي تغيّرت لديّ؟', area('change'))}${field('ما الدليل على ذلك؟', area('evidenceRef'))}${field('ماذا سأغيّر في حصتي القادمة؟', area('next'))}${field('ما السؤال الذي ما زال يحتاج بحثًا؟', area('openQuestion'))}</div></section>`;
  const list = bySubj(D.notes.filter(n => n.context === t));
  return `<div class="row"><button class="btn ghost small" data-act="go-rec" data-t="">→ كل أنواع التسجيل</button></div>
  <div><h1>${esc(x.n)}</h1><p class="lede">${esc(x.d)}</p><div style="margin-top:6px">${whoBadge({in:'أثناء الحصة',out:'خارج الحصة',meeting:'في الاجتماع',after:'بعد الاجتماع (تأمل)'}[t])}</div></div>
  <form class="panel" data-form="note" data-ctx="${t}">${ctxBlock(1)}${body}${practiceOpt(3)}${attachField()}${noteButtons(t)}</form>
  <section class="panel"><div class="row between"><h2>سجل «${esc(x.n)}»</h2>${subjBar()}</div><div class="ledger" data-slot="notes">${SLOTS.notes()}</div></section>`;
};
const NOTE_LAB = {target:'الطالبة/المجموعة',moment:'نوع اللحظة',level:'مستواها في خط الأساس',task:'المهمة',observed:'ما حدث',stumble:'التعثّر',promptUsed:'الدعم/التلميح',supportType:'نوع الدعم',response:'الاستجابة',learningEvidence:'دليل التعلّم',kind:'النوع',text:'التدوين',meetingId:'الاجتماع',discussed:'الأدلة المعروضة',proposal:'المقترح',noticed:'لاحظتُ',learned:'تعلّمتُ',change:'ما تغيّر',evidenceRef:'الدليل',next:'سأغيّر',openQuestion:'سؤال مفتوح'};
SLOTS.notes = () => {
  const list = bySubj(D.notes.filter(n => n.context === S.recType)).sort(byNewest);
  if (!list.length) return `<div class="empty">لا سجلات ${S.subj ? 'في ' + esc(S.subj) + ' ' : ''}بعد. أول سجل تحفظينه سيظهر هنا.</div>`;
  return list.map(n => `<div class="rec"><div class="row"><span class="chip plain">${esc(n.code)}</span></div>${ctxMeta(n)}<dl class="kv">${Object.keys(NOTE_LAB).filter(k => n[k]).map(k => `<dt>${NOTE_LAB[k]}</dt><dd>${esc(n[k])}</dd>`).join('')}</dl>${practiceChips(n.practices)}${filesHtml(n.files)}</div>`).join('');
};

/* ---- Evidence ---- */
V.evidenceForm = () => {
  if (S.evMode === 'class') return evidenceBulk();
  const sc = n => `<select name="${n}" id="f-${n}" aria-label="${n}">${opts([['', '—'], ...RUBRIC.map((r, i) => [String(i), r])])}</select>`;
  return `<div class="row"><button class="btn ghost small" data-act="go-rec" data-t="">→ كل أنواع التسجيل</button></div>
  <div><h1>دليل تعلّم طالبة</h1><p class="lede">سجل واحد لكل طالبة في كل نقطة قياس. هذه الدرجات هي ما نقيس به أثر المشروع على الطالبات.</p><div style="margin-top:6px">${whoBadge('دليل تعلّم طالبة')}</div></div>
  ${evTabs()}<form class="panel" data-form="evidence">${ctxBlock(1)}
    <section class="stepsec">${stepHead(2, 'الطالبة ونقطة القياس', 'استخدمي رمز الطالبة الثابت نفسه في كل القياسات حتى نتتبع نموها.')}
    <div class="grid">${field('رمز الطالبة', inp('studentCode', '', 'placeholder="S014" required autocomplete="off"'), 'S ثم ثلاثة أرقام')}${field('نقطة القياس', `<select name="timePoint" id="f-timePoint">${opts(TIMEPOINTS)}</select>`)}${field('نوع الدليل', `<select name="evidenceType" id="f-evidenceType">${opts(['بطاقة خروج','منتج طالبة','إجابة شفهية','مهمة نقل','مهمة خط أساس/بعدية'])}</select>`)}${field('الدعم الذي احتاجته', `<select name="supportLevel" id="f-supportLevel">${opts(['بلا دعم','دعم 1: تلميح','دعم 2: بطاقة موجّهة','دعم 3: مثال محلول'])}</select>`)}</div></section>
    <section class="stepsec">${stepHead(3, 'الدرجات', 'المقياس نفسه في جميع المقررات المشاركة حتى تمكن المقارنة.')}
    <div class="grid">${INDICATORS.map(([k, l, d]) => field(l, sc(k), d)).join('')}</div>
    ${help('مقياس 0–4: كيف أصحّح؟', `<ul><li><b>0</b> لا يظهر المؤشر.</li><li><b>1 بداية:</b> محاولة غير صحيحة أو تكرار للمعلومة.</li><li><b>2 جزئي:</b> صحيح جزئيًا أو بعد دعم كبير.</li><li><b>3 واضح:</b> صحيح مع نقص بسيط أو بدعم خفيف.</li><li><b>4 متمكّن:</b> صحيح كامل ومستقل ومبرَّر.</li></ul><p>مثال (الفيزياء، التفسير): 2 = «السرعة تزيد» دون ربط بالميل · 4 = «الميل ثابت موجب، إذن السرعة تزيد بمقدار ثابت كل ثانية».</p>`)}
    <div class="grid">${field('استُخدم الذكاء الاصطناعي في المهمة؟', `<select name="aiUse" id="f-aiUse">${opts(['لا','نعم'])}</select>`)}${field('الأداة وإصدارها', `<select name="instrument" id="f-instrument">${opts(D.instruments.map(i => [i.code + '-' + i.version, i.code + ' ' + i.name + ' ' + i.version]), 'INS02-v0.1')}</select>`)}${field('ملاحظة (بلا أسماء)', inp('note'))}</div></section>
    ${attachField()}<div class="row"><button class="btn" type="submit">حفظ الدليل</button><button class="btn ghost" type="submit" data-keep="1">حفظ وإدخال طالبة أخرى</button></div></form>
  <section class="panel"><div class="row between"><h2>آخر الأدلة</h2>${subjBar()}</div><div class="scroll" data-slot="evtable">${SLOTS.evtable()}</div></section>`;
};
SLOTS.evtable = () => {
  const list = bySubj(D.evidence).slice().sort(byNewest).slice(0, 60);
  if (!list.length) return '<div class="empty">لا أدلة بعد.</div>';
  return `<table><thead><tr><th>الرمز</th><th>المقرر</th><th>الطالبة</th><th>الفصل</th><th>النقطة</th><th>تفسير</th><th>نقل</th><th>استقلالية</th><th>تحقق</th><th>الدعم</th><th>الدورة</th><th>مرفق</th></tr></thead><tbody>${list.map(e => `<tr><td>${esc(e.code)}</td><td>${subjChip(e.subject)}</td><td>${esc(e.studentCode)}</td><td>${esc(e.className)}</td><td>${esc(e.timePoint)}</td><td>${esc(e.explanation ?? '')}</td><td>${esc(e.transfer ?? '')}</td><td>${esc(e.independence ?? '')}</td><td>${esc(e.verification ?? '')}</td><td>${esc(e.supportLevel)}</td><td>${esc(e.cycleId)}</td><td>${(e.files || []).map(f => `<a href="${esc(f.url || ('/_blob/' + f.id))}" target="_blank" rel="noopener">فتح</a>`).join(' ')}</td></tr>`).join('')}</tbody></table>`;
};
function impactTable(evs) {
  const rows = SUBJ.map(s => { const se = evs.filter(e => e.subject === s.n); return {s: s.n, cells: TIMEPOINTS.map(([tp]) => { const x = se.filter(e => e.timePoint === tp); return {n: x.length, v: INDICATORS.map(([k]) => avg(x.map(e => e[k]).filter(v => v != null)))}; })}; });
  return `<table><thead><tr><th>المقرر</th><th>المؤشر</th>${TIMEPOINTS.map(t => `<th>${esc(t[1])}</th>`).join('')}<th>التغيّر (بعدي − قبلي)</th></tr></thead><tbody>${rows.map(r => INDICATORS.map(([k, l], ii) => { const b = r.cells[0].v[ii], p = r.cells[2].v[ii]; return `<tr>${ii === 0 ? `<td rowspan="4">${subjChip(r.s)}<div class="tiny muted">ن: ${r.cells.map(c => c.n).join(' / ')}</div></td>` : ''}<td>${esc(l)}</td>${r.cells.map(c => `<td>${f1(c.v[ii])}</td>`).join('')}<td><b>${b != null && p != null ? (p - b >= 0 ? '+' : '') + (p - b).toFixed(1) : '—'}</b></td></tr>`; }).join('')).join('')}</tbody></table>`;
}
V.evidence = () => `<div><h1>أدلة تعلّم الطالبات</h1><p class="lede">متوسطات المؤشرات الأربعة لكل مقرر في كل نقطة قياس. هذا الجدول هو «أثر الطالبات» في التقارير والرسالة.</p></div>
  <div class="row"><button class="btn" data-act="go-rec" data-t="evidence">＋ إدخال دليل تعلّم</button><button class="btn ghost" data-act="go-report" data-t="impact">تقرير أثر الطالبات</button></div>
  <section class="panel"><h2>المتوسطات (0–4)</h2><div class="scroll">${impactTable(D.evidence)}</div><p class="tiny muted">ن = عدد الأدلة في كل نقطة (قبلي / أثناء / بعدي / احتفاظ). لا تُفسَّر الفروق قبل اكتمال القياس البعدي.</p></section>
  <section class="panel"><div class="row between"><h2>كل الأدلة</h2>${subjBar()}</div><div class="scroll" data-slot="evtable">${SLOTS.evtable()}</div></section>`;

/* ---- Cycle ---- */
V.cycle = () => {
  const c = curCycle();
  if (!c) return `<div><h1>دورة بحث الدرس</h1></div><div class="empty">لا توجد دورة بعد. أنشئي الدورة الأولى من «الإعداد».</div><div><button class="btn" data-act="nav" data-view="setup">الإعداد</button></div>`;
  const cur = Math.min(12, Math.max(1, Number(c.phase || 1))); const sel = S.phaseSel || cur;
  return `<div><h1>دورة بحث الدرس ${esc(c.code)}</h1><p class="lede">${esc(c.title || '')} · مادة درس البحث: ${esc(c.subject || '—')}. اثنتا عشرة مرحلة في نحو ستة أسابيع؛ كل مرحلة لها هدف، ومهام، وأدلة تُكملها.</p></div>
  <div class="steps" role="tablist" aria-label="المراحل">${PHASES.map((p, i) => `<button class="step ${i + 1 < cur ? 'done' : (i + 1 === cur ? 'now' : '')} ${i + 1 === sel ? 'sel' : ''}" role="tab" aria-selected="${i + 1 === sel}" data-act="phase-sel" data-p="${i + 1}"><i>${i + 1}</i>${esc(p.n)}</button>`).join('')}</div>
  <section class="panel">${phaseCard(c, sel - 1)}</section>
  ${S.canEdit ? `<section class="panel"><h2>إدارة المرحلة (القائدة)</h2><p class="lede small">انقلي الدورة إلى المرحلة التالية عند اكتمال أدلتها. إن نقلتِها مع نقص، يبقى النقص ظاهرًا في المرحلة وفي تقرير الدورة.</p><div class="row"><button class="btn ghost" data-act="phase" data-id="${esc(c._id)}" data-d="-1"${cur <= 1 ? ' disabled' : ''}>المرحلة السابقة</button><button class="btn" data-act="phase" data-id="${esc(c._id)}" data-d="1"${cur >= 12 ? ' disabled' : ''}>الانتقال إلى المرحلة ${Math.min(12, cur + 1)}</button><button class="btn ghost" data-act="go-report" data-t="cycle">تقرير الدورة</button></div></section>` : ''}`;
};

/* ---- AI studio ---- */
V.aiStudio = () => `  ${help('كيف أستخدم الاستوديو؟ (4 خطوات)', `<ul><li>حدّدي المقرر والفصل والدرس ونوع الطلب، واكتبي ما تُظهره أدلة طالباتك.</li><li>اضغطي «صياغة الطلب» ثم «أرسلي إلى Claude»، أو الصقي مخرج أداة أخرى كما هو.</li><li>اضغطي «ابدئي التحرير من المقترح» وعدّلي النص بحكمك المهني. تظهر الفروق ملوّنة.</li><li>اختاري القرار واكتبي سببه، ثم احفظي. يُحفظ النص المعتمد نسخةً جديدة من الدرس.</li></ul>`)}
  <form class="panel" data-form="ai" id="aiForm">${ctxBlock(1)}
    <section class="stepsec">${stepHead(2, 'الطلب', 'كلما كان الطلب مبنيًا على أدلة طالباتك، كان المقترح أنفع.')}
    <div class="grid">${field('نوع الطلب', `<select name="mode" id="f-mode">${opts(AI_MODES)}</select>`)}${field('الأداة', `<select name="tool" id="f-tool">${opts(AI_TOOLS)}</select>`)}${field('الصف', inp('grade', '', 'placeholder="مثال: الثاني الثانوي"'))}${field('النسخة المراد تعديلها', `<select name="baseLessonId" id="f-baseLessonId">${opts(latestLessons().map(l => [l._id, l._id + ' · ' + l.title]), '', 'لا يوجد (درس جديد)')}</select>`)}</div>
    <div class="grid">${field('في أي مرحلة من البروتوكول؟', `<select name="stage" id="f-stage">${opts(AI_STAGES, 'S3')}</select>`, 'انظري تبويب «مساعد بُرهان»')}${field('نوع الاستخدام', `<select name="scope" id="f-scope">${opts(['جماعي في اجتماع','فردي'])}</select>`)}${field('رموز الأدلة المستخدمة', inp('evidenceRefs', '', 'placeholder="مثال: E0007–E0030، O0091"'))}${field('قرار التمايز المرتبط', `<select name="decisionLink" id="f-decisionLink">${opts(D.decisions.slice().sort(byNewest).map(d => [d.code, d.code + ' · ' + String(d.decision || '').slice(0, 40)]), '', 'يُربط لاحقًا')}</select>`, 'يمكن ربطه بعد الاجتماع')}</div>
    <div class="grid wide">${field('الهدف أو مشكلة التعلّم', area('goal', D.settings.learningProblem || ''))}${field('الدليل المجهّل الذي استُخدم: ماذا تُظهر أدلة الطالبات؟', area('studentEvidence', '', 'placeholder="مثال: 11 من 24 بطاقة خروج فسّرت الإجابة دون نقلها لموقف جديد"'), 'بلا أسماء')}</div>
    ${field('تفاصيل إضافية', area('details', '', 'placeholder="مثال: الحصة 45 دقيقة، الفصل فيه تفاوت كبير في المعرفة السابقة"'))}
    <div class="row"><button class="btn ghost" type="button" data-act="ai-compose">صياغة الطلب</button><span class="small muted">يمكنك تعديل الطلب قبل إرساله.</span></div>
    ${field('الطلب (Prompt)', area('prompt', '', 'class="tall"'), 'في الأداة الخارجية: الصقي هنا الطلب الذي استخدمتِه فعلًا')}
    <div class="note">لا تُدخلي أسماء الطالبات أو أي بيانات تعريفية في الطلب.</div></section>
    <section class="stepsec">${stepHead(3, 'ما كتبه الذكاء الاصطناعي', 'يُحفظ كما هو دون تعديل، حتى نعرف لاحقًا ماذا غيّرت المعلمة.')}
    <div class="row"><button class="btn" type="button" data-act="ai-send" id="aiSend">أرسلي إلى Claude</button><button class="btn ghost" type="button" data-act="ai-stop" id="aiStop" hidden>إيقاف</button><span class="small muted" id="aiStatus" role="status"></span></div>
    ${field('مخرج الذكاء الاصطناعي', area('aiOutput', '', 'class="tall" placeholder="يظهر هنا مقترح Claude، أو الصقي مخرج الأداة الأخرى كما هو"'))}</section>
    <section class="stepsec">${stepHead(4, 'ما اعتمدته المعلمة', 'عدّلي المقترح أو اكتبي بديلك. تظهر الفروق تلقائيًا.')}
    <div class="row"><button class="btn ghost" type="button" data-act="ai-copy">ابدئي التحرير من المقترح</button></div>
    ${field('النسخة المعتمدة', area('teacherFinal', '', 'class="tall"'))}
    <div id="aiDiff">${aiDiffHtml('', '')}</div></section>
    <section class="stepsec">${stepHead(5, 'القرار والسبب', 'يُقترح القرار من نسبة التغيير، ويمكنك تغييره.')}
    <div class="seg" role="radiogroup" aria-label="القرار">${Object.entries(DEC).map(([k, l]) => `<label><input type="radio" name="decision" value="${k}"${k === 'modified' ? ' checked' : ''}>${l}</label>`).join('')}</div>
    <div class="grid wide">${field('سبب القرار', area('reason', '', 'required placeholder="مثال: المقترح افترض معرفة سابقة غير متوفرة لدى طالباتي"'))}${field('ماذا غيّرتُ ولماذا؟', area('modification'))}</div></section>
    ${practiceStep(6)}
    <label class="row small" style="font-weight:500"><input type="checkbox" name="asVersion" value="1" checked> احفظي النسخة المعتمدة كنسخة جديدة من الدرس</label>
    <div class="row"><button class="btn" type="submit">حفظ السجل</button></div></form>
  <section class="panel"><div class="row between"><h2>سجل الاستوديو</h2>${subjBar()}</div><div class="ledger" data-slot="ailist">${SLOTS.ailist()}</div></section>`;
SLOTS.ailist = () => {
  const list = bySubj(D.ai).slice().sort(byNewest);
  if (!list.length) return '<div class="empty">لا سجلات بعد. أول طلب تصميم أو تعديل سيظهر هنا بنصّيه.</div>';
  return list.map(a => `<div class="rec"><div class="row between"><div class="row"><span class="chip plain">${esc(a.code)}</span><b>${esc(a.mode)}</b><span class="small muted">${esc(a.tool)}</span></div><span class="chip ${a.decision === 'rejected' ? 'warn' : (a.decision === 'accepted' ? 'solid' : '')}">${esc(DEC[a.decision] || '')}</span></div>${ctxMeta(a)}
  ${a.diffStats ? `<div class="small muted">بقي من نص AI ${a.diffStats.sim}% · أضافت المعلمة ${a.diffStats.added} كلمة · حذفت ${a.diffStats.removed}${a.appliedVersion ? ' · طُبّق في ' + esc(a.appliedVersion) : ''}</div>` : ''}
  ${a.reason ? `<div class="body"><b>السبب:</b> ${esc(a.reason)}</div>` : ''}${practiceChips(a.practices)}
  <details data-aiopen="${esc(a._id)}"><summary class="small" style="font-weight:600;cursor:pointer;color:var(--accent)">عرض النصّين والفروق، وتسجيل الأثر</summary><div data-diffhost></div>
  <form data-form="ai-outcome" data-id="${esc(a._id)}" class="grid wide" style="margin-top:12px">${field('قرار التمايز المرتبط', `<select name="decisionLink">${opts(D.decisions.slice().sort(byNewest).map(d => [d.code, d.code + ' · ' + String(d.decision || '').slice(0, 40)]), a.decisionLink, '—')}</select>`)}${field('الأثر الملحوظ بعد التطبيق', area('observedOutcome', a.observedOutcome))}${field('تأمل', area('reflection', a.reflection))}<div class="row"><button class="btn ghost small" type="submit">حفظ الأثر</button></div></form></details></div>`).join('');
};
function lessonText(l) { if (!l) return ''; if (l.body) return l.body; return LESSON_FIELDS.filter(([k]) => l[k]).map(([k, lab]) => lab + ':\n' + l[k]).join('\n\n'); }
function composePrompt(o) {
  const cl = D.classes.find(c => c.code === o.classId); const ls = lessonOf(o.baseLessonId);
  const lines = ['أنتِ مستشارة تربوية تساعد فريق بحث الدرس في مدرسة ثانوية للبنات. اكتبي بالعربية الفصحى الواضحة.', 'المطلوب: ' + o.mode + '.',
    'المقرر: ' + (o.subject || '—') + ' · الصف: ' + (o.grade || '—') + (cl ? ' · الفصل: ' + cl.name + ' (' + (cl.count || '؟') + ' طالبة)' : (o.newClassName ? ' · الفصل: ' + o.newClassName + ' (' + (o.newClassCount || '؟') + ' طالبة)' : '')),
    'الدرس: ' + (o.lessonTitle || (ls && ls.title) || '—'), 'الهدف أو مشكلة التعلّم: ' + (o.goal || '—'), 'ما تُظهره أدلة تعلّم الطالبات: ' + (o.studentEvidence || '—')];
  if (o.details) lines.push('تفاصيل إضافية: ' + o.details);
  if (ls) lines.push('', 'نص النسخة الحالية من الدرس (' + ls._id + '):', lessonText(ls), '', 'عدّلي الدرس بناءً على الأدلة، واذكري في النهاية قائمة قصيرة بما غيّرتِه ولماذا.');
  if (o.mode === 'تصميم درس جديد' || o.mode === 'تعديل درس قائم') lines.push('', 'نظّمي الخطة تحت هذه العناوين بالترتيب: ' + LESSON_FIELDS.map(f => f[1]).join('، ') + '.');
  lines.push('', 'ركّزي على التعليم المتمايز بمستويات دعم واضحة، وأسئلة تكشف التفكير، وأدلة تعلّم قابلة للملاحظة تُصحَّح بمقياس 0–4. لا تستخدمي أسماء طالبات.', 'اكتبي نصًا عاديًا بعناوين واضحة، دون جداول أو رموز تنسيق.');
  return lines.join('\n');
}

/* ---- Lessons ---- */
V.lessons = () => {
  const groups = {}; bySubj(D.lessons).forEach(l => { (groups[l.lessonId] = groups[l.lessonId] || []).push(l); });
  const ids = Object.keys(groups).sort(); const all = D.lessons.slice().sort((a, b) => a._id.localeCompare(b._id));
  return `<div><h1>الدروس ونسخها</h1><p class="lede">كل تعديل نسخة جديدة (V1، V2…) مع ما تغيّر ولماذا والقرار المرتبط. هكذا نُثبت تطور التصميم والممارسة.</p></div>
  <section class="panel"><div class="row between"><h2>دروس البحث</h2>${subjBar()}</div><div class="ledger">${ids.length ? ids.map(id => { const vs = groups[id].sort((a, b) => a.version - b.version); const last = vs[vs.length - 1]; return `<div class="rec"><div class="row between"><b>${esc(id)} · ${esc(last.title)}</b><div class="row">${vs.map(v => `<span class="chip ${v === last ? 'solid' : 'plain'}">V${v.version}</span>`).join('')}</div></div>${ctxMeta(last)}${vs.filter(v => v.changeNote).map(v => `<div class="small"><b>V${v.version}:</b> ${esc(v.changeNote)}${v.decisionId ? ' (' + esc(v.decisionId) + ')' : ''}${v.aiRecord ? ' · بمساندة ' + esc(v.aiRecord) : ''}</div>`).join('')}<details><summary class="small" style="cursor:pointer;color:var(--accent);font-weight:600">نص آخر نسخة</summary><div class="out">${esc(lessonText(last))}</div></details></div>`; }).join('') : '<div class="empty">لا دروس بعد. اكتبي V1 هنا أو صمّميها من «استوديو الذكاء الاصطناعي».</div>'}</div></section>
  <section class="panel"><h2>قارني نسختين</h2><div class="grid">${field('النسخة الأقدم', `<select id="cmpA">${opts(all.map(l => [l._id, l._id + ' · ' + l.title]), '', '—')}</select>`)}${field('النسخة الأحدث', `<select id="cmpB">${opts(all.map(l => [l._id, l._id + ' · ' + l.title]), '', '—')}</select>`)}</div><div id="cmpOut"><div class="empty">اختاري نسختين لعرض الفروق.</div></div></section>
  <form class="panel" data-form="lesson"><h2>درس جديد أو نسخة جديدة</h2>
    ${ctxBlock(1)}
    <section class="stepsec">${stepHead(2, 'هل هذه نسخة جديدة من درس سابق؟', 'اختاري الدرس إن كانت نسخة معدّلة، واربطيها بالقرار الذي أدى إلى التعديل.')}
    <div class="grid">${field('نسخة جديدة من', `<select name="baseLesson" id="f-baseLesson">${opts(latestLessons().map(l => [l.lessonId, l.lessonId + ' · ' + l.title]), '', 'لا — درس جديد')}</select>`)}${field('الصف', inp('grade'))}${field('القرار المرتبط', `<select name="decisionId" id="f-decisionId">${opts(D.decisions.map(d => [d.code, d.code + ' · ' + String(d.decision || '').slice(0, 40)]), '', '—')}</select>`)}</div>
    ${field('ما الذي تغيّر في هذه النسخة ولماذا؟', area('changeNote'))}</section>
    <section class="stepsec">${stepHead(3, 'عناصر خطة درس البحث', 'تحت كل عنصر سؤال يوجّه الكتابة. الأهم: نقاط التعثّر ومستويات الدعم وبطاقة الخروج.')}
    <div class="grid wide">${LESSON_FIELDS.map(([k, l, h]) => field(l, area(k), h)).join('')}</div></section>
    <div class="row"><button class="btn" type="submit">حفظ النسخة</button></div></form>`;
};
async function saveLessonVersion(o, extra) {
  let lessonId = o.baseLesson; let version = 1;
  if (lessonId) version = Math.max(...D.lessons.filter(l => l.lessonId === lessonId).map(l => l.version || 1)) + 1;
  else { const nums = D.lessons.map(l => parseInt(String(l.lessonId).slice(1), 10)).filter(n => !isNaN(n)); lessonId = 'L' + pad((nums.length ? Math.max(...nums) : 0) + 1, 2); }
  const id = lessonId + '-V' + version; const prev = D.lessons.filter(l => l.lessonId === lessonId).sort((a, b) => b.version - a.version)[0];
  const doc = base(Object.assign({code: id, lessonId, version, title: o.lessonTitle || (prev && prev.title) || 'درس بلا عنوان', subject: o.subject || (prev && prev.subject) || '', grade: o.grade || (prev && prev.grade) || '', classId: o.classId || '', className: o.className || '', studentCount: o.studentCount || null, cycleId: o.cycleId || '', date: o.date || today(), changeNote: o.changeNote || '', decisionId: o.decisionId || ''}, extra || {}));
  LESSON_FIELDS.forEach(([k]) => { if (o[k]) doc[k] = o[k]; });
  try { await S.db.collection('lessons').doc(id).set(doc); return id; } catch (e) { handleDbErr(e); return null; }
}

/* ---- Meetings ---- */
const PROTOCOL = ['5 د · افتتاح: هدف الاجتماع والمرحلة الحالية','15 د · عرض الأدلة: كل معلمة 3 دقائق بأدلة من فصلها','15 د · تحليل وقرار: ماذا تعني الأدلة؟ ما البدائل؟ ماذا نقرر؟','5 د · المهام: من يفعل ماذا وحتى متى','5 د · تأمل سريع: جملة من كل عضوة'];
V.meetings = () => {
  const t = S.meetTab; const c = curCycle(); const ph = c ? PHASES[Math.min(11, Math.max(0, Number(c.phase || 1) - 1))] : null;
  const tabs = [['live','اجتماع الآن'],['meetings','الاجتماعات'],['decisions','القرارات'],['tasks','المهام']];
  let body = '';
  if (t === 'live') body = liveHtml();
  if (t === 'meetings') body = `<form class="panel" data-form="meeting"><h2>تسجيل اجتماع</h2>
    ${help('بروتوكول اجتماع بحث الدرس (45 دقيقة)', `<ul>${PROTOCOL.map(p => `<li>${esc(p)}</li>`).join('')}</ul>`)}
    <div class="grid">${field('التاريخ', inp('date', today(), 'type="date"'))}${field('الدورة', `<select name="cycleId" id="f-cycleId">${opts(D.cycles.map(x => x.code), c && c.code, '—')}</select>`)}${field('رابط المحضر', inp('minutesLink', '', 'placeholder="رابط Teams أو SharePoint (اختياري)"'))}</div>
    ${field('الحضور', checks('attendees', D.team.map(m => [m.code, m.code + ' · ' + (m.discipline || '')])))}
    <div class="grid wide">${field('الهدف', area('goal', ph ? 'المرحلة ' + c.phase + ' (' + ph.n + '): ' + ph.goal : ''))}${field('جدول الأعمال', area('agenda', PROTOCOL.join('\n'), 'class="tall"'))}${field('الأدلة التي نوقشت', area('evidence', '', 'placeholder="رموز أدلة أو ملخص ما عُرض"'))}${field('ملخص القرارات', area('decisionsSummary', '', 'placeholder="تُسجَّل القرارات التفصيلية في تبويب «القرارات»"'))}</div>
    <div class="row"><button class="btn" type="submit">حفظ الاجتماع</button></div></form>
    <section class="panel"><h2>الاجتماعات</h2><div class="ledger">${D.meetings.slice().sort(byNewest).map(m => `<div class="rec"><div class="meta"><span class="chip plain">${esc(m.code)}</span><span>${esc(fmtDate(m.date))}</span><span>${esc(m.cycleId || '')}</span><span>الحضور: ${esc((m.attendees || []).join('، ') || '—')}</span></div><dl class="kv">${[['goal','الهدف'],['evidence','الأدلة'],['decisionsSummary','القرارات']].filter(([k]) => m[k]).map(([k, l]) => `<dt>${l}</dt><dd>${esc(m[k])}</dd>`).join('')}</dl><div class="row between"><span class="small muted">${D.notes.filter(n => n.meetingId === m.code).length} ملاحظة · ${D.decisions.filter(d => d.meetingId === m.code).length} قرار · ${D.tasks.filter(x => x.meetingId === m.code).length} مهمة</span><button class="btn ghost small" data-act="minutes" data-m="${esc(m.code)}">محضر الاجتماع</button></div></div>`).join('') || '<div class="empty">لا اجتماعات بعد.</div>'}</div></section>`;
  if (t === 'decisions') body = `<form class="panel" data-form="decision"><h2>تسجيل قرار</h2><p class="lede small">القرار الجيد يجيب: ما الموقف؟ ما الدليل؟ ما البدائل؟ لماذا اخترنا هذا؟ ماذا سنفعل؟</p>
    <div class="grid">${field('الاجتماع', `<select name="meetingId" id="f-meetingId">${opts(D.meetings.slice().sort(byNewest).map(m => [m.code, m.code + ' · ' + fmtDate(m.date)]), (D.meetings.slice().sort(byNewest)[0] || {}).code, '—')}</select>`)}${field('الدورة', `<select name="cycleId" id="f-cycleId">${opts(D.cycles.map(x => x.code), c && c.code, '—')}</select>`)}${field('المقرر المعني', `<select name="subject" id="f-subject">${opts(SUBJ.map(s => s.n), '', 'كل المقررات')}</select>`)}${field('التاريخ', inp('date', today(), 'type="date"'))}</div>
    <div class="grid wide">${field('الموقف أو المشكلة', area('situation', '', 'placeholder="مثال: الطالبات يفسّرن ولا ينقلن"'))}${field('الدليل', area('evidence', '', 'required placeholder="مثال: 11 من 24 بطاقة خروج (E0007–E0030)"'), 'إلزامي: لا قرار بلا دليل')}${field('البدائل التي نوقشت', area('alternatives'))}${field('القرار', area('decision', '', 'required'))}${field('السبب', area('reason'))}${field('الإجراء', area('action', '', 'placeholder="ماذا سنفعل؟ في أي نسخة من الدرس؟"'))}</div>
    ${field('سجل الذكاء الاصطناعي المرتبط (إن وُجد)', `<select name="aiLink" id="f-aiLink">${opts(D.ai.slice().sort(byNewest).map(a => [a.code, a.code + ' · ' + a.mode]), '', '—')}</select>`, 'يكمل سلسلة: الدليل ← AI ← الحكم ← القرار')}${field('من شارك في القرار', checks('participants', D.team.map(m => [m.code, m.code])))}
    <div class="row"><button class="btn" type="submit">حفظ القرار</button></div></form>
    <section class="panel"><h2>القرارات</h2><div class="ledger">${D.decisions.slice().sort(byNewest).map(d => `<div class="rec"><div class="row between"><div class="row"><span class="chip solid">${esc(d.code)}</span><b>${esc(d.decision)}</b></div><button class="btn ghost small" data-act="dec-status" data-id="${esc(d._id)}">${d.status === 'modified' ? 'عُدّل لاحقًا' : 'مستمر'} · تغيير</button></div><div class="meta">${subjChip(d.subject)}<span>${esc(d.cycleId || '')}</span><span>${esc(d.meetingId || '')}</span><span>${esc(fmtDate(d.date))}</span><span>${esc((d.participants || []).join('، '))}</span></div><dl class="kv">${[['situation','الموقف'],['evidence','الدليل'],['alternatives','البدائل'],['reason','السبب'],['action','الإجراء'],['outcome','النتيجة']].filter(([k]) => d[k]).map(([k, l]) => `<dt>${l}</dt><dd>${esc(d[k])}</dd>`).join('')}</dl>
    <form data-form="dec-outcome" data-id="${esc(d._id)}" class="row">${inp('outcome', d.outcome, 'aria-label="النتيجة" placeholder="ماذا حدث بعد تطبيق القرار؟" style="flex:1 1 260px"')}<button class="btn ghost small" type="submit">حفظ النتيجة</button></form></div>`).join('') || '<div class="empty">لا قرارات بعد.</div>'}</div></section>`;
  if (t === 'tasks') body = `<form class="panel" data-form="task"><h2>مهمة جديدة</h2><div class="grid">${field('المهمة', inp('title', '', 'required placeholder="مثال: إدخال درجات خط الأساس لفصلي"'))}${field('المسؤولة', `<select name="owner" id="f-owner">${opts([...D.team.map(m => [m.code, m.code + ' · ' + (m.discipline || '')]), ['الفريق','الفريق كله']])}</select>`)}${field('الاستحقاق', inp('due', '', 'type="date" required'))}${field('المرحلة', `<select name="phase" id="f-phase">${opts(PHASES.map((p, i) => [i + 1, (i + 1) + ' · ' + p.n]), c && c.phase)}</select>`)}${field('من اجتماع', `<select name="meetingId" id="f-meetingId">${opts(D.meetings.map(m => m.code), '', '—')}</select>`)}</div><div class="row"><button class="btn" type="submit">إضافة المهمة</button></div></form>
    <section class="panel"><h2>المهام</h2><div class="ledger">${D.tasks.slice().sort((a, b) => (a.status === 'done') - (b.status === 'done') || String(a.due).localeCompare(String(b.due))).map(taskRow).join('') || '<div class="empty">لا مهام بعد.</div>'}</div></section>`;
  return `<div><h1>الاجتماعات والقرارات</h1><p class="lede">الاجتماع يُنتج قرارات ومهامًا. ملاحظاتك الشخصية في الاجتماع وبعده تُسجَّل من «سجّلي».</p></div>
  <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab" role="tab" aria-selected="${k === t}" data-act="meet-tab" data-tab="${k}">${l}</button>`).join('')}</div>${body}`;
};

/* ---- Reports ---- */
const REPORTS = [
  ['weekly','التقرير الأسبوعي','للفريق والإدارة · كل أسبوع','ما أُنجز في 7 أيام، المهام المتأخرة، الأدلة الناقصة، الاجتماع القادم.'],
  ['cycle','تقرير دورة بحث الدرس','للفريق والإدارة · عند إغلاق كل دورة','المشكلة، خط الأساس، تطور الدرس، أبرز الملاحظات والقرارات، الأثر، دور AI، التأملات، التوصيات.'],
  ['impact','تقرير أثر الطالبات','للفريق والبحث · بعد القياس البعدي','متوسطات المؤشرات الأربعة لكل مقرر قبل وأثناء وبعد.'],
  ['teachers','تقرير نمو الممارسات','للبحث · قبلي/منتصف/بعدي','قياسات Rubric الممارسات العشر وتكرار ظهورها في السجلات لكل معلمة.'],
  ['ai','تقرير الذكاء الاصطناعي والقرار','للبحث وللعرض','أنواع الاستخدام، نسب القبول والتعديل والرفض، ما بقي من نصوص AI، أمثلة مجهّلة.'],
  ['portfolio','ملف الأدلة للعرض','لملتقى مُلهم أو أي جهة · مجهّل','قصة المشروع بالأرقام والأدلة دون أي بيانات فردية.'],
  ['aichain','الدليل ← AI ← الحكم ← القرار ← النتيجة','للدكتوراه (RQ4) · كل دورة','كل استخدام للذكاء الاصطناعي بسلسلته الكاملة: الدليل، المقترح، الحكم البشري، قرار التمايز، النتيجة.'],
  ['minutes','محضر اجتماع','للفريق والإدارة · بعد كل اجتماع','الحضور، الهدف، الأدلة، ما دوّنته العضوات، القرارات، المهام، التأملات.']];
function rpTable(head, rows) { return `<div class="scroll"><table><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length ? rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${head.length}">لا بيانات بعد.</td></tr>`}</tbody></table></div>`; }
function phaseGaps(c) { if (!c) return []; const idx = Math.min(11, Math.max(0, Number(c.phase || 1) - 1)); return PHASES[idx].ev.map(([t, fn]) => { const [n, target] = fn(c); return {t, n, target, ok: target === 0 || n >= target}; }); }
function buildReport(type, cy) {
  if (type === 'minutes') return minutesHtml(S.repMeeting);
  if (type === 'aichain') { const c0 = D.cycles.find(x => x.code === cy) || curCycle(); const rows = chainRows((c0 ? D.ai.filter(a => a.cycleId === c0.code) : D.ai).slice().sort((a, b) => String(a.date).localeCompare(String(b.date)))); const st0 = D.settings; return `<h2>الدليل ← مقترح الذكاء الاصطناعي ← الحكم البشري ← قرار التمايز ← النتيجة</h2><div class="rmeta"><span>${esc(st0.projectName || 'بُرهان')}</span>${c0 ? `<span>الدورة ${esc(c0.code)}</span>` : ''}<span>تاريخ الإصدار: ${esc(fmtDate(today()))}</span><span>وضع البيانات: ${esc(phase())}</span></div><h3>الملخص</h3>${rpTable(['المؤشر','القيمة'], [['سجلات الذكاء الاصطناعي', rows.length], ['سلاسل مكتملة (5 حلقات)', rows.filter(r => r.complete).length], ['قبول / تعديل / رفض', rows.filter(r => r.a.decision === 'accepted').length + ' / ' + rows.filter(r => r.a.decision === 'modified').length + ' / ' + rows.filter(r => r.a.decision === 'rejected').length], ['قبل الدرس (اجتماع 1–4) / بعده (اجتماع 5–6)', rows.filter(r => ['S1','S2','S3','S4'].includes(r.a.stage)).length + ' / ' + rows.filter(r => ['S5','S6'].includes(r.a.stage)).length], ['جماعي / فردي', rows.filter(r => String(r.a.scope).startsWith('جماعي')).length + ' / ' + rows.filter(r => r.a.scope === 'فردي').length]])}<h3>السلاسل</h3>${chainTable(rows)}<h3>قراءة التقرير</h3><ul><li>السلسلة المكتملة تُظهر كيف أسهم الذكاء الاصطناعي في قرار تمايز محدد، وأين عدّله الحكم البشري.</li><li>الحلقات الناقصة تُكمل من الاستوديو (عرض النصين وتسجيل الأثر) أو من القرارات.</li></ul>`; }
  const c = D.cycles.find(x => x.code === cy) || curCycle(); const st = D.settings;
  const head = (title, sub) => `<h2>${esc(title)}</h2><div class="rmeta"><span>${esc(st.projectName || 'بُرهان')}${st.school ? ' · ' + esc(st.school) : ''}</span>${c ? `<span>الدورة ${esc(c.code)} · ${esc(c.title || '')}</span>` : ''}<span>${esc(sub || '')}</span><span>تاريخ الإصدار: ${esc(fmtDate(today()))}</span><span>وضع البيانات: ${esc(phase())}</span><span>أعدّته: ${esc(myCode() || '—')}</span></div>`;
  const cy_ = arr => c ? arr.filter(r => r.cycleId === c.code) : arr;
  if (type === 'weekly') {
    const from = daysAgo(7); const wk = arr => arr.filter(r => dateOf(r) >= from);
    const late = D.tasks.filter(t => t.status !== 'done' && t.due && t.due < today()); const doneW = D.tasks.filter(t => t.status === 'done' && (t.doneAt || '') >= from);
    const nextM = D.meetings.filter(m => m.date >= today()).sort((a, b) => a.date.localeCompare(b.date))[0];
    return head('التقرير الأسبوعي', 'من ' + fmtDate(from) + ' إلى ' + fmtDate(today())) +
      `<h3>المرحلة الحالية</h3><p>${c ? 'المرحلة ' + esc(c.phase) + ': ' + esc(PHASES[(c.phase || 1) - 1].n) + ' — ' + esc(PHASES[(c.phase || 1) - 1].goal) : 'لا دورة نشطة.'}</p>
      <h3>ما سُجّل هذا الأسبوع حسب المقرر</h3>${rpTable(['المقرر','أثناء الحصة','خارج الحصة','في/بعد الاجتماع','أدلة تعلّم','سجلات AI','نسخ دروس'], SUBJ.map(s => { const f = arr => wk(arr).filter(r => r.subject === s.n); return [subjChip(s.n), f(D.notes).filter(n => n.context === 'in').length, f(D.notes).filter(n => n.context === 'out').length, f(D.notes).filter(n => n.context === 'meeting' || n.context === 'after').length, f(D.evidence).length, f(D.ai).length, f(D.lessons).length]; }))}
      <h3>المهام</h3><p>أُنجزت هذا الأسبوع: <b>${doneW.length}</b> · متأخرة: <b>${late.length}</b></p>${late.length ? rpTable(['المهمة','المسؤولة','الاستحقاق'], late.map(t => [esc(t.title), esc(t.owner), esc(fmtDate(t.due))])) : ''}
      <h3>أدلة المرحلة الناقصة</h3>${rpTable(['الدليل','الموجود','المطلوب','الحالة'], phaseGaps(c).map(g => [esc(g.t), g.n, g.target || '—', g.ok ? 'مكتمل' : '<b>ناقص</b>']))}
      <h3>القرارات هذا الأسبوع</h3>${rpTable(['الرمز','القرار','الدليل'], wk(D.decisions).map(d => [esc(d.code), esc(d.decision), esc(d.evidence)]))}
      <h3>الاجتماع القادم</h3><p>${nextM ? esc(nextM.code) + ' · ' + esc(fmtDate(nextM.date)) + (nextM.goal ? ' — ' + esc(nextM.goal) : '') : 'لم يُحدَّد بعد.'}</p>`;
  }
  if (type === 'cycle') {
    const L = cy_(D.lessons).sort((a, b) => a._id.localeCompare(b._id)); const N = cy_(D.notes); const Dc = cy_(D.decisions); const A = cy_(D.ai); const E = cy_(D.evidence);
    const stumbles = N.filter(n => n.context === 'in' && n.stumble).slice(0, 6);
    return head('تقرير دورة بحث الدرس', c ? 'المرحلة الحالية ' + c.phase + ' من 12' : '') +
      `<h3>١. مشكلة التعلّم وسؤال الاستقصاء</h3><dl class="kv"><dt>المشكلة</dt><dd>${esc(st.learningProblem || '—')}</dd><dt>سؤال الاستقصاء</dt><dd>${esc(st.inquiryQuestion || '—')}</dd><dt>الهدف بعيد المدى</dt><dd>${esc(st.goal || '—')}</dd><dt>المقررات المشاركة</dt><dd>${esc([...new Set([...N, ...E].map(r => r.subject).filter(Boolean))].join('، ') || '—')}</dd></dl>
      <h3>٢. الفريق والفصول</h3>${rpTable(['الرمز','التخصص','الدور'], D.team.map(m => [esc(m.code), esc(m.discipline), esc(m.role)]))}${rpTable(['الفصل','المقرر','عدد الطالبات'], D.classes.map(x => [esc(x.name), subjChip(x.subject), esc(x.count)]))}
      <h3>٣. الإنجاز حسب المراحل</h3>${rpTable(['المرحلة','الأدلة'], PHASES.map((p, i) => [esc((i + 1) + '. ' + p.n), p.ev.map(([t, fn]) => { const [n, tg] = c ? fn(c) : [0, 0]; return esc(t) + ': ' + n + (tg ? '/' + tg : '') + (tg === 0 || n >= tg ? ' ✓' : ''); }).join('<br>')]))}
      <h3>٤. تطور درس البحث</h3>${rpTable(['النسخة','المقرر','ما تغيّر ولماذا','القرار','AI'], L.map(l => [esc(l._id), subjChip(l.subject), esc(l.changeNote || (l.version === 1 ? 'النسخة الأولى' : '')), esc(l.decisionId || ''), esc(l.aiRecord || '')]))}
      <h3>٥. أبرز لحظات التعثّر الملحوظة</h3>${rpTable(['المقرر','الطالبة/المجموعة','التعثّر','الدعم','الاستجابة'], stumbles.map(n => [subjChip(n.subject), esc(n.target), esc(n.stumble), esc(n.promptUsed || n.supportType), esc(n.response)]))}
      <h3>٦. القرارات المبنية على الأدلة</h3>${rpTable(['الرمز','الدليل','القرار','السبب','النتيجة'], Dc.map(d => [esc(d.code), esc(d.evidence), esc(d.decision), esc(d.reason), esc(d.outcome || '—')]))}
      <h3>٧. أثر الطالبات (متوسطات 0–4)</h3><div class="scroll">${impactTable(E)}</div>
      <h3>٨. دور الذكاء الاصطناعي: الدليل ← المقترح ← الحكم ← القرار ← النتيجة</h3>${chainTable(chainRows(A))}<p>${A.length} استخدام · قبول ${A.filter(a => a.decision === 'accepted').length} · تعديل ${A.filter(a => a.decision === 'modified').length} · رفض ${A.filter(a => a.decision === 'rejected').length}${A.filter(a => a.diffStats).length ? ' · متوسط ما بقي من نصوص AI ' + Math.round(avg(A.filter(a => a.diffStats).map(a => a.diffStats.sim))) + '%' : ''}</p>
      <h3>٩. تأملات المعلمات</h3>${rpTable(['المعلمة','ما تغيّر في ممارستي','ما سأغيّره','سؤال مفتوح'], N.filter(n => n.context === 'after').map(n => [esc(n.author), esc(n.change), esc(n.next), esc(n.openQuestion)]))}
      <h3>١٠. توصيات الدورة التالية</h3><p class="muted">تكتبها القائدة بعد مناقشة التقرير: ما الذي نستمر فيه؟ ما الذي نغيّره؟ ما مشكلة الدورة التالية؟</p>`;
  }
  if (type === 'impact') { const E = cy_(D.evidence); return head('تقرير أثر الطالبات', 'ن = ' + E.length + ' دليل · ' + new Set(E.map(e => e.studentCode)).size + ' طالبة (برموز)') + `<h3>المتوسطات حسب المقرر ونقطة القياس</h3><div class="scroll">${impactTable(E)}</div><h3>قراءة الجدول</h3><ul><li>المقياس 0–4 موحّد في جميع المقررات المشاركة (INS02).</li><li>يُقرأ التغيّر بحذر في وضع Pilot، ومع أعداد صغيرة.</li><li>المقارنة الأدق: الطالبة نفسها قبل وبعد (متوفرة في ملف Student_Evidence_Long).</li></ul>`; }
  if (type === 'teachers') { const P = D.practice; const tags = code => { const f = {}; [...D.notes, ...D.ai].filter(r => r.author === code).forEach(r => (r.practices || []).forEach(p => { f[p] = (f[p] || 0) + 1; })); return f; };
    return head('تقرير نمو الممارسات المهنية', 'Rubric 1–4 + وسوم السجلات') + D.team.map(m => { const tg = tags(m.code); const rec = tp => (P.filter(p => p.teacher === m.code && p.measurePoint === tp).sort(byNewest)[0] || {}).scores || {}; return `<h3>${esc(m.code)} · ${esc(m.discipline || '')}</h3>${rpTable(['الممارسة','قبلي','منتصف','بعدي','ظهورها في السجلات'], PRACTICES.map(([k, l]) => [esc(l), rec('Baseline')[k] ?? '—', rec('Midpoint')[k] ?? '—', rec('Post')[k] ?? '—', tg[k] || 0]))}`; }).join(''); }
  if (type === 'ai') { const A = cy_(D.ai); const byMode = AI_MODES.map(m => [m, A.filter(a => a.mode === m)]).filter(x => x[1].length);
    return head('تقرير الذكاء الاصطناعي والقرار المهني', A.length + ' سجل') + `<h3>حسب نوع الاستخدام</h3>${rpTable(['النوع','العدد','قبول','تعديل','رفض','متوسط ما بقي من نص AI'], byMode.map(([m, x]) => [esc(m), x.length, x.filter(a => a.decision === 'accepted').length, x.filter(a => a.decision === 'modified').length, x.filter(a => a.decision === 'rejected').length, x.filter(a => a.diffStats).length ? Math.round(avg(x.filter(a => a.diffStats).map(a => a.diffStats.sim))) + '%' : '—']))}
      <h3>حسب المقرر</h3>${rpTable(['المقرر','العدد','قبول','تعديل','رفض'], SUBJ.map(s => { const x = A.filter(a => a.subject === s.n); return [subjChip(s.n), x.length, x.filter(a => a.decision === 'accepted').length, x.filter(a => a.decision === 'modified').length, x.filter(a => a.decision === 'rejected').length]; }))}
      <h3>أمثلة على القرار البشري</h3>${rpTable(['السجل','النوع','القرار','السبب','الأثر الملحوظ'], A.filter(a => a.reason).slice(0, 8).map(a => [esc(a.code), esc(a.mode), esc(DEC[a.decision]), esc(a.reason), esc(a.observedOutcome || '—')]))}`; }
  if (type === 'portfolio') { const E = cy_(D.evidence); const A = cy_(D.ai); const L = cy_(D.lessons);
    return head('ملف الأدلة: بُرهان', 'نسخة مجهّلة للعرض الخارجي') + `<h3>المشكلة</h3><p>${esc(st.learningProblem || '—')}</p>
      <h3>بالأرقام</h3>${rpTable(['المؤشر','القيمة'], [['المعلمات', D.team.length], ['المقررات', subjCount([...D.notes, ...D.evidence, ...D.classes])], ['الطالبات المشاركات (حسب الفصول)', D.classes.reduce((a, x) => a + (Number(x.count) || 0), 0)], ['دورات بحث الدرس', D.cycles.length], ['نسخ الدروس', L.length], ['ملاحظات صفية', cy_(D.notes).filter(n => n.context === 'in').length], ['أدلة تعلّم', E.length], ['قرارات مبنية على أدلة', cy_(D.decisions).filter(d => d.evidence).length], ['استخدامات AI موثّقة بقرار بشري', A.length]])}
      <h3>من الدليل إلى القرار</h3>${rpTable(['الدليل','القرار','الأثر'], cy_(D.decisions).slice(0, 5).map(d => [esc(d.evidence), esc(d.decision), esc(d.outcome || '—')]))}
      <h3>تطور الدرس</h3>${rpTable(['النسخة','ما تغيّر'], L.map(l => [esc(l._id), esc(l.changeNote || 'النسخة الأولى')]))}
      <h3>ماذا تغيّر لدى الطالبات؟</h3><div class="scroll">${impactTable(E)}</div>
      <h3>كيف دعم الذكاء الاصطناعي القرار؟</h3><p>${A.length} استخدام: قبول ${A.filter(a => a.decision === 'accepted').length} · تعديل ${A.filter(a => a.decision === 'modified').length} · رفض ${A.filter(a => a.decision === 'rejected').length}. الذكاء الاصطناعي يقترح، والمعلمة تقرّر.</p>
      <h3>كيف تطبّق مدرسة أخرى بُرهان؟</h3><p>انظري «دليل القيادة والتطبيق»: فريق من 3–5 معلمات من مقررات مختلفة، اجتماع أسبوعي 45 دقيقة، دورة من 12 مرحلة في نحو 6 أسابيع.</p><p class="tiny muted">لا يتضمن هذا الملف أي اسم أو بيانات فردية لطالبة أو معلمة.</p>`; }
  return '';
}
V.reports = () => {
  const t = S.repType; const r = REPORTS.find(x => x[0] === t);
  return `<div><h1>التقارير</h1><p class="lede">تُولَّد من بياناتكم مباشرة، فلا تُكتب مرتين. اختاري التقرير، راجعي المعاينة، ثم نزّليه.</p></div>
  <div class="grid">${REPORTS.map(([k, n, who]) => `<button class="action" data-act="rep" data-t="${k}" aria-pressed="${k === t}" style="${k === t ? 'border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)' : ''}"><b>${icon('reports')}${esc(n)}</b><span>${esc(who)}</span></button>`).join('')}</div>
  <section class="panel"><div class="row between"><div><h2>${esc(r[1])}</h2><p class="small muted">${esc(r[3])}</p></div><div class="row">${t === 'minutes' ? field('الاجتماع', `<select id="repMeeting">${opts(D.meetings.slice().sort(byNewest).map(m => [m.code, m.code + ' · ' + fmtDate(m.date)]), S.repMeeting)}</select>`) : ''}${field('الدورة', `<select id="repCycle">${opts(D.cycles.map(c => c.code), (curCycle() || {}).code, 'كل الدورات')}</select>`)}</div></div>
  <div class="row"><button class="btn" data-act="rep-dl" data-fmt="html"${S.downloads ? '' : ' disabled'}>تنزيل التقرير (HTML)</button><button class="btn ghost" data-act="rep-copy">نسخ النص</button><span class="tiny muted">افتحي الملف في المتصفح ثم «طباعة ← حفظ PDF»، أو افتحيه في Word.</span></div></section>
  <article class="report" id="repOut">${buildReport(t, (curCycle() || {}).code)}</article>`;
};

/* ---- Research ---- */
const DATASETS = [['Student_Evidence_Long','أدلة الطالبات: صف لكل طالبة × نقطة قياس × مؤشر'],['Teacher_Practice_Long','ممارسات المعلمات: صف لكل معلمة × نقطة × ممارسة'],['AI_Decision_Log','استوديو AI: نص AI ونص المعلمة والقرار والسبب'],['Notes_Qualitative','الملاحظات والتأملات للتحليل النوعي'],['Decisions_Log','سجل القرارات'],['Lesson_Versions','نسخ الدروس بنصوصها'],['Process_Timeline','الخط الزمني لكل الأحداث']];
V.research = () => {
  const t = S.resTab; const tabs = [['map','خريطة البحث'],['practice','قياس ممارسات المعلمات'],['export','التصدير للتحليل'],['tools','أدوات القياس']];
  let body = '';
  if (t === 'map') { const freq = {}; [...D.notes, ...D.ai].forEach(r => (r.practices || []).forEach(p => { freq[p] = (freq[p] || 0) + 1; })); const mx = Math.max(1, ...Object.values(freq));
    body = `<section class="panel"><h2>من السؤال إلى البيانات</h2><p class="lede small">كل سؤال بحث مرتبط بمكان في المنصة يُجمع فيه دليله أثناء العمل اليومي.</p><div class="scroll"><table><thead><tr><th>السؤال</th><th>البناء</th><th>المؤشرات</th><th>الأداة</th><th>مصدره في بُرهان</th><th>التوقيت</th><th>التحليل</th></tr></thead><tbody>${D.rqs.slice().sort((a, b) => a.code.localeCompare(b.code)).map(r => `<tr><td><b>${esc(r.code)}</b><div class="small">${esc(r.question)}</div></td><td>${esc(r.construct)}</td><td>${esc(r.indicators)}</td><td>${esc(r.instrument)}</td><td>${esc(r.source)}</td><td>${esc(r.time)}</td><td>${esc(r.analysis)}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="panel"><h2>الممارسات الأكثر حضورًا في السجلات</h2><div class="bars">${PRACTICES.map(([k, l]) => `<div class="bar"><span>${l}</span><div class="meter"><span style="width:${Math.round((freq[k] || 0) / mx * 100)}%"></span></div><b>${freq[k] || 0}</b></div>`).join('')}</div></section>`; }
  if (t === 'practice' && !isResearch()) body = '<div class="note">قياس ممارسات المعلمات تملؤه الباحثة أو القائدة.</div>';
  else if (t === 'practice') body = `<form class="panel" data-form="practice"><h2>قياس ممارسات معلمة (Rubric 1–4)</h2><p class="lede small">يقيسه مقيِّم (القائدة أو الباحثة) ثلاث مرات: قبل الدورة الأولى، في المنتصف، وفي النهاية، بالاستناد إلى خطط الدروس والملاحظات والقرارات.</p>
    <div class="grid">${field('المعلمة', `<select name="teacher" id="f-teacher">${opts(D.team.map(m => [m.code, m.code + ' · ' + (m.discipline || '')]))}</select>`)}${field('نقطة القياس', `<select name="measurePoint" id="f-measurePoint">${opts(T_POINTS)}</select>`)}${field('التاريخ', inp('date', today(), 'type="date"'))}${field('الأداة', `<select name="instrument" id="f-instrument">${opts(D.instruments.map(i => [i.code + '-' + i.version, i.code + ' ' + i.version]), 'INS01-v0.1')}</select>`)}</div>
    ${help('مستويات Rubric', '<ul><li><b>1 ناشئ:</b> الممارسة غائبة أو عرضية.</li><li><b>2 نامٍ:</b> تظهر بتوجيه من الفريق.</li><li><b>3 متمكّن:</b> تظهر بانتظام وبمبادرة ذاتية.</li><li><b>4 متقدّم:</b> تظهر وتنقلها المعلمة لزميلاتها.</li></ul>')}
    <div class="grid">${PRACTICES.map(([k, l]) => field(l, `<select name="p_${k}" id="f-p_${k}">${opts([['', '—'], ['1', '1 ناشئ'], ['2', '2 نامٍ'], ['3', '3 متمكّن'], ['4', '4 متقدّم']])}</select>`)).join('')}</div>
    <div class="row"><button class="btn" type="submit">حفظ القياس</button></div></form>`;
  if (t === 'export') body = `<section class="panel"><h2>تصدير مجهّل للتحليل</h2><p class="lede small">ملفات CSV بصيغة طويلة مناسبة لـ SPSS وR وExcel وPower BI، والنصوص لـ NVivo وMAXQDA. لا يُخلط Pilot مع Formal، ويُسجَّل كل تصدير.</p>
    <div class="grid">${field('وضع البيانات', `<select id="exPhase">${opts(['Pilot','Formal'], phase())}</select>`)}${field('الدورة', `<select id="exCycle">${opts(D.cycles.map(c => c.code), '', 'كل الدورات')}</select>`)}${field('المقرر', `<select id="exSubj">${opts(SUBJ.map(s => s.n), '', 'كل المقررات')}</select>`)}</div>
    ${isResearch() ? '' : '<div class="note">التصدير للباحثة والقائدة.</div>'}<div class="ledger">${DATASETS.map(([k, l]) => `<div class="rec"><div class="row between"><div><b>${k}.csv</b><div class="small muted">${l}</div></div><button class="btn ghost small" data-act="export" data-ds="${k}"${S.downloads && isResearch() ? '' : ' disabled'}>تصدير</button></div></div>`).join('')}<div class="rec"><div class="row between"><div><b>حزمة Microsoft 365 (zip)</b><div class="small muted">كل القوائم كملفات CSV جاهزة للاستيراد في Microsoft Lists وPower Apps وPower BI</div></div><button class="btn small" data-act="m365"${S.downloads && isResearch() ? '' : ' disabled'}>تنزيل الحزمة</button></div></div></div></section>
    <section class="panel"><h2>سجل التصدير</h2><div class="scroll">${D.exports.length ? `<table><thead><tr><th>الرمز</th><th>التاريخ</th><th>الملف</th><th>المرشحات</th><th>الصفوف</th><th>بواسطة</th></tr></thead><tbody>${D.exports.slice().sort(byNewest).map(x => `<tr><td>${esc(x.code)}</td><td>${esc(fmtDate(x.createdAt))}</td><td>${esc(x.dataset)}</td><td>${esc(x.filters)}</td><td>${esc(x.rows)}</td><td>${esc(x.author)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty">لا تصديرات بعد.</div>'}</div></section>`;
  if (t === 'tools') body = `<section class="panel"><h2>أدوات القياس وإصداراتها</h2><p class="lede small">لا تُستبدل نسخة أداة مستخدمة؛ كل تعديل إصدار جديد. الدراسة الرسمية تبدأ بأدوات معتمدة وموافقة أخلاقية موثّقة.</p><div class="scroll"><table><thead><tr><th>الرمز</th><th>الأداة</th><th>الإصدار</th><th>الحالة</th><th>المشاركون</th><th>التوقيت</th><th>ملاحظات</th></tr></thead><tbody>${D.instruments.slice().sort((a, b) => a.code.localeCompare(b.code)).map(i => `<tr><td><b>${esc(i.code)}</b></td><td>${esc(i.name)}</td><td>${esc(i.version)}</td><td><span class="chip ${i.status === 'Approved' ? 'solid' : 'warn'}">${esc(i.status)}</span></td><td>${esc(i.participants)}</td><td>${esc(i.timing)}</td><td>${esc(i.notes)}</td></tr>`).join('')}</tbody></table></div></section>`;
  return `<div><h1>البحث والبيانات</h1><p class="lede">كل ما يُسجَّل يُخزَّن بمعرّفات ثابتة ووضع بيانات، فيتحول لاحقًا إلى بيانات رسالة الدكتوراه دون جمع مزدوج.</p></div>
  <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab" role="tab" aria-selected="${k === t}" data-act="res-tab" data-tab="${k}">${l}</button>`).join('')}</div>${body}`;
};

/* ---- Playbook (leader guide) ---- */
V.playbook = () => {
  const t = S.pbTab; const tabs = [['design','تصميم الدراسة'],['start','ما أحتاجه للبدء'],['roles','الأدوار'],['who','من يملأ ماذا'],['m365','الربط بـ Microsoft 365'],['rhythm','الإيقاع والاجتماع'],['evidence','الأدلة وشكلها'],['reports','التقارير'],['quality','معايير الجودة'],['school','لأي مدرسة']];
  const T = (h, rows) => `<div class="scroll"><table><thead><tr>${h.map(x => `<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  let body = '';
  if (t === 'design') body = `<section class="panel"><h2>التصميم المقترح لتصلح البيانات للرسالة</h2><p class="lede small">اقتراح للنقاش مع المشرف ولجنة الأخلاقيات، والقرار النهائي لكِ.</p>${T(['القرار','المقترح','السبب'], [
    ['عدد الدورات','دورة Pilot واحدة الآن + 3 دورات Formal بعد الموافقات (5–6 أسابيع لكل دورة)','سؤال تطور الممارسات (RQ3) يحتاج 3 نقاط زمنية على الأقل؛ والـPilot يختبر الأدوات ولا يدخل الرسالة'],
    ['دروس البحث','درس بحث واحد مشترك في كل دورة: V1 تنفذه معلمة، وV2 تعيد تطبيقه معلمة من مقرر آخر','هذا جوهر بحث الدرس، ويُظهر أثر القرار المبني على الدليل'],
    ['المقررات','درس البحث يتنقل: الدورة 1 فيزياء، 2 رياضيات، 3 كيمياء أو تقنية رقمية؛ وكل معلمة تطبّق الاستراتيجية في فصلها كل دورة','أدلة الطالبات من جميع المقررات المشاركة، ومقارنة بين التخصصات'],
    ['ما نقيسه','المهارة المشتركة لا محتوى الدرس: التفسير، النقل، الاستقلالية، التحقق بمقياس 0–4 موحّد','يسمح بالمقارنة عبر المقررات وعبر الزمن'],
    ['الطالبات','الفصول نفسها والطالبات أنفسهن طوال الدراسة، برموز ثابتة S001…','تتبّع نمو الطالبة نفسها (بيانات طولية)'],
    ['المرحلة','مرحلة دراسية واحدة، ويفضّل صف تدرّس طالباته المعلمات الأربع (تحقّقي من ذلك في مدرستك)','إثبات انتقال المهارة عبر المقررات لدى الطالبات أنفسهن'],
    ['المقارنة','اختياري: شعبة مقارنة لمن لديها شعبتان من الصف نفسه، تُقاس فقط وتأخذ الاستراتيجية بعد انتهاء الدراسة','يقوّي نسبة التحسّن إلى المشروع لا إلى مرور الوقت'],
    ['نقاط القياس','الطالبات: قبل الدورة 1 · بعد كل دورة · احتفاظ بعد 3–4 أسابيع من الأخيرة. المعلمات: قبلي · منتصف (بعد الدورة 2) · بعدي','يغطي RQ1 وRQ2 وRQ3'],
    ['المنهج','مختلط بطابع البحث القائم على التصميم: كمّي للطالبات (أزواج قبل/بعد، حجم أثر، نموذج متعدد المستويات)، ودراسة حالة متعددة للمعلمات الأربع','عدد المعلمات صغير على الإحصاء، كبير على العمق النوعي']])}</section>
    <section class="panel"><h2>الخط الزمني المقترح</h2>${T(['الفترة','العمل','وضع البيانات'], [['الآن (4–6 أسابيع)','دورة تجريبية C01 كاملة: تجريب الأدوات والمنصة والإيقاع','Pilot'],['بعدها','تعديل الأدوات (إصدارات جديدة)، اعتماد خطة البحث، الموافقة الأخلاقية وموافقات المشاركات','—'],['الفصل التالي','قياس قبلي ← الدورات الرسمية C02 وC03 وC04 ← قياس بعدي ← احتفاظ','Formal'],['بعد الجمع','التصدير المجهّل والتحليل وكتابة النتائج','Formal']])}<p class="small muted">في «الإعداد» يُحدَّد وضع كل دورة (Pilot أو Formal)، ونوع كل شعبة (تدخّل أو مقارنة).</p></section>`;
  if (t === 'start') body = `<section class="panel"><h2>قبل البدء: ما تحتاجه القائدة</h2><ul class="checklist">${[
    ['موافقة الإدارة','على تخصيص اجتماع أسبوعي ثابت (45 دقيقة) في الجدول.'],['الفريق','3–5 معلمات، معلمة على الأقل من كل مقرر: التقنية الرقمية، الرياضيات، الكيمياء، الفيزياء.'],
    ['فصل لكل معلمة','فصل واحد تطبّق فيه وتجمع منه الأدلة طوال المشروع، باسمه وعدد طالباته.'],['ميثاق الفريق','الهدف، الأدوار، موعد الاجتماع، قاعدة «نلاحظ تعلّم الطالبات لا أداء المعلمة».'],
    ['الرموز والخصوصية','رموز T للمعلمات وS للطالبات. ملف الربط بالأسماء عند القائدة فقط، خارج المنصة.'],['أداتا قياس مبدئيتان','مقياس 0–4 لتعلّم الطالبات (INS02) وRubric الممارسات (INS01)، تُجرَّبان في Pilot.'],
    ['الإعداد في المنصة','ربط الحسابات، الفصول، المشكلة المشتركة، والدورة الأولى.'],['للدكتوراه','لا تُفعَّل البيانات الرسمية (Formal) قبل اعتماد الخطة والموافقة الأخلاقية.']].map(([a, b]) => `<li><span class="tick n" aria-hidden="true"></span><span><b>${esc(a)}:</b> ${esc(b)}</span></li>`).join('')}</ul></section>
    <section class="panel"><h2>الخطة الزمنية لدورة واحدة (6 أسابيع)</h2>${T(['الأسبوع','المراحل','أهم مخرج'], [['1','1 التشخيص · 2 خط الأساس','مشكلة مشتركة + درجات قبلية'],['2','3 التخطيط · 4 تصميم درس البحث','خطة V1'],['3','5 التنفيذ · 6 الملاحظة · 7 جمع الأدلة','ملاحظات صفية + أدلة'],['4','8 تحليل الأدلة · 9 إعادة التصميم','قرارات + V2'],['5','10 إعادة التطبيق · 11 قياس الأثر','ملاحظات V2 + درجات بعدية'],['6','12 التأمل','تأملات + تقرير الدورة']])}</section>`;
  if (t === 'roles') body = `<section class="panel"><h2>الأدوار والمسؤوليات</h2>${T(['الدور','من','المسؤوليات','ما تسجّله في المنصة'], [
    ['قائدة المشروع (ميسّرة)','معلمة واحدة','تدير الإيقاع، تقود الاجتماع بالبروتوكول، تنقل الدورة بين المراحل، تراجع جاهزية الأدلة، تصدر التقارير','الاجتماعات، القرارات، المهام، المراحل'],
    ['المعلمة المنفّذة','معلمة درس البحث في الدورة','تكتب V1، تنفّذ الدرس، تجمع بطاقات الخروج','الدروس، استوديو AI، خارج الحصة، الأدلة'],
    ['الملاحِظات','2–3 من الفريق','تتابع كل منهن مجموعة أو طالبتين برموزهن','أثناء الحصة'],
    ['كل معلمة في فصلها','الجميع','خط الأساس والقياس البعدي، تجريب ما قرره الفريق، التأمل','الأدلة، خارج الحصة، بعد الاجتماع'],
    ['موثّقة الاجتماع','بالتناوب','تكتب ملخص القرارات والمهام','الاجتماعات، القرارات'],
    ['الباحثة','القائدة أو باحثة مستقلة','أدوات القياس وإصداراتها، قياس الممارسات، التصدير','البحث والبيانات']])}</section>`;
  if (t === 'rhythm') body = `<section class="panel"><h2>الأسبوع النموذجي</h2>${T(['اليوم','العمل','أين يُسجَّل'], [['الأحد','كل معلمة تراجع مهامها من «ماذا أفعل الآن؟»','—'],['الأحد–الثلاثاء','العمل في الفصول: تطبيق، ملاحظة، جمع أدلة','أثناء الحصة · خارج الحصة · الأدلة'],['الأربعاء','اجتماع الفريق 45 دقيقة بالبروتوكول','الاجتماعات · القرارات · المهام · في الاجتماع'],['الأربعاء/الخميس','تأمل قصير من كل معلمة','بعد الاجتماع'],['الخميس','القائدة تصدر التقرير الأسبوعي','التقارير']])}</section>
    <section class="panel"><h2>بروتوكول اجتماع بحث الدرس (45 دقيقة)</h2><ol style="margin:0;padding-inline-start:22px">${PROTOCOL.map(p => `<li>${esc(p)}</li>`).join('')}</ol><p class="small muted">قواعد الحوار: نبدأ بالدليل لا بالرأي · نتحدث عن تعلّم الطالبات لا عن أداء الزميلة · كل قرار يُكتب مع دليله.</p></section>`;
  if (t === 'evidence') body = `<section class="panel"><h2>الأدلة التي نحتاجها وشكلها</h2>${T(['الدليل','من','متى','شكله (الحقول)','أين','يخدم'], [
    ['ملاحظة أثناء الحصة','الملاحِظات','في درس البحث','الوقت، رمز الطالبة/المجموعة، ما حدث، التعثّر، الدعم، الاستجابة، دليل التعلّم','سجّلي ← أثناء الحصة','المدرسة · RQ1 · RQ3'],
    ['تدوين خارج الحصة','كل معلمة','أسبوعيًا','نوع العمل، النص، الدليل المرتبط','سجّلي ← خارج الحصة','المدرسة · RQ3'],
    ['دليل تعلّم طالبة','كل معلمة','قبل/أثناء/بعد/احتفاظ','رمز الطالبة، المقرر، الفصل، النقطة، 4 درجات 0–4، الدعم','سجّلي ← دليل تعلّم','RQ2 · ملهم'],
    ['خطة درس بنسخها','المنفّذة','V1 ثم V2…','13 عنصرًا + ما تغيّر ولماذا + القرار','الدروس','RQ1 · RQ3 · ملهم'],
    ['سجل AI','من استخدمته','عند كل استخدام جوهري','الطلب، نص AI، نص المعلمة، الفروق، القرار، السبب، الممارسات','استوديو AI','RQ4'],
    ['قرار الفريق','موثّقة الاجتماع','في الاجتماع','الموقف، الدليل، البدائل، القرار، السبب، الإجراء، النتيجة','الاجتماعات ← القرارات','RQ3 · RQ4 · ملهم'],
    ['تأمل','كل معلمة','بعد كل اجتماع','6 أسئلة','سجّلي ← بعد الاجتماع','RQ3 · RQ5'],
    ['قياس الممارسات','الباحثة','قبلي/منتصف/بعدي','10 ممارسات × 1–4','البحث ← قياس الممارسات','RQ1']])}</section>`;
  if (t === 'reports') body = `<section class="panel"><h2>التقارير</h2>${T(['التقرير','الجمهور','التكرار','المحتوى'], REPORTS.map(r => [`<b>${esc(r[1])}</b>`, esc(r[2].split(' · ')[0]), esc(r[2].split(' · ')[1] || ''), esc(r[3])]))}<div><button class="btn" data-act="nav" data-view="reports">افتحي التقارير</button></div></section>`;
  if (t === 'quality') body = `<section class="panel"><h2>معايير جودة العمل والبيانات</h2><ul class="checklist">${['كل سجل له مقرر وفصل ودرس ودورة.','كل ملاحظة تصف ما حدث للطالبة، لا حكمًا على المعلمة.','كل قرار مكتوب مع دليله وبدائله وسببه.','كل تعديل على الدرس نسخة جديدة مرتبطة بقرار.','كل استخدام جوهري لـ AI محفوظ بنصّيه وقرار المعلمة.','رمز الطالبة ثابت في كل القياسات.','لا أسماء في أي حقل.','الدرجات بالمقياس نفسه في جميع المقررات المشاركة.','يمكن رواية قصة أي دورة من البداية للنهاية من تقرير الدورة.'].map(x => `<li><span class="tick y" aria-hidden="true">✓</span><span>${esc(x)}</span></li>`).join('')}</ul></section>`;
  if (t === 'who') body = `<section class="panel"><h2>من يملأ ماذا في المنصة</h2><p class="lede small">ليس كل جزء يملؤه الجميع. كل عضوة تسجّل ما يخصها، والقائدة تراجع وتعتمد. ✓ = تستطيع الكتابة فيه.</p>${T(['القسم','يملؤه','يراجعه أو يشارك','القائدة','المعلمة المشاركة','الباحثة','الملاحِظة'], WHO.map(r => r.map((x, i) => i === 0 ? `<b>${esc(x)}</b>` : esc(x))))}<div class="note">صلاحيات المنصة نفسها تُضبط من قائمة المشاركة: شاركيها مع المعلمات بصلاحية «استخدام» لا «تحرير»، فيستطعن التسجيل ولا يستطعن تغيير الإعداد أو نقل مراحل الدورة. وأدوار الفريق تُحدَّد في «الإعداد».</div></section>`;
  if (t === 'm365') body = `<section class="panel"><h2>هل تحتاجين Power Apps؟</h2><p class="lede">لا يوجد ربط مباشر ومتزامن بين بُرهان وPower Apps، لأن بيانات بُرهان محفوظة داخل Claude. لديكِ مساران، والأهم ألّا يعمل الفريق في نظامين معًا.</p>${T(['','المسار أ: البقاء في بُرهان','المسار ب: الانتقال إلى Microsoft 365'], [['متى يناسب؟','الآن وفي الدورة التجريبية؛ إذا كان لدى الفريق حسابات Claude','إذا اشترطت المدرسة أو الوزارة بقاء البيانات في Teams وSharePoint'],['الذكاء الاصطناعي','Claude داخل الاستوديو مع المقارنة التلقائية','Copilot خارج التطبيق، ويُلصق النص يدويًا في القائمة'],['التقارير والتحليل','جاهزة داخل المنصة','تُبنى في Power BI'],['الجهد','لا شيء إضافي','نحو أسبوعين لبناء القوائم والتطبيق والتدفقات']])}</section>
  <section class="panel"><h2>خطوات الانتقال إلى Microsoft 365 (المسار ب)</h2><ol style="margin:0;padding-inline-start:22px;display:flex;flex-direction:column;gap:8px">
    <li><b>نزّلي حزمة Microsoft 365</b> من «البحث والبيانات ← التصدير»: ملف zip فيه 15 ملف CSV، كل ملف قائمة، بلا أسماء.</li>
    <li><b>في موقع SharePoint الخاص بفريق Teams:</b> جديد ← قائمة ← من CSV، لكل ملف. احتفظي بأسماء القوائم كما هي (Burhan_Notes، Burhan_StudentEvidence…).</li>
    <li><b>راجعي أنواع الأعمدة:</b> التواريخ Date، الدرجات Number، المقرر والسياق Choice، الرموز Single line of text.</li>
    <li><b>Power Apps:</b> make.powerapps.com ← إنشاء ← من SharePoint ← اختاري Burhan_Notes، ثم أضيفي بقية القوائم مصادر بيانات. اجعلي الشاشات على غرار صفحات بُرهان: ماذا أفعل الآن، سجّلي، دليل تعلّم، القرارات.</li>
    <li><b>الربط بين القوائم بالرموز لا بالأسماء:</b> cycleId، classId، lessonId، meetingId، decisionLink، studentCode، author.</li>
    <li><b>Power Automate:</b> تذكير قبل موعد المهمة، تنبيه عند تأخر الأدلة، إشعار عند إنشاء قرار.</li>
    <li><b>Power BI:</b> اتصلي بالقوائم نفسها، وابني لوحة الأثر على Burhan_StudentEvidence.</li></ol>
    <p class="small muted">إن اخترتِ هذا المسار، أستطيع أن أجهّز لكِ مواصفات القوائم وأعمدتها وصيغ Power Apps للشاشات الرئيسة.</p></section>`;
  if (t === 'school') body = `<section class="panel"><h2>كيف تطبّق مدرسة أخرى «بُرهان»؟</h2><ol style="margin:0;padding-inline-start:22px;display:flex;flex-direction:column;gap:8px"><li>تكوين فريق من 3–5 معلمات من مقررات مختلفة، واختيار قائدة.</li><li>نسخة جديدة من المنصة للمدرسة، ثم «الإعداد»: الرموز، الفصول، المشكلة، الدورة الأولى.</li><li>اعتماد الإيقاع الأسبوعي وبروتوكول الاجتماع كما هما.</li><li>تنفيذ دورة كاملة (6 أسابيع) بالمراحل الاثنتي عشرة وأدلتها.</li><li>إصدار تقرير الدورة ومناقشته، ثم بدء الدورة الثانية بمشكلة جديدة أو أعمق.</li></ol><p class="small muted">الحد الأدنى للنجاح: اجتماع لا يُلغى، دليل قبل كل قرار، نسختان على الأقل من درس البحث.</p></section>`;
  return `<div><h1>دليل القيادة والتطبيق</h1><p class="lede">كيف يُدار المشروع: ما تحتاجه القائدة، من يفعل ماذا، الإيقاع الأسبوعي، الأدلة وشكلها، التقارير، ومعايير الجودة.</p></div>
  <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab" role="tab" aria-selected="${k === t}" data-act="pb-tab" data-tab="${k}">${l}</button>`).join('')}</div>${body}`;
};

/* ---- Setup ---- */
V.setup = () => {
  const me = myMember(); const st = D.settings; const ed = S.canEdit; const unlinked = D.team.filter(m => !m.userId);
  return `<div><h1>الإعداد</h1><p class="lede">إعداد يُنجز مرة واحدة: المرحلة والمواد والفريق والفصول والدورة. ${ed ? '' : 'بعض الإعدادات متاحة لصاحبة المنصة فقط.'}</p></div>
  ${typeof projectWizard === 'function' ? projectWizard() : ''}
  <section class="panel">${stepHead(1, 'اربطي حسابك برمزك', 'يُحفظ عملك برمزك (مثل T02) لا باسمك.')}${me ? `<div class="ok">حسابك مرتبط بالرمز ${esc(me.code)} · ${esc(me.discipline || '')} · ${esc(me.role || '')}</div><div><button class="btn ghost small" data-act="unlink">فك الارتباط</button></div>` : (S.uid ? `<div class="row">${unlinked.map(m => `<button class="btn ghost" data-act="link" data-id="${esc(m._id)}">أنا ${esc(m.code)} · ${esc(m.discipline || '')}</button>`).join('') || '<span class="muted">كل الرموز مرتبطة. أضيفي عضوة في الخطوة 3.</span>'}</div>` : '<div class="note">تعذّر التعرف على حسابك في هذا العرض.</div>')}</section>
  <form class="panel" data-form="settings">${stepHead(2, 'المشروع ومشكلة التعلّم', 'تظهر المشكلة في كل الصفحات وتُضمَّن في طلبات الذكاء الاصطناعي.')}<fieldset ${ed ? '' : 'disabled'} style="border:0;padding:0;margin:0;display:flex;flex-direction:column;gap:12px">
    <div class="grid">${field('اسم المشروع', inp('projectName', st.projectName || 'بُرهان'))}${field('المدرسة', inp('school', st.school))}${field('الدورة الحالية', `<select name="currentCycle" id="f-currentCycle">${opts(D.cycles.map(c => c.code), st.currentCycle, '—')}</select>`)}${field('وضع البيانات', `<select name="studyPhase" id="f-studyPhase">${opts([['Pilot','Pilot · تجريبي'],['Formal','Formal · الدراسة الرسمية']], st.studyPhase || 'Pilot')}</select>`, 'Formal بعد الموافقة الأخلاقية فقط')}</div>
    <div class="grid wide">${field('مشكلة التعلّم المشتركة', area('learningProblem', st.learningProblem, 'placeholder="مثال: تقدّم الطالبات إجابات صحيحة إجرائيًا دون القدرة على تفسير خطواتهن أو نقلها لموقف جديد"'))}${field('سؤال الاستقصاء المهني', area('inquiryQuestion', st.inquiryQuestion, 'placeholder="مثال: كيف نصمّم دعمًا متمايزًا ينقل الطالبة من الإجراء إلى التفسير والنقل؟"'))}${field('الهدف بعيد المدى', area('goal', st.goal, 'placeholder="مثال: طالبات يفسّرن تفكيرهن ويتحققن منه باستقلالية عبر المقررات"'))}${field('مرجع الموافقة الأخلاقية', inp('ethicsRef', st.ethicsRef))}</div>
    <div class="row"><button class="btn" type="submit">حفظ</button></div></fieldset></form>
  <section class="panel">${stepHead(3, 'الفريق', 'رموز المعلمات وتخصصاتهن وأدوارهن.')}<div class="scroll"><table><thead><tr><th>الرمز</th><th>التخصص</th><th>الدور</th><th>مرتبط بحساب</th></tr></thead><tbody>${D.team.slice().sort((a, b) => a.code.localeCompare(b.code)).map(m => `<tr><td><b>${esc(m.code)}</b></td><td>${ed ? `<select data-disc="${esc(m._id)}" aria-label="تخصص ${esc(m.code)}">${opts([...SUBJ.map(s => s.n), 'أخرى'], m.discipline)}</select>` : (subjChip(m.discipline) || esc(m.discipline))}</td><td>${ed ? `<select data-role="${esc(m._id)}" aria-label="دور ${esc(m.code)}">${opts(['قائدة المشروع','معلمة مشاركة','باحثة','ملاحِظة درس'], m.role)}</select>` : esc(m.role)}</td><td>${m.userId ? 'نعم' : '—'}</td></tr>`).join('')}</tbody></table></div>
    ${ed ? `<form data-form="member" class="grid">${field('تخصص العضوة الجديدة', `<select name="discipline" id="f-discipline">${opts([...SUBJ.map(s => s.n), 'أخرى'])}</select>`)}${field('الدور', `<select name="role" id="f-role">${opts(['معلمة مشاركة','قائدة المشروع','باحثة','ملاحِظة درس'])}</select>`)}<div class="row" style="align-self:end"><button class="btn ghost" type="submit">إضافة عضوة</button></div></form>` : ''}</section>
  <section class="panel">${stepHead(4, 'الفصول', 'اسم الفصل وعدد طالباته لكل مقرر. يُحفظان تلقائيًا مع كل سجل.')}<div class="ledger">${SUBJ.map(s => { const cl = D.classes.filter(x => x.subject === s.n); return `<div class="rec"><div class="row between">${subjChip(s.n)}<span class="small muted">${cl.length} فصل</span></div><div class="row">${cl.map(x => `<span class="chip ${x.classRole === 'comparison' ? 'warn' : 'plain'}">${esc(x.name)} · ${esc(x.count)} طالبة${x.teacher ? ' · ' + esc(x.teacher) : ''}${x.classRole === 'comparison' ? ' · مقارنة' : ''}</span>`).join('') || '<span class="small muted">لا فصول بعد</span>'}</div></div>`; }).join('')}</div>
    <form data-form="class" class="grid">${field('المقرر', `<select name="subject" id="f-csubject">${opts(SUBJ.map(s => s.n), mySubject())}</select>`)}${field('اسم الفصل', inp('name', '', 'placeholder="2/3 علمي" required'))}${field('عدد الطالبات', inp('count', '', 'type="number" min="1" max="60" inputmode="numeric" required'))}${field('الصف', inp('grade', '', 'placeholder="الثاني الثانوي"'))}${field('نوع الشعبة', `<select name="classRole" id="f-classRole">${opts([['intervention','تدخّل'],['comparison','مقارنة (تُقاس فقط)']])}</select>`)}${field('المعلمة', `<select name="teacher" id="f-cteacher">${opts(D.team.map(m => m.code), myCode())}</select>`)}<div class="row" style="align-self:end"><button class="btn ghost" type="submit">إضافة الفصل</button></div></form></section>
  <section class="panel">${stepHead(5, 'دورات بحث الدرس', 'دورة واحدة نشطة في كل مرة، نحو 6 أسابيع.')}<div class="ledger">${D.cycles.slice().sort((a, b) => a.code.localeCompare(b.code)).map(c => `<div class="rec"><div class="row between"><b>${esc(c.code)} · ${esc(c.title || '')}</b><span class="chip">${esc(c.studyPhase)} · المرحلة ${esc(c.phase)}: ${esc(PHASES[(c.phase || 1) - 1].n)}</span></div><div class="meta">${subjChip(c.subject)}<span>بدأت ${esc(fmtDate(c.startDate))}</span></div></div>`).join('') || '<div class="empty">لا دورات بعد.</div>'}</div>
    ${ed ? `<form data-form="cycle" class="grid">${field('عنوان الدورة', inp('title', '', 'placeholder="مثال: من الإجراء إلى التفسير" required'))}${field('مقرر درس البحث', `<select name="subject" id="f-cysubject">${opts(SUBJ.map(s => s.n))}</select>`)}${field('تاريخ البداية', inp('startDate', today(), 'type="date"'))}${field('وضع الدورة', `<select name="cyPhase" id="f-cyPhase">${opts([['Pilot','Pilot · تجريبية'],['Formal','Formal · رسمية']], phase())}</select>`)}<div class="row" style="align-self:end"><button class="btn ghost" type="submit">إنشاء الدورة</button></div></form>` : ''}</section>`;
};

/* =========================================================
   5b. Dashboard, analysis, library, attachments, minutes
   ========================================================= */
const SUBJ_VAR = {dt:'--c-dt', math:'--c-math', chem:'--c-chem', phys:'--c-phys', p1:'--p1', p2:'--p2', p3:'--p3', p4:'--p4', p5:'--p5', p6:'--p6', p7:'--p7', p8:'--p8'};
const sv = n => 'var(' + (SUBJ_VAR[(SUBJ_BY_NAME[n] || {}).k] || '--accent') + ')';
const TPV = ['var(--q1)','var(--q2)','var(--q3)','var(--q4)'];
const LV = ['var(--l0)','var(--l1)','var(--l2)','var(--l3)','var(--l4)'];
const tipA = s => ` data-tip="${esc(s)}" tabindex="0"`;
const legend = items => `<div class="legend">${items.map(([c, l]) => `<span><i style="background:${c}"></i>${esc(l)}</span>`).join('')}</div>`;
const indName = k => (INDICATORS.find(i => i[0] === k) || [k, k])[1];
const tpName = k => (TIMEPOINTS.find(i => i[0] === k) || [k, k])[1];

/* attachments */
function attachField() { return S.assets ? field('إرفاق ملف (اختياري)', `<input type="file" name="attach" id="f-attach" multiple accept="image/*,application/pdf">`, 'صورة عمل طالبة أو PDF. تأكدي ألا يظهر فيه أي اسم') : ''; }
async function uploadFiles(input) {
  const out = []; if (!input || !input.files || !input.files.length || !S.assets) return out;
  for (const file of Array.from(input.files)) {
    if (file.size > 20 * 1024 * 1024) { toast('الملف ' + file.name + ' أكبر من 20 ميغابايت ولم يُرفع.'); continue; }
    try { const r = await S.assets.upload(file); out.push({id: r.id, url: r.url, name: file.name, type: file.type || ''}); }
    catch (x) { toast('تعذّر رفع ' + file.name + '.'); }
  }
  return out;
}
const filesHtml = files => (files || []).length ? `<div class="row small">${files.map(f => `<a href="${esc(f.url || ('/_blob/' + f.id))}" target="_blank" rel="noopener">ملف: ${esc(f.name || 'ملف')}</a>`).join('')}</div>` : '';

/* charts */
function meansChart(evs, ind) {
  const H = 200;
  const groups = SUBJ.map(s => ({label: s.n, bars: TIMEPOINTS.map(([tp, tl], i) => { const x = evs.filter(e => e.subject === s.n && e.timePoint === tp).map(e => e[ind]).filter(v => v != null); return {m: avg(x), n: x.length, tl, i}; })}));
  return `<div class="vchart" role="img" aria-label="${esc('متوسط ' + indName(ind) + ' حسب المقرر ونقطة القياس')}">
  <div class="yaxis" style="height:${H}px">${[0,1,2,3,4].map(v => `<span style="bottom:${v / 4 * 100}%">${v}</span>`).join('')}</div>
  <div class="plot" style="height:${H}px">${[1,2,3,4].map(v => `<i class="gl" style="bottom:${v / 4 * 100}%"></i>`).join('')}${groups.map(g => `<div class="vgroup">${g.bars.map(b => b.m == null ? `<span class="vbar vnone"${tipA(g.label + ' · ' + b.tl + ': لا بيانات')}></span>` : `<span class="vbar" style="height:${b.m / 4 * 100}%;background:${TPV[b.i]}"${tipA(g.label + ' · ' + b.tl + ': ' + b.m.toFixed(2) + ' (ن=' + b.n + ')')}></span>`).join('')}</div>`).join('')}</div>
  <div></div><div class="xlabels">${groups.map(g => `<span>${esc(g.label)}</span>`).join('')}</div></div>
  ${legend(TIMEPOINTS.map(([, tl], i) => [TPV[i], tl]))}`;
}
function levelDist(evs, ind) {
  const rows = []; SUBJ.forEach(s => ['Baseline','Post'].forEach(tp => { const x = evs.filter(e => e.subject === s.n && e.timePoint === tp && e[ind] != null); rows.push({s: s.n, tp, n: x.length, c: [0,1,2,3,4].map(l => x.filter(e => e[ind] === l).length)}); }));
  return `<div class="ledger">${rows.map(r => `<div class="drow"><span class="dl">${esc(r.s)} · ${esc(tpName(r.tp).split(' ')[0] + ' ' + (tpName(r.tp).split(' ')[1] || ''))}</span>${r.n ? `<div class="hstack">${r.c.map((n, l) => n ? `<span style="flex:${n};background:${LV[l]}"${tipA(r.s + ' · ' + tpName(r.tp) + ' · مستوى ' + l + ': ' + n + ' (' + Math.round(n / r.n * 100) + '%)')}></span>` : '').join('')}</div>` : '<div class="hstack hnone"><span class="tiny muted" style="padding-inline:8px">لا بيانات</span></div>'}<span class="dn">${r.n}</span></div>`).join('')}</div>
  ${legend(RUBRIC.map((r, l) => [LV[l], r]))}`;
}
function weeklyChart(recs) {
  const weeks = []; for (let i = 7; i >= 0; i--) { const end = daysAgo(i * 7), start = daysAgo(i * 7 + 6); const x = recs.filter(r => { const d = dateOf(r); return d >= start && d <= end; }); weeks.push({start, end, n: x.length, notes: x.filter(r => r._k === 'n').length, ev: x.filter(r => r._k === 'e').length, ai: x.filter(r => r._k === 'a').length, dec: x.filter(r => r._k === 'd').length}); }
  const mx = Math.max(4, ...weeks.map(w => w.n)); const H = 150;
  return `<div class="vchart" role="img" aria-label="عدد السجلات في كل أسبوع خلال 8 أسابيع">
  <div class="yaxis" style="height:${H}px"><span style="bottom:0">0</span><span style="bottom:100%">${mx}</span></div>
  <div class="plot" style="height:${H}px"><i class="gl" style="bottom:50%"></i><i class="gl" style="bottom:100%"></i>${weeks.map((w, i) => `<div class="vgroup"><span class="vbar" style="width:60%;max-width:44px;height:${w.n / mx * 100}%;background:var(--accent)"${tipA(fmtDate(w.start) + ' – ' + fmtDate(w.end) + ': ' + w.n + ' سجل · ملاحظات ' + w.notes + ' · أدلة ' + w.ev + ' · AI ' + w.ai + ' · قرارات ' + w.dec)}></span>${i === 7 && w.n ? `<b class="vlab">${w.n}</b>` : ''}</div>`).join('')}</div>
  <div></div><div class="xlabels">${weeks.map((w, i) => `<span>${i === 7 ? 'هذا الأسبوع' : (i === 0 ? 'قبل 7' : '')}</span>`).join('')}</div></div>`;
}
function stackBar(parts, total) { return total ? `<div class="hstack" style="height:28px;flex:none">${parts.filter(p => p.n).map(p => `<span style="flex:${p.n};background:${p.c}"${tipA(p.l + ': ' + p.n + ' (' + Math.round(p.n / total * 100) + '%)')}></span>`).join('')}</div>${legend(parts.map(p => [p.c, p.l + ' ' + p.n]))}` : '<div class="empty">لا بيانات بعد.</div>'; }

/* ---- Dashboard ---- */
V.dash = () => {
  const cy = S.dashCycle; const f = arr => bySubj(cy ? arr.filter(r => r.cycleId === cy) : arr);
  const N = f(D.notes), E = f(D.evidence), A = f(D.ai), Dc = f(D.decisions);
  const students = D.classes.filter(c => !S.subj || c.subject === S.subj).reduce((a, c) => a + (Number(c.count) || 0), 0);
  const wk = daysAgo(7); const thisWeek = [...N, ...E, ...A, ...Dc].filter(r => dateOf(r) >= wk).length;
  const decEv = Dc.length ? Math.round(Dc.filter(d => d.evidence).length / Dc.length * 100) : null;
  const aiMod = A.length ? Math.round(A.filter(a => a.decision !== 'accepted').length / A.length * 100) : null;
  const tasksDone = D.tasks.length ? Math.round(D.tasks.filter(t => t.status === 'done').length / D.tasks.length * 100) : null;
  const recs = [...N.map(r => ({...r, _k: 'n'})), ...E.map(r => ({...r, _k: 'e'})), ...A.map(r => ({...r, _k: 'a'})), ...Dc.map(r => ({...r, _k: 'd'}))];
  const freq = {}; [...N, ...A].forEach(r => (r.practices || []).forEach(p => { freq[p] = (freq[p] || 0) + 1; })); const mx = Math.max(1, ...Object.values(freq));
  const c = curCycle(); const gaps = c ? PHASES.map((p, i) => { const ev = p.ev.map(([, fn]) => fn(c)); const ok = ev.filter(([n, t]) => t === 0 || n >= t).length; return {i, p, ok, tot: ev.length}; }) : [];
  return `<div class="row between"><div><h1>لوحة المعلومات</h1><p class="lede">صورة المشروع الآن: النشاط، الأدلة، التمايز، الذكاء الاصطناعي، والفريق. مرّري المؤشر على أي عمود لترَي الرقم.</p></div><button class="btn ghost" data-act="go-report" data-t="weekly">التقرير الأسبوعي</button></div>
  <div class="row between">${subjBar()}<label class="row small" style="font-weight:600">الدورة <select id="dashCycle" style="width:auto">${opts(D.cycles.map(x => x.code), cy, 'كل الدورات')}</select></label></div>
  <div class="grid">${[['طالبة في الفصول المشاركة', students], ['سجل هذا الأسبوع', thisWeek], ['دليل تعلّم', E.length], ['قرارات مبنية على دليل', decEv == null ? '—' : decEv + '%'], ['مقترحات AI عدّلتها المعلمة أو رفضتها', aiMod == null ? '—' : aiMod + '%'], ['إنجاز المهام', tasksDone == null ? '—' : tasksDone + '%']].map(([l, v]) => `<div class="stat"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>
  <div class="cols">
    <section class="panel"><h2>النشاط الأسبوعي</h2><p class="small muted">عدد كل السجلات في كل أسبوع، آخر 8 أسابيع</p>${weeklyChart(recs)}</section>
    <section class="panel"><h2>تقدّم الدورة ${c ? esc(c.code) : ''}</h2>${c ? `<div class="ledger">${gaps.map(g => `<div class="drow"><span class="dl">${g.i + 1}. ${esc(g.p.n)}</span><div class="meter" style="flex:1"><span style="width:${Math.round(g.ok / g.tot * 100)}%;${g.i + 1 === Number(c.phase) ? 'background:var(--amber)' : ''}"></span></div><span class="dn">${g.ok}/${g.tot}</span></div>`).join('')}</div><p class="tiny muted">الأدلة المكتملة في كل مرحلة. البرتقالي: المرحلة الحالية.</p>` : '<div class="empty">لا دورة بعد.</div>'}</section>
  </div>
  <section class="panel"><div class="row between"><h2>أثر الطالبات: متوسط ${esc(indName(S.dashInd))} (0–4)</h2><select id="dashInd" style="width:auto" aria-label="المؤشر">${opts(INDICATORS.map(i => [i[0], i[1]]), S.dashInd)}</select></div>${meansChart(E, S.dashInd)}<p class="tiny muted">أعمدة فارغة = لم يُقس بعد. القراءة وصفية؛ للتحليل الأدق افتحي «التحليل».</p></section>
  <section class="panel"><h2>توزيع المستويات قبل الدورة وبعدها: ${esc(indName(S.dashInd))}</h2><p class="small muted">هذا ما يوجّه التمايز: كم طالبة في كل مستوى، وهل انتقلن إلى مستويات أعلى؟</p>${levelDist(E, S.dashInd)}</section>
  <div class="cols">
    <section class="panel"><h2>قرارات المعلمات على مقترحات AI</h2>${stackBar([{n: A.filter(a => a.decision === 'accepted').length, c: 'var(--accent)', l: 'قبول'}, {n: A.filter(a => a.decision === 'modified').length, c: 'var(--q2)', l: 'تعديل'}, {n: A.filter(a => a.decision === 'rejected').length, c: 'var(--amber)', l: 'رفض'}], A.length)}${A.filter(a => a.diffStats).length ? `<p class="small">متوسط ما بقي من نص AI بعد تحرير المعلمة: <b>${Math.round(avg(A.filter(a => a.diffStats).map(a => a.diffStats.sim)))}%</b></p>` : ''}</section>
    <section class="panel"><h2>الممارسات المهنية الأكثر حضورًا</h2><div class="bars">${PRACTICES.map(([k, l]) => `<div class="bar"><span>${l}</span><div class="meter"><span style="width:${Math.round((freq[k] || 0) / mx * 100)}%"></span></div><b>${freq[k] || 0}</b></div>`).join('')}</div></section>
  </div>
  <section class="panel"><h2>مشاركة الفريق</h2><div class="scroll"><table><thead><tr><th>المعلمة</th><th>المقرر</th><th>أثناء الحصة</th><th>خارج الحصة</th><th>تأملات</th><th>أدلة تعلّم</th><th>سجلات AI</th><th>المهام المكتملة</th><th>آخر نشاط</th></tr></thead><tbody>${D.team.slice().sort((a, b) => a.code.localeCompare(b.code)).map(m => { const mine = arr => arr.filter(r => r.author === m.code); const all = [...mine(N), ...mine(E), ...mine(A)].sort(byNewest); const tk = D.tasks.filter(t => t.owner === m.code); return `<tr><td><b>${esc(m.code)}</b></td><td>${subjChip(m.discipline) || esc(m.discipline)}</td><td>${mine(N).filter(n => n.context === 'in').length}</td><td>${mine(N).filter(n => n.context === 'out').length}</td><td>${mine(N).filter(n => n.context === 'after').length}</td><td>${mine(E).length}</td><td>${mine(A).length}</td><td>${tk.filter(t => t.status === 'done').length}/${tk.length}</td><td>${all[0] ? esc(fmtDate(all[0].date || all[0].createdAt)) : '—'}</td></tr>`; }).join('')}</tbody></table></div></section>
  <section class="panel"><h2>جودة البيانات</h2><div class="grid">${[['أدلة بلا فصل', E.filter(e => !e.classId).length], ['ملاحظات بلا درس', N.filter(n => !n.lessonTitle).length], ['قرارات بلا دليل', Dc.filter(d => !d.evidence).length], ['سجلات AI بلا سبب', A.filter(a => !a.reason).length], ['حسابات غير مرتبطة', D.team.filter(m => !m.userId).length], ['مهام متأخرة', D.tasks.filter(t => t.status !== 'done' && t.due && t.due < today()).length]].map(([l, v]) => `<div class="stat"><b style="color:${v ? 'var(--amber)' : 'var(--accent)'}">${v}</b><span>${esc(l)}${v ? ' · يحتاج متابعة' : ' · سليم'}</span></div>`).join('')}</div></section>`;
};

/* ---- Analysis ---- */
function latestBy(list) { const m = {}; list.slice().sort((a, b) => String(a.createdAt || a.date).localeCompare(String(b.createdAt || b.date))).forEach(e => { m[e.studentCode] = e; }); return m; }
function pairsOf(ind, from, to, subj, filterFn) {
  const ev = D.evidence.filter(e => e[ind] != null && (!subj || e.subject === subj) && (!filterFn || filterFn(e)));
  const A = latestBy(ev.filter(e => e.timePoint === from)), B = latestBy(ev.filter(e => e.timePoint === to));
  return Object.keys(A).filter(k => B[k]).map(k => ({code: k, subject: A[k].subject, classId: A[k].classId, a: A[k][ind], b: B[k][ind], d: B[k][ind] - A[k][ind], support: B[k].supportLevel}));
}
function pstats(P) {
  if (!P.length) return null; const n = P.length; const ma = avg(P.map(p => p.a)), mb = avg(P.map(p => p.b)), md = avg(P.map(p => p.d));
  const sd = n > 1 ? Math.sqrt(P.reduce((s, p) => s + (p.d - md) ** 2, 0) / (n - 1)) : null;
  return {n, ma, mb, md, sd, dz: sd ? md / sd : null, up: P.filter(p => p.d > 0).length, same: P.filter(p => p.d === 0).length, down: P.filter(p => p.d < 0).length};
}
function statTiles(st) { return st ? `<div class="grid">${[['عدد الطالبات (أزواج)', st.n], ['المتوسط قبل', f1(st.ma)], ['المتوسط بعد', f1(st.mb)], ['متوسط التغيّر', (st.md >= 0 ? '+' : '') + st.md.toFixed(2)], ['حجم الأثر dz', st.dz == null ? '—' : st.dz.toFixed(2)], ['تحسّنّ / ثبتن / تراجعن', st.up + ' / ' + st.same + ' / ' + st.down]].map(([l, v]) => `<div class="stat"><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')}</div>` : ''; }
function changeHist(P) {
  const bins = [-4,-3,-2,-1,0,1,2,3,4].map(v => ({v, n: P.filter(p => p.d === v).length})); const mx = Math.max(1, ...bins.map(b => b.n)); const H = 140;
  return `<div class="vchart" role="img" aria-label="توزيع التغيّر في الدرجة"><div class="yaxis" style="height:${H}px"><span style="bottom:0">0</span><span style="bottom:100%">${mx}</span></div>
  <div class="plot" style="height:${H}px;flex-direction:row-reverse">${bins.map(b => `<div class="vgroup"><span class="vbar" style="width:60%;max-width:40px;height:${b.n / mx * 100}%;background:${b.v > 0 ? 'var(--accent)' : (b.v < 0 ? 'var(--amber)' : 'var(--l1)')}"${tipA('تغيّر ' + (b.v > 0 ? '+' : '') + b.v + ': ' + b.n + ' طالبة')}></span></div>`).join('')}</div>
  <div></div><div class="xlabels" style="flex-direction:row-reverse">${bins.map(b => `<span>${b.v > 0 ? '+' : ''}${b.v}</span>`).join('')}</div></div>${legend([['var(--amber)', 'تراجع'], ['var(--l1)', 'ثبات'], ['var(--accent)', 'تحسّن']])}`;
}
V.analysis = () => {
  const t = S.anTab; const tabs = [['growth','نمو الطالبات (أزواج)'],['levels','التمايز حسب مستوى البداية'],['compare','الشعب: تدخّل ومقارنة'],['qual','التحليل النوعي']];
  const ctrl = `<div class="row">${field('المؤشر', `<select id="anInd">${opts(INDICATORS.map(i => [i[0], i[1]]), S.anInd)}</select>`)}${field('من', `<select id="anFrom">${opts(TIMEPOINTS, S.anFrom)}</select>`)}${field('إلى', `<select id="anTo">${opts(TIMEPOINTS, S.anTo)}</select>`)}</div>`;
  let body = '';
  if (t === 'growth') { const P = pairsOf(S.anInd, S.anFrom, S.anTo, S.subj); const st = pstats(P);
    body = `<section class="panel">${ctrl}${subjBar()}<p class="small muted">نقارن الطالبة نفسها بين نقطتين، لا متوسطات مجموعات مختلفة. حجم الأثر dz = متوسط التغيّر ÷ انحرافه المعياري (0.2 صغير، 0.5 متوسط، 0.8 كبير تقريبًا).</p>
    ${st ? statTiles(st) + `<h3>توزيع التغيّر</h3>${changeHist(P)}<details class="help"><summary>جدول الطالبات (${P.length})</summary><div class="scroll"><table><thead><tr><th>الطالبة</th><th>المقرر</th><th>${esc(tpName(S.anFrom))}</th><th>${esc(tpName(S.anTo))}</th><th>التغيّر</th><th>الدعم في القياس الثاني</th></tr></thead><tbody>${P.sort((a, b) => b.d - a.d).map(p => `<tr><td>${esc(p.code)}</td><td>${subjChip(p.subject)}</td><td>${p.a}</td><td>${p.b}</td><td><b>${p.d > 0 ? '+' : ''}${p.d}</b></td><td>${esc(p.support || '—')}</td></tr>`).join('')}</tbody></table></div></details>` : `<div class="empty">لا توجد طالبات لهن قياسان في «${esc(tpName(S.anFrom))}» و«${esc(tpName(S.anTo))}» لهذا المؤشر بعد. يظهر التحليل عند إدخال القياسين للطالبة نفسها برمزها نفسه.</div>`}</section>`; }
  if (t === 'levels') { const P = pairsOf(S.anInd, S.anFrom, S.anTo, S.subj); const G = [['أ · بداية منخفضة (0–1)', p => p.a <= 1], ['ب · بداية متوسطة (2)', p => p.a === 2], ['ج · بداية مرتفعة (3–4)', p => p.a >= 3]];
    body = `<section class="panel">${ctrl}${subjBar()}<p class="small muted">هل استفادت كل مستويات البداية؟ التمايز الناجح يرفع المستوى المنخفض دون أن يوقف نمو المرتفع.</p>
    ${P.length ? `<div class="scroll"><table><thead><tr><th>مستوى البداية</th><th>ن</th><th>قبل</th><th>بعد</th><th>متوسط التغيّر</th><th></th><th>تحسّنّ</th></tr></thead><tbody>${G.map(([l, fn]) => { const st = pstats(P.filter(fn)); return `<tr><td><b>${esc(l)}</b></td><td>${st ? st.n : 0}</td><td>${st ? f1(st.ma) : '—'}</td><td>${st ? f1(st.mb) : '—'}</td><td>${st ? (st.md >= 0 ? '+' : '') + st.md.toFixed(2) : '—'}</td><td style="min-width:140px">${st ? `<div class="meter"><span style="width:${Math.max(0, Math.min(100, st.md / 4 * 100))}%"></span></div>` : ''}</td><td>${st ? Math.round(st.up / st.n * 100) + '%' : '—'}</td></tr>`; }).join('')}</tbody></table></div>
    <h3>الدعم الذي احتاجته الطالبات في القياس الثاني</h3>${G.map(([l, fn]) => { const x = P.filter(fn); const lv = ['بلا دعم','دعم 1: تلميح','دعم 2: بطاقة موجّهة','دعم 3: مثال محلول']; return `<div class="drow"><span class="dl">${esc(l.split(' · ')[0])}</span>${x.length ? `<div class="hstack">${lv.map((s, i) => { const n = x.filter(p => p.support === s).length; return n ? `<span style="flex:${n};background:${LV[4 - i]}"${tipA(l + ' · ' + s + ': ' + n)}></span>` : ''; }).join('')}</div>` : '<div class="hstack hnone"></div>'}<span class="dn">${x.length}</span></div>`; }).join('')}${legend(['بلا دعم','دعم 1','دعم 2','دعم 3'].map((s, i) => [LV[4 - i], s]))}` : '<div class="empty">لا أزواج قياس بعد.</div>'}</section>`; }
  if (t === 'compare') { const role = e => (D.classes.find(c => c.code === e.classId) || {}).classRole || 'intervention'; const I = pstats(pairsOf(S.anInd, S.anFrom, S.anTo, S.subj, e => role(e) === 'intervention')), C = pstats(pairsOf(S.anInd, S.anFrom, S.anTo, S.subj, e => role(e) === 'comparison'));
    body = `<section class="panel">${ctrl}${subjBar()}<p class="small muted">إن وُجدت شعب مقارنة (تُقاس فقط)، نقارن تغيّر طالبات التدخّل بتغيّر طالبات المقارنة. يُحدَّد نوع الشعبة في «الإعداد».</p>
    ${C ? `<div class="scroll"><table><thead><tr><th>المجموعة</th><th>ن</th><th>قبل</th><th>بعد</th><th>متوسط التغيّر</th><th>dz</th></tr></thead><tbody>${[['شعب التدخّل', I], ['شعب المقارنة', C]].map(([l, s]) => `<tr><td><b>${l}</b></td><td>${s ? s.n : 0}</td><td>${s ? f1(s.ma) : '—'}</td><td>${s ? f1(s.mb) : '—'}</td><td>${s ? (s.md >= 0 ? '+' : '') + s.md.toFixed(2) : '—'}</td><td>${s && s.dz != null ? s.dz.toFixed(2) : '—'}</td></tr>`).join('')}</tbody></table></div>${I ? `<div class="ok">الفرق في متوسط التغيّر: ${(I.md - C.md >= 0 ? '+' : '') + (I.md - C.md).toFixed(2)} لصالح ${I.md >= C.md ? 'شعب التدخّل' : 'شعب المقارنة'} (وصفي)</div>` : ''}` : '<div class="empty">لا توجد شعب مقارنة لها قياسان بعد. أضيفي شعبة من نوع «مقارنة» في الإعداد إن كان التصميم يسمح بذلك.</div>'}</section>`; }
  if (t === 'qual') body = `<section class="panel"><div class="grid">${field('كلمة البحث', `<input id="qq" value="${esc(S.qq || '')}" placeholder="مثال: الميل، تعثّر، دعم الأقران" autocomplete="off">`)}${field('السياق', `<select id="qctx">${opts(Object.entries(CONTEXTS).map(([k, x]) => [k, x.n]), S.qctx, 'كل السياقات')}</select>`)}${field('الممارسة', `<select id="qpr">${opts(PRACTICES, S.qpr, 'كل الممارسات')}</select>`)}</div>${subjBar()}
    <p class="small muted">ابحثي في كل الملاحظات والتأملات عن موضوع أو نمط، ثم صدّري النتائج للترميز في NVivo أو MAXQDA.</p><div class="row"><button class="btn ghost small" data-act="qual-export"${S.downloads ? '' : ' disabled'}>تصدير النتائج CSV</button></div><div id="qualOut">${qualHtml()}</div></section>`;
  return `<div><h1>التحليل</h1><p class="lede">تحليل وصفي استكشافي لبياناتكم: نمو الطالبة نفسها، والتمايز حسب مستوى البداية، والمقارنة بين الشعب، والبحث في النصوص. في وضع Pilot تُقرأ النتائج لتحسين العمل، لا للنشر.</p></div>
  <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab" role="tab" aria-selected="${k === t}" data-act="an-tab" data-tab="${k}">${l}</button>`).join('')}</div>${body}`;
};
const QTEXT = ['observed','stumble','promptUsed','response','learningEvidence','text','discussed','proposal','noticed','learned','change','next','openQuestion','evidenceRef'];
function qualRows() { const q = (S.qq || '').trim(); return bySubj(D.notes).filter(n => (!S.qctx || n.context === S.qctx) && (!S.qpr || (n.practices || []).includes(S.qpr)) && (!q || QTEXT.some(k => String(n[k] || '').includes(q)))).sort(byNewest); }
function qualHtml() {
  const rows = qualRows(); const q = (S.qq || '').trim();
  const hl = s => { const e = esc(s); return q ? e.split(esc(q)).join(`<mark>${esc(q)}</mark>`) : e; };
  return `<p class="small"><b>${rows.length}</b> سجل مطابق</p><div class="ledger">${rows.slice(0, 80).map(n => `<div class="rec"><div class="row"><span class="chip plain">${esc(n.code)}</span><span class="chip">${esc(CONTEXTS[n.context] ? CONTEXTS[n.context].n : n.context)}</span></div>${ctxMeta(n)}<dl class="kv">${QTEXT.filter(k => n[k]).map(k => `<dt>${esc(NOTE_LAB[k] || k)}</dt><dd>${hl(n[k])}</dd>`).join('')}</dl>${practiceChips(n.practices)}</div>`).join('') || '<div class="empty">لا نتائج.</div>'}</div>`;
}

/* ---- Library ---- */
const LIB_CATS = ['دراسات علمية','بحث الدرس Lesson Study','مجتمعات التعلّم المهني','التعليم المتمايز','الذكاء الاصطناعي التوليدي','أدوات القياس','أدلة وأطر رسمية','مراجع الدكتوراه','نماذج وقوالب الفريق','صادر عن الفريق'];
const LIB_TYPES = ['كتاب','مقالة علمية','رسالة علمية','دليل أو إطار رسمي','صفحة ويب','أداة قياس','قالب أو نموذج','عرض أو تقرير صادر عنا','ملف داخلي'];
const apaOf = o => [o.authors ? o.authors + (o.year ? ` (${o.year}).` : '.') : (o.year ? `(${o.year}).` : ''), o.title ? o.title + '.' : '', o.publisher ? o.publisher + '.' : '', o.link || ''].filter(Boolean).join(' ');
V.library = () => {
  const cat = S.libCat; const q = (S.libq || '').trim();
  const list = D.library.filter(r => (!cat || r.category === cat) && (!q || [r.title, r.authors, r.summary, r.use, r.apa].some(x => String(x || '').includes(q)))).sort((a, b) => String(a.category).localeCompare(String(b.category)) || String(a.title).localeCompare(String(b.title)));
  return `<div><h1>المكتبة والمراجع</h1><p class="lede">كل ما يستند إليه المشروع في مكان واحد: الدراسات، والأدلة الرسمية، وأدوات القياس، ومراجع الرسالة، والقوالب، وما يصدر عن الفريق من تقارير وعروض.</p></div>
  <div class="row"><button class="btn small ${cat ? 'ghost' : ''}" data-act="lib-cat" data-c="">الكل (${D.library.length})</button>${LIB_CATS.map(c => `<button class="btn small ${cat === c ? '' : 'ghost'}" data-act="lib-cat" data-c="${esc(c)}">${esc(c)} (${D.library.filter(r => r.category === c).length})</button>`).join('')}</div>
  <div class="row"><input id="libq" value="${esc(S.libq || '')}" placeholder="ابحثي في العناوين والمؤلفين والملخصات" style="max-width:520px" aria-label="بحث في المكتبة"></div>
  <section class="panel"><div class="ledger" id="libOut">${libListHtml(list)}</div></section>
  <details class="panel"><summary style="cursor:pointer;font-weight:600;color:var(--accent)">＋ إضافة مرجع أو مصدر أو ملف</summary>
  <form data-form="lib" class="stepsec">
    <div class="grid">${field('التصنيف', `<select name="category" id="f-category">${opts(LIB_CATS, cat || LIB_CATS[0])}</select>`)}${field('النوع', `<select name="type" id="f-type">${opts(LIB_TYPES)}</select>`)}${field('السنة', inp('year', '', 'inputmode="numeric" placeholder="2024"'))}</div>
    <div class="grid wide">${field('العنوان', inp('title', '', 'required'))}${field('المؤلفون أو الجهة', inp('authors', '', 'placeholder="Lewis, C., & Hurd, J."'))}${field('الناشر أو المجلة', inp('publisher'))}${field('الرابط', inp('link', '', 'type="url" placeholder="https://"'))}</div>
    ${field('التوثيق (APA)', area('apa', '', 'placeholder="اتركيه فارغًا ليُولَّد من الحقول أعلاه"'))}
    <div class="grid wide">${field('ملخص قصير', area('summary'))}${field('كيف نستفيد منه في المشروع؟', area('use'))}</div>
    ${field('يرتبط بسؤال البحث', checks('rqs', D.rqs.slice().sort((a, b) => a.code.localeCompare(b.code)).map(r => [r.code, r.code])))}
    ${attachField()}
    <label class="row small" style="font-weight:500"><input type="checkbox" name="verified" value="1"> تحقّقتُ من بيانات المرجع من مصدره الأصلي</label>
    <div class="row"><button class="btn" type="submit">حفظ في المكتبة</button></div></form></details>`;
};
function libListHtml(list) {
  if (!list.length) return '<div class="empty">لا عناصر في هذا التصنيف بعد.</div>';
  return list.map(r => `<div class="rec"><div class="row between"><div class="row"><span class="chip plain">${esc(r.category)}</span><span class="chip plain">${esc(r.type || '')}</span>${r.verified ? '<span class="chip">موثّق</span>' : '<span class="chip warn">تحقّقي من البيانات</span>'}</div><div class="row">${r.link ? `<a class="btn ghost small" href="${esc(r.link)}" target="_blank" rel="noopener">فتح الرابط</a>` : ''}<button class="btn ghost small" data-act="lib-copy" data-id="${esc(r._id)}">نسخ التوثيق</button>${S.canEdit ? `<button class="btn ghost small" data-act="lib-ver" data-id="${esc(r._id)}">${r.verified ? 'إلغاء التوثيق' : 'وُثّق ✓'}</button><button class="btn ghost small" data-act="lib-del" data-id="${esc(r._id)}">${S.delArm === r._id ? 'تأكيد الحذف' : 'حذف'}</button>` : ''}</div></div>
  <b style="font-size:16px">${esc(r.title)}</b><div class="small muted">${esc(r.apa || apaOf(r))}</div>
  ${r.summary ? `<div class="body">${esc(r.summary)}</div>` : ''}${r.use ? `<div class="body"><b>كيف نستفيد منه:</b> ${esc(r.use)}</div>` : ''}${(r.rqs || []).length ? `<div class="row">${r.rqs.map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>` : ''}${filesHtml(r.files)}</div>`).join('');
}

/* ---- Meeting minutes ---- */
function minutesHtml(mid) {
  const m = D.meetings.find(x => x.code === mid) || D.meetings.slice().sort(byNewest)[0];
  if (!m) return '<p class="muted">لا اجتماعات مسجّلة بعد.</p>';
  const st = D.settings; const notes = D.notes.filter(n => n.meetingId === m.code); const decs = D.decisions.filter(d => d.meetingId === m.code); const tasks = D.tasks.filter(t => t.meetingId === m.code);
  return `<h2>محضر الاجتماع ${esc(m.code)}</h2><div class="rmeta"><span>${esc(st.projectName || 'بُرهان')}${st.school ? ' · ' + esc(st.school) : ''}</span><span>التاريخ: ${esc(fmtDate(m.date))}</span><span>الدورة: ${esc(m.cycleId || '—')}</span><span>الحضور: ${esc((m.attendees || []).join('، ') || '—')}</span>${m.minutesLink ? `<span>الرابط: ${esc(m.minutesLink)}</span>` : ''}</div>
  <h3>الهدف</h3><p>${esc(m.goal || '—')}</p><h3>جدول الأعمال</h3><p style="white-space:pre-wrap">${esc(m.agenda || '—')}</p><h3>الأدلة التي نوقشت</h3><p style="white-space:pre-wrap">${esc(m.evidence || '—')}</p>
  <h3>ما دوّنته العضوات</h3>${rpTable(['العضوة','المقرر','الأدلة المعروضة','ما نوقش','المقترح'], notes.filter(n => n.context === 'meeting').map(n => [esc(n.author), subjChip(n.subject), esc(n.discussed), esc(n.text), esc(n.proposal)]))}
  <h3>القرارات</h3>${rpTable(['الرمز','الدليل','القرار','السبب','المشاركات'], decs.map(d => [esc(d.code), esc(d.evidence), esc(d.decision), esc(d.reason), esc((d.participants || []).join('، '))]))}${m.decisionsSummary ? `<p>${esc(m.decisionsSummary)}</p>` : ''}
  <h3>المهام</h3>${rpTable(['المهمة','المسؤولة','الاستحقاق','الحالة'], tasks.map(t => [esc(t.title), esc(t.owner), esc(fmtDate(t.due)), t.status === 'done' ? 'مكتملة' : 'مفتوحة']))}
  <h3>تأملات بعد الاجتماع</h3>${rpTable(['العضوة','ما سأغيّره','سؤال مفتوح'], notes.filter(n => n.context === 'after').map(n => [esc(n.author), esc(n.next), esc(n.openQuestion)]))}`;
}

/* tooltip */
const tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.hidden = true; tipEl.setAttribute('role', 'tooltip'); document.body.appendChild(tipEl);
function showTip(t) { tipEl.textContent = t.dataset.tip; tipEl.hidden = false; const r = t.getBoundingClientRect(); const w = tipEl.offsetWidth, h = tipEl.offsetHeight; tipEl.style.left = Math.min(innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2)) + 'px'; tipEl.style.top = (r.top - h - 8 < 8 ? r.bottom + 8 : r.top - h - 8) + 'px'; }
document.addEventListener('mouseover', e => { const t = e.target.closest && e.target.closest('[data-tip]'); if (t) showTip(t); else tipEl.hidden = true; });
document.addEventListener('focusin', e => { const t = e.target.closest && e.target.closest('[data-tip]'); if (t) showTip(t); else tipEl.hidden = true; });
document.addEventListener('scroll', () => { tipEl.hidden = true; }, true);

/* extra events */
document.addEventListener('change', e => {
  const t = e.target; const rr = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
  if (t.id === 'dashCycle') { S.dashCycle = t.value; rr(); }
  if (t.id === 'dashInd') { S.dashInd = t.value; rr(); }
  if (t.id === 'anInd') { S.anInd = t.value; rr(); }
  if (t.id === 'anFrom') { S.anFrom = t.value; rr(); }
  if (t.id === 'anTo') { S.anTo = t.value; rr(); }
  if (t.id === 'qctx') { S.qctx = t.value; $('#qualOut').innerHTML = qualHtml(); }
  if (t.id === 'qpr') { S.qpr = t.value; $('#qualOut').innerHTML = qualHtml(); }
  if (t.id === 'repMeeting') { S.repMeeting = t.value; $('#repOut').innerHTML = minutesHtml(t.value); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'qq') { S.qq = e.target.value; clearTimeout(qualHtml.t); qualHtml.t = setTimeout(() => { $('#qualOut').innerHTML = qualHtml(); }, 200); }
  if (e.target.id === 'libq') { S.libq = e.target.value; clearTimeout(libListHtml.t); libListHtml.t = setTimeout(() => { const cat = S.libCat, q = S.libq.trim(); $('#libOut').innerHTML = libListHtml(D.library.filter(r => (!cat || r.category === cat) && (!q || [r.title, r.authors, r.summary, r.use, r.apa].some(x => String(x || '').includes(q))))); }, 200); }
});
document.addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]'); if (!b) return; const act = b.dataset.act; const rr = () => { const y = window.scrollY; render(); window.scrollTo(0, y); };
  if (act === 'an-tab') { S.anTab = b.dataset.tab; rr(); }
  if (act === 'lib-cat') { S.libCat = b.dataset.c; rr(); }
  if (act === 'lib-copy') { const r = D.library.find(x => x._id === b.dataset.id); if (r) { const txt = r.apa || apaOf(r); try { await navigator.clipboard.writeText(txt); toast('نُسخ التوثيق.'); } catch (x) { toast(txt); } } }
  if (act === 'lib-ver') { const r = D.library.find(x => x._id === b.dataset.id); if (r) try { await S.db.collection('library').doc(r._id).update({verified: !r.verified}); } catch (x) { handleDbErr(x); } }
  if (act === 'lib-del') { if (S.delArm !== b.dataset.id) { S.delArm = b.dataset.id; b.textContent = 'تأكيد الحذف'; return; } try { await S.db.collection('library').doc(b.dataset.id).delete(); S.delArm = ''; toast('حُذف العنصر.'); } catch (x) { handleDbErr(x); } }
  if (act === 'minutes') { S.repType = 'minutes'; S.repMeeting = b.dataset.m; go('reports'); }
  if (act === 'qual-export') { const rows = qualRows(); if (!rows.length || !S.downloads) { toast('لا نتائج للتصدير.'); return; } const cols = ['NoteID','Context','Subject','ClassName','LessonTitle','TeacherID','Date', ...QTEXT, 'Practices']; const data = rows.map(n => Object.assign({NoteID: n.code, Context: n.context, Subject: n.subject, ClassName: n.className, LessonTitle: n.lessonTitle, TeacherID: n.author, Date: n.date, Practices: n.practices}, Object.fromEntries(QTEXT.map(k => [k, n[k]])))); try { await S.downloads.save({filename: 'Qualitative_Search_' + today() + '.csv', data: csv(data, cols)}); toast('صُدّرت ' + rows.length + ' ملاحظة.'); } catch (x) { toast('أُلغي التنزيل.'); } }
});

/* =========================================================
   5c. AI protocol, prompt templates, evidence→AI→decision chain,
       role matrix, Microsoft 365 package
   ========================================================= */
const AI_STAGES = [
  ['S1','اجتماع 1 · التشخيص: تنظيم أنماط الأخطاء'],
  ['S2','اجتماع 2 · خط الأساس: أسئلة تشخيصية'],
  ['S3','اجتماع 3 · التصميم: التمايز ومستويات الدعم'],
  ['S4','اجتماع 4 · قبل التنفيذ: نقد V1 وتوقع الاستجابات'],
  ['S5','اجتماع 5 · بعد الملاحظة: تنظيم الأدلة واقتراح V2'],
  ['S6','اجتماع 6 · الإغلاق: التلخيص والتقرير'],
  ['X','استخدام فردي خارج البروتوكول']];
const STAGE_NAME = Object.fromEntries(AI_STAGES);
const AI_PROTOCOL = [
  ['S1','التشخيص','بعد أن تقرأ المعلمات العينات بأنفسهن','القائدة مع الفريق','تنظيم أنماط الأخطاء في عينات مجهّلة','قبل الدرس','حلّلي الأدلة'],
  ['S2','خط الأساس','بعد تحديد المشكلة','معلمة كل مقرر','بناء أسئلة تشخيصية لمهمة خط الأساس','قبل الدرس','شخّصي'],
  ['S3','التصميم','بعد قراءة درجات خط الأساس','معلمة المادة + الفريق','اقتراح مسارات تمايز ومستويات دعم','قبل الدرس','اقترحي تمايزًا · صمّمي تلميحات'],
  ['S4','قبل التنفيذ','بعد كتابة V1','الفريق','نقد V1 وتوقّع استجابات الطالبات','قبل الدرس','انتقدي V1'],
  ['—','أثناء الحصة','—','الملاحِظات','لا استخدام للذكاء الاصطناعي: نجمع بيانات خامًا كما حدثت','أثناء الدرس','—'],
  ['S5','بعد الملاحظة','بعد أن يحلّل الفريق الملاحظات بنفسه','الفريق','تنظيم الملاحظات واقتراح تعديلات V2','بعد الدرس','اقترحي V2'],
  ['S6','الإغلاق','بعد اعتماد النتائج','القائدة','المساعدة في تلخيص القرارات وكتابة التقرير','بعد الدرس','لخّصي القرارات · انقلي المبدأ']];
const AI_TEMPLATES = [
  ['analyze','حلّلي الأدلة','S1','تحليل أنماط الأخطاء','إليكِ ملخصًا مجهّلًا لأعمال طالبات في مقرر [المقرر]، الصف [الصف]، في مهمة [وصف المهمة]:\n[الصقي هنا الإجابات أو ملخصها برموز S فقط]\n\nصنّفي الإجابات في أنماط أخطاء أو تفكير، واذكري لكل نمط: وصفه، وعدد الطالبات فيه، ومثالًا واحدًا. لا تقترحي حلولًا بعد.'],
  ['diagnose','شخّصي','S2','أسئلة تكشف التفكير','هذه أنماط الأخطاء التي حددها الفريق في [المقرر]:\n[الأنماط]\n\nما الأسباب المحتملة لكل نمط (نقص معرفة سابقة، مفهوم خاطئ، ضعف مهارة)؟ ثم اقترحي ثلاثة أسئلة تشخيصية قصيرة تميّز بين هذه الأسباب، يُصحَّح كل سؤال بمقياس 0–4.'],
  ['differentiate','اقترحي تمايزًا','S3','مستويات دعم متدرجة','هدف الدرس: [الهدف]\nالمقرر والصف: [المقرر، الصف]\nتوزيع الطالبات حسب خط الأساس: مستوى أ (0–1): [عدد]، مستوى ب (2): [عدد]، مستوى ج (3–4): [عدد].\nنقطة التعثّر الرئيسة: [التعثّر]\n\nاقترحي مسارًا لكل مستوى يحافظ على الهدف نفسه: نقطة البداية، نوع الدعم، والمهمة. وأنهِ بمهمة خروج واحدة للجميع.'],
  ['hints','صمّمي تلميحات','S3','مستويات دعم متدرجة','هذه مهمة للطالبات: [المهمة]\n\nاكتبي ثلاثة مستويات من التلميح المتدرج دون إعطاء الحل: تلميح 1 سؤال يوجّه الانتباه، تلميح 2 خطوة أولى موجّهة، تلميح 3 مثال محلول جزئيًا مشابه.'],
  ['critique','انتقدي V1','S4','تعديل درس قائم','هذه خطة درس البحث V1:\n[الصقي الخطة]\n\nتوقّعي لكل مهمة ثلاث استجابات محتملة من الطالبات (صحيحة، جزئية، خاطئة) ونقاط التعثّر المتوقعة. ثم أشيري إلى ثلاثة مواضع قد لا ينجح فيها التمايز، ولماذا.'],
  ['v2','اقترحي V2','S5','تعديل درس قائم','هذه خطة V1:\n[الخطة]\n\nوهذا ملخص ملاحظات الفريق المجهّلة وقراراته:\n[الملاحظات والقرارات]\n\nاقترحي تعديلات محددة للنسخة V2، واربطي كل تعديل بدليل من الملاحظات. لا تغيّري هدف الدرس.'],
  ['summarize','لخّصي القرارات','S6','أخرى','هذه قرارات اجتماع الفريق وأدلتها:\n[القرارات]\n\nلخّصيها في جدول: الدليل، القرار، السبب، الإجراء، ما سنقيسه بعد التطبيق. لا تضيفي قرارات لم تُذكر.'],
  ['transfer','انقلي المبدأ','S6','مهمة نقل التعلّم','نجحت هذه الممارسة في مقرر [المقرر أ]:\n[وصف الممارسة والدليل على نجاحها]\n\nكيف نطبّق المبدأ نفسه في مقرر [المقرر ب] للصف [الصف]؟ قدّمي مثالًا واحدًا محددًا ومهمة خروج تقيس الأثر.']];
const ROLES = ['قائدة المشروع','معلمة مشاركة','باحثة','ملاحِظة درس'];
const myRole = () => (myMember() || {}).role || '';
const isLeader = () => S.canEdit || myRole() === 'قائدة المشروع';
const isResearch = () => isLeader() || myRole() === 'باحثة';
const WHO = [
  ['أثناء الحصة','الملاحِظات في درس البحث','كل الفريق عندما يلاحظن','✓','✓','—','✓'],
  ['خارج الحصة','كل معلمة عن فصلها','—','✓','✓','—','—'],
  ['في الاجتماع','كل عضوة حضرت','—','✓','✓','✓','—'],
  ['بعد الاجتماع (تأمل)','كل معلمة','—','✓','✓','—','—'],
  ['دليل تعلّم طالبة','معلمة الفصل','القائدة للمراجعة','✓','✓','—','—'],
  ['استوديو AI','من استخدمت الذكاء الاصطناعي','الفريق في الاجتماعات 1–6','✓','✓','✓','—'],
  ['نسخ الدروس','المعلمة المنفّذة','من تعيد التصميم','✓','✓','—','—'],
  ['الاجتماعات','القائدة أو موثّقة الاجتماع','—','✓','—','—','—'],
  ['القرارات والمهام','موثّقة الاجتماع','القائدة تعتمد','✓','✓','—','—'],
  ['قياس ممارسات المعلمات','الباحثة أو القائدة','—','✓','—','✓','—'],
  ['المكتبة والمراجع','أي عضوة','الباحثة تتحقق من التوثيق','✓','✓','✓','✓'],
  ['الإعداد ونقل المراحل','القائدة','—','✓','—','—','—'],
  ['التصدير للتحليل','الباحثة أو القائدة','—','✓','—','✓','—']];
const whoBadge = key => { const w = WHO.find(x => x[0] === key); return w ? `<span class="chip plain">يملؤه: ${esc(w[1])}</span>` : ''; };

/* AI chain: Evidence → AI suggestion → Human judgment → Differentiation decision → Outcome */
function chainRows(list) {
  return list.map(a => {
    const dec = D.decisions.find(d => d.code === a.decisionLink) || D.decisions.find(d => d.aiLink === a.code);
    const steps = {ev: a.evidenceRefs || a.studentEvidence || '', ai: (a.aiOutput || '').slice(0, 220), judge: a.decision ? (DEC[a.decision] + (a.reason ? ': ' + a.reason : '')) : '', dec: dec ? dec.code + ' · ' + (dec.decision || '') : '', out: a.observedOutcome || (dec && dec.outcome) || ''};
    return {a, dec, steps, complete: ['ev','ai','judge','dec','out'].every(k => steps[k])};
  });
}
const chainComplete = c => chainRows(inCy(D.ai, c)).filter(r => r.steps.ev && r.steps.ai && r.steps.judge && r.steps.dec).length;
function chainTable(rows) {
  if (!rows.length) return '<div class="empty">لا سجلات ذكاء اصطناعي بعد.</div>';
  const cell = s => s ? esc(s) : '<span class="chip warn">ناقص</span>';
  return `<div class="scroll"><table><thead><tr><th>السجل</th><th>المرحلة</th><th>١ الدليل المجهّل</th><th>٢ مقترح AI</th><th>٣ حكم المعلمة/الفريق</th><th>٤ قرار التمايز</th><th>٥ النتيجة</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.a.code)}</b><div class="tiny muted">${esc(r.a.scope || '')} · ${esc(r.a.author || '')}</div></td><td class="small">${esc(STAGE_NAME[r.a.stage] || '—')}</td><td class="small">${cell(r.steps.ev)}</td><td class="small">${cell(r.steps.ai)}</td><td class="small">${cell(r.steps.judge)}</td><td class="small">${cell(r.steps.dec)}</td><td class="small">${cell(r.steps.out)}</td></tr>`).join('')}</tbody></table></div>`;
}

/* AI page wrapper with tabs */
V.ai = () => {
  const t = S.aiTab || 'studio'; const tabs = [['guide','مساعد بُرهان: متى ولماذا'],['studio','الاستوديو'],['templates','قوالب الأوامر'],['chain','سلسلة الدليل والقرار']];
  let body = '';
  if (t === 'guide') body = `<section class="panel"><h2>الذكاء الاصطناعي جزء من دورة بحث الدرس، لا صفحة جانبية</h2>
    <div class="grid wide">
      <div class="stat" style="gap:6px"><b style="font-size:17px">من يستخدمه؟</b><span style="font-size:14px;color:var(--fg)">الفريق في الاجتماعات المحددة، ومعلمة المادة عند تصميم درسها. والملاحِظات لا يستخدمنه أثناء الحصة.</span></div>
      <div class="stat" style="gap:6px"><b style="font-size:17px">لماذا نستخدمه؟</b><span style="font-size:14px;color:var(--fg)">لتسريع تنظيم الأدلة، وتوسيع البدائل، وكشف ما قد لا نراه. ثم يبقى الحكم للفريق.</span></div>
      <div class="stat" style="gap:6px"><b style="font-size:17px">متى لا نستخدمه؟</b><span style="font-size:14px;color:var(--fg)">أثناء الحصة · قبل أن يحلل الفريق الأدلة بنفسه · لوضع الدرجات النهائية · مع أي اسم أو بيانات تعريفية · لاتخاذ القرار بدلًا منا.</span></div>
      <div class="stat" style="gap:6px"><b style="font-size:17px">ماذا نسجّل؟</b><span style="font-size:14px;color:var(--fg)">الدورة والاجتماع · فردي أم جماعي · الدليل المجهّل · الغرض · الأمر · مخرج AI كما هو · قبول/تعديل/رفض · السبب · التعديل البشري · قرار التمايز المرتبط · نسخة الدرس · النتيجة بعد التطبيق.</span></div>
    </div></section>
    <section class="panel"><h2>البروتوكول الثابت في كل دورة</h2><p class="small muted">القاعدة: تحليل بشري أولًا، ثم الذكاء الاصطناعي، ثم حكم الفريق.</p><div class="scroll"><table><thead><tr><th>الاجتماع</th><th>المرحلة</th><th>متى بالضبط</th><th>من</th><th>الغرض</th><th>قبل/بعد الحصة</th><th>القالب</th></tr></thead><tbody>${AI_PROTOCOL.map(r => `<tr${r[0] === '—' ? ' style="background:var(--amber-soft)"' : ''}>${r.map((x, i) => `<td${i === 0 ? ' style="font-weight:700;white-space:nowrap"' : ''}>${esc(i === 0 && x !== '—' ? 'اجتماع ' + x.slice(1) : x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <div class="ok">التسلسل البحثي: دليل تعلّم ← تحليل بشري ← استخدام AI ← حكم الفريق ← قرار تمايز ← تطبيق ← دليل نتيجة</div>
    <p class="small muted">لا تكتمل الدورة في «دورة بحث الدرس» دون سجل AI قبل الدرس (اجتماع 1–4) وبعده (اجتماع 5)، كلٌّ منهما بحكم بشري مكتوب.</p></section>`;
  if (t === 'templates') body = `<section class="panel"><h2>قوالب أوامر جاهزة</h2><p class="small muted">استبدلي ما بين الأقواس [ ] ببياناتكم المجهّلة. «استخدمي في الاستوديو» يملأ الطلب والمرحلة ونوع الطلب.</p>
    <div class="ledger">${AI_TEMPLATES.map(([k, n, st, mode, txt]) => `<div class="rec"><div class="row between"><div class="row"><b style="font-size:16px">${esc(n)}</b><span class="chip plain">${esc(STAGE_NAME[st])}</span></div><div class="row"><button class="btn small" data-act="tpl-use" data-k="${k}">استخدمي في الاستوديو</button><button class="btn ghost small" data-act="tpl-copy" data-k="${k}">نسخ</button></div></div><div class="out" style="min-height:0">${esc(txt)}</div></div>`).join('')}</div></section>`;
  if (t === 'chain') { const rows = chainRows(bySubj(D.ai).slice().sort(byNewest)); const full = rows.filter(r => r.complete).length;
    body = `<section class="panel"><div class="row between"><h2>الدليل ← مقترح AI ← حكم بشري ← قرار تمايز ← النتيجة</h2><button class="btn ghost small" data-act="go-report" data-t="aichain">التقرير</button></div><p class="small muted">من أقوى الأدلة لسؤال البحث الرابع. السجل المكتمل له خمس حلقات. أكملي الناقص من «عرض النصين وتسجيل الأثر» في الاستوديو، أو اربطي القرار من «القرارات».</p>${subjBar()}<div class="grid"><div class="stat"><b>${rows.length}</b><span>سجل AI</span></div><div class="stat"><b>${full}</b><span>سلسلة مكتملة</span></div><div class="stat"><b>${rows.filter(r => !r.dec).length}</b><span>بلا قرار تمايز مرتبط</span></div><div class="stat"><b>${rows.filter(r => !r.steps.out).length}</b><span>بلا نتيجة بعد التطبيق</span></div></div>${chainTable(rows)}</section>`; }
  if (t === 'studio') body = V.aiStudio();
  return `<div><h1>الذكاء الاصطناعي في بُرهان</h1><p class="lede">الذكاء الاصطناعي يقترح، والفريق يحكم ويقرّر. كل استخدام يُوثَّق بنصّه وحكمه وقراره ونتيجته.</p></div>
  <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button class="tab" role="tab" aria-selected="${k === t}" data-act="ai-tab" data-tab="${k}">${l}</button>`).join('')}</div>${body}`;
};

/* Microsoft 365 package */
const M365_LISTS = [['team','Burhan_Team'],['classes','Burhan_Classes'],['cycles','Burhan_Cycles'],['lessons','Burhan_LessonVersions'],['notes','Burhan_Notes'],['evidence','Burhan_StudentEvidence'],['ai','Burhan_AIUsage'],['decisions','Burhan_Decisions'],['meetings','Burhan_Meetings'],['tasks','Burhan_Tasks'],['practice','Burhan_TeacherPractice'],['instruments','Burhan_Instruments'],['rqs','Burhan_ResearchMap'],['library','Burhan_Library'],['exports','Burhan_ExportLog']];
const M365_COMMON = ['code','studyPhase','cycleId','author','createdAt'];
const M365_CTX = ['subject','classId','className','studentCount','lessonId','lessonCode','lessonTitle','date'];
const M365_SCHEMA = {
  team: ['code','discipline','role','status','joined'],
  classes: ['code','name','count','subject','grade','teacher','classRole','createdAt'],
  cycles: ['code','title','subject','startDate','phase','studyPhase','createdAt'],
  lessons: [...M365_COMMON,'lessonId','version','title','subject','grade','classId','className','studentCount','date','changeNote','decisionId','source','aiRecord',...LESSON_FIELDS.map(f => f[0]),'body'],
  ai: [...M365_COMMON,...M365_CTX,'stage','scope','mode','tool','goal','studentEvidence','evidenceRefs','prompt','aiOutput','teacherFinal','decision','reason','modification','decisionLink','baseLessonId','appliedVersion','diffStats','practices','observedOutcome','reflection'],
  notes: [...M365_COMMON,'context',...M365_CTX,'time','target','moment','level','task','observed','stumble','promptUsed','supportType','response','learningEvidence','kind','text','evidenceRef','meetingId','discussed','proposal','noticed','learned','change','next','openQuestion','practices','files'],
  meetings: [...M365_COMMON,'date','attendees','goal','agenda','evidence','discussion','decisionsSummary','reflection','minutesLink','durationMin','mode'],
  decisions: [...M365_COMMON,'meetingId','subject','date','situation','evidence','alternatives','decision','reason','action','aiLink','participants','status','outcome'],
  evidence: [...M365_COMMON,...M365_CTX,'studentCode','timePoint','evidenceType','supportLevel','explanation','transfer','independence','verification','aiUse','instrument','note','entry','files'],
  tasks: [...M365_COMMON,'title','owner','due','phase','meetingId','status','doneAt'],
  practice: [...M365_COMMON,'teacher','measurePoint','date','instrument',...PRACTICES.map(p => 'score_' + p[0]),'note'],
  instruments: ['code','name','version'],
  rqs: ['code'],
  library: ['code','category','type','title','authors','year','publisher','link','apa','summary','use','rqs','verified','addedBy','createdAt','files'],
  exports: ['code','dataset','filters','rows','deidentified','author','createdAt']};
const M365_NUM = new Set(['count','phase','version','studentCount','explanation','transfer','independence','verification','durationMin','rows','year',...PRACTICES.map(p => 'score_' + p[0])]);
const M365_DATE = new Set(['date','due','startDate','joined','doneAt']);
const M365_CHOICE = new Set(['subject','discipline','role','status','classRole','studyPhase','context','moment','level','supportType','kind','timePoint','evidenceType','supportLevel','decision','stage','scope','mode','tool','measurePoint','aiUse','category','type','source']);
const M365_NOTE = new Set(['observed','stumble','promptUsed','response','learningEvidence','text','discussed','proposal','noticed','learned','change','next','openQuestion','goal','agenda','evidence','discussion','decisionsSummary','reflection','situation','alternatives','reason','action','outcome','prompt','aiOutput','teacherFinal','modification','studentEvidence','observedOutcome','summary','use','apa','note','changeNote','body',...LESSON_FIELDS.map(f => f[0])]);
const M365_LINK = {cycleId:'Burhan_Cycles', classId:'Burhan_Classes', lessonId:'Burhan_LessonVersions', baseLessonId:'Burhan_LessonVersions', appliedVersion:'Burhan_LessonVersions', meetingId:'Burhan_Meetings', decisionId:'Burhan_Decisions', decisionLink:'Burhan_Decisions', aiLink:'Burhan_AIUsage', aiRecord:'Burhan_AIUsage', author:'Burhan_Team', teacher:'Burhan_Team', owner:'Burhan_Team', instrument:'Burhan_Instruments'};
const m365Type = k => k === 'code' ? 'Title (المفتاح)' : (k === 'createdAt' ? 'Date and time' : (M365_NUM.has(k) ? 'Number' : (M365_DATE.has(k) ? 'Date' : (M365_CHOICE.has(k) ? 'Choice' : (M365_NOTE.has(k) ? 'Multiple lines of text' : 'Single line of text')))));
async function exportM365() {
  if (!S.downloads) return; if (typeof JSZip === 'undefined') { toast('تعذّر تحميل أداة الضغط. أعيدي فتح الصفحة.'); return; }
  const zip = new JSZip(); let total = 0; const schema = [];
  M365_LISTS.forEach(([c, name]) => {
    const rows = D[c].map(r => { const o = {}; Object.entries(r).forEach(([k, v]) => { if (k === 'userId' || k === '_id') return; if (c === 'practice' && k === 'scores' && v && typeof v === 'object') { Object.entries(v).forEach(([pk, pv]) => { o['score_' + pk] = pv; }); return; } o[k] = v == null ? '' : (Array.isArray(v) ? v.map(x => typeof x === 'object' ? (x.name || JSON.stringify(x)) : x).join('|') : (typeof v === 'object' ? JSON.stringify(v) : v)); }); if (!o.code) o.code = r._id; return o; });
    const cols = [...new Set([...(M365_SCHEMA[c] || ['code']), ...rows.flatMap(r => Object.keys(r))])];
    zip.file(name + '.csv', csv(rows, cols)); total += rows.length;
    cols.forEach(k => schema.push({List: name, Column: k, SharePointType: m365Type(k), LinksTo: M365_LINK[k] || '', Required: k === 'code' ? 'Yes' : ''}));
  });
  zip.file('Schema_جدول_الأعمدة.csv', csv(schema, ['List','Column','SharePointType','LinksTo','Required']));
  zip.file('README_اقرئيني.txt', 'حزمة بُرهان لـ Microsoft 365 · ' + today() + '\n\n' +
    'المحتوى: ' + M365_LISTS.length + ' ملف CSV، كل ملف = قائمة واحدة في Microsoft Lists، بكل أعمدتها حتى لو كانت فارغة.\n' +
    'Schema_جدول_الأعمدة.csv يبيّن نوع كل عمود في SharePoint وبأي قائمة يرتبط.\n\n' +
    'الخطوات:\n1) أنشئي موقع SharePoint للفريق (أو استخدمي موقع المدرسة) باسم: مشروع بُرهان.\n' +
    '2) في الموقع: جديد ← قائمة ← من CSV، ثم اختاري الملف. كرّري لكل ملف، واجعلي اسم القائمة اسم الملف نفسه.\n' +
    '3) عند المعاينة راجعي نوع كل عمود حسب جدول الأعمدة (رقم، تاريخ، اختيار، نص متعدد الأسطر).\n' +
    '4) عمود code هو المفتاح؛ ضعيه في عمود Title. الربط بين القوائم بالرموز: cycleId, classId, lessonId, meetingId, studentCode, author.\n' +
    '5) في Power Apps: إنشاء ← من SharePoint ← اختاري القائمة (ابدئي بـ Burhan_Notes ثم Burhan_StudentEvidence) فيُبنى تطبيق نماذج تلقائيًا.\n' +
    '6) Power BI أو Excel يقرأ القوائم نفسها للتحليل.\n\n' +
    'الخصوصية: لا أسماء ولا معرّفات حسابات. ملف ربط الأسماء بالرموز يبقى خارج SharePoint عند القائدة.\n');
  try { const blob = await zip.generateAsync({type: 'blob'}); await S.downloads.save({filename: 'Burhan_Microsoft365_' + today() + '.zip', data: blob}); await create('exports', 'X', 3, {dataset: 'Burhan_Microsoft365.zip', filters: 'كل القوائم · كل الأوضاع', rows: total, deidentified: true, author: myCode() || '—', createdAt: new Date().toISOString()}); toast('نُزّلت الحزمة: ' + M365_LISTS.length + ' قائمة، ' + total + ' سجل، مع جدول الأعمدة.'); }
  catch (x) { toast(x && x.code === 'declined' ? 'أُلغي التنزيل.' : 'تعذّر إنشاء الحزمة.'); }
}

/* events */
document.addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]'); if (!b) return; const act = b.dataset.act;
  if (act === 'ai-tab') { S.aiTab = b.dataset.tab; render(); window.scrollTo(0, 0); }
  if (act === 'tpl-copy') { const t = AI_TEMPLATES.find(x => x[0] === b.dataset.k); try { await navigator.clipboard.writeText(t[4]); toast('نُسخ القالب.'); } catch (x) { toast('انسخي القالب يدويًا من المربع.'); } }
  if (act === 'tpl-use') { const t = AI_TEMPLATES.find(x => x[0] === b.dataset.k); S.aiTab = 'studio'; render(); const f = $('#aiForm'); if (f) { f.prompt.value = t[4]; f.stage.value = t[2]; if ([...f.mode.options].some(o => o.value === t[3])) f.mode.value = t[3]; f.prompt.focus(); f.prompt.scrollIntoView({block: 'center'}); S.dirty = true; toast('عبّئي ما بين الأقواس ثم أرسلي.'); } }
  if (act === 'm365') exportM365();
});

/* =========================================================
   6. Render (never re-render under the user's hands)
   ========================================================= */
function renderNavBase() {
  $('#nav').innerHTML = NAV.map(([g, items]) => `<div class="navgroup">${esc(g)}</div>` + items.map(([k, l]) => `<button class="nav" data-act="nav" data-view="${k}"${k === S.view ? ' aria-current="page"' : ''}>${icon(k === 'rec' ? 'rec' : k)}<span>${l}</span></button>`).join('')).join('');
  const me = myMember(); const c = curCycle();
  $('#who').innerHTML = S.err ? esc(S.err) : `${me ? `أنتِ: <b>${esc(me.code)}</b> · ${esc(me.discipline || '')}` : `حسابك غير مرتبط برمز — <button data-act="nav" data-view="setup">اربطيه</button>`}<br>${c ? `الدورة <b>${esc(c.code)}</b> · المرحلة <b>${esc(c.phase)}</b>: ${esc(PHASES[(c.phase || 1) - 1].n)}<br>` : ''}البيانات: <b>${esc(phase())}</b>`;
}
function render() {
  renderNav(); const v = $('#view');
  v.innerHTML = (V[S.view] || V.home)(); S.dirty = false;
  if (S.view === 'ai' && $('#aiSend')) { $('#aiSend').disabled = !S.sample; if (!S.sample) $('#aiStatus').textContent = 'الإرسال المباشر إلى Claude غير متاح هنا؛ استخدمي أداة خارجية والصقي النصين.'; }
  $$('form [data-classfor]').forEach(sel => toggleNewClass(sel));
  showExample(); afterRender();
}
function isBusy() { const a = document.activeElement; return S.dirty || S.aiBusy || (a && a !== document.body && a.closest && a.closest('#view') && /^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName)); }
function softUpdate() {
  renderNav();
  if (!isBusy()) { const y = window.scrollY; render(); window.scrollTo(0, y); return; }
  $$('[data-slot]').forEach(el => { const fn = SLOTS[el.dataset.slot]; if (fn) el.innerHTML = fn(); });
}
let raf = 0; const schedule = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(softUpdate); };
function go(view) { S.view = view; try { localStorage.setItem('burhan.view', view); } catch (x) {} render(); window.scrollTo(0, 0); }

/* =========================================================
   7. Events
   ========================================================= */
function toggleNewClass(sel) { const f = sel.closest('form'); const box = f && f.querySelector('[data-newclass]'); if (box) box.hidden = sel.value !== '__new'; }
function showExample() {
  const f = $('form[data-ctx="in"]'); if (!f) return; const box = f.querySelector('[data-example]'); if (!box) return;
  const s = SUBJ_BY_NAME[(f.querySelector('input[name=subject]:checked') || {}).value];
  box.innerHTML = s ? `<div class="hint" style="background:var(--surface2);padding:8px 12px;border-radius:8px"><b>مثال من ${esc(s.n)}:</b> ${esc(s.obs)}</div>` : '';
}
document.addEventListener('input', e => { if (e.target.closest('#view form')) S.dirty = true; if (e.target.name === 'teacherFinal' || e.target.name === 'aiOutput') updateAiDiff(); });
document.addEventListener('change', e => {
  const t = e.target;
  if (t.closest('#view form')) S.dirty = true;
  if (t.name === 'subject' && t.type === 'radio') { const f = t.closest('form'); const sel = f.querySelector('[data-classfor]'); if (sel) { sel.innerHTML = classOptions(t.value, ''); toggleNewClass(sel); } const li = f.querySelector('#f-lessonTitle'); if (li && SUBJ_BY_NAME[t.value]) li.placeholder = 'مثال: ' + SUBJ_BY_NAME[t.value].ex; showExample(); }
  if (t.matches('[data-classfor]')) toggleNewClass(t);
  if (t.id === 'cmpA' || t.id === 'cmpB') { const a = lessonOf($('#cmpA').value), b = lessonOf($('#cmpB').value); $('#cmpOut').innerHTML = a && b ? (() => { const d = diff(lessonText(a), lessonText(b)); return `<p class="small muted">الأخضر: أُضيف في ${esc(b._id)} · الأحمر: حُذف من ${esc(a._id)}</p><div class="diff">${d.html}</div>`; })() : '<div class="empty">اختاري نسختين.</div>'; }
  if (t.id === 'repCycle') $('#repOut').innerHTML = buildReport(S.repType, t.value);
  if (t.matches('[data-disc]')) { S.db && S.db.collection('team').doc(t.dataset.disc).update({discipline: t.value}).then(() => toast('حُدّث التخصص.')).catch(handleDbErr); }
  if (t.matches('[data-role]')) { S.db && S.db.collection('team').doc(t.dataset.role).update({role: t.value}).then(() => toast('حُدّث الدور.')).catch(handleDbErr); }
  if (t.name === 'decision' && t.form) t.form.dataset.decTouched = '1';
});
let diffT = 0;
function updateAiDiff() { clearTimeout(diffT); diffT = setTimeout(() => { const f = $('#aiForm'); if (!f) return; const a = f.aiOutput.value, b = f.teacherFinal.value; $('#aiDiff').innerHTML = aiDiffHtml(a, b); if (a && b && !f.dataset.decTouched) { const r = f.querySelector(`input[name=decision][value=${suggestDecision(diff(a, b))}]`); if (r) r.checked = true; } }, 350); }
document.addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]'); if (!b) return; const act = b.dataset.act;
  if (act === 'nav') go(b.dataset.view);
  if (act === 'go-rec') { S.recType = b.dataset.t || ''; go('rec'); }
  if (act === 'go-meet') { S.meetTab = b.dataset.t; go('meetings'); }
  if (act === 'go-report') { S.repType = b.dataset.t; go('reports'); }
  if (act === 'subj') { S.subj = b.dataset.s; try { localStorage.setItem('burhan.subj', S.subj); } catch (x) {} const busy = isBusy(); if (busy) { $$('[data-slot]').forEach(el => { const fn = SLOTS[el.dataset.slot]; if (fn) el.innerHTML = fn(); }); $$('[data-act=subj]').forEach(x => { const on = x.dataset.s === S.subj; x.setAttribute('aria-pressed', on); x.style.boxShadow = on && x.dataset.s ? 'inset 0 0 0 2px currentColor' : ''; x.classList.toggle('ghost', !(on && !x.dataset.s) ); }); } else { const y = window.scrollY; render(); window.scrollTo(0, y); } }
  if (act === 'meet-tab') { S.meetTab = b.dataset.tab; render(); }
  if (act === 'res-tab') { S.resTab = b.dataset.tab; render(); }
  if (act === 'pb-tab') { S.pbTab = b.dataset.tab; render(); }
  if (act === 'rep') { S.repType = b.dataset.t; const y = window.scrollY; render(); window.scrollTo(0, y); }
  if (act === 'phase-sel') { S.phaseSel = Number(b.dataset.p); render(); }
  if (act === 'task-toggle') { const t = D.tasks.find(x => x._id === b.dataset.id); if (t) try { await S.db.collection('tasks').doc(t._id).update({status: t.status === 'done' ? 'open' : 'done', doneAt: t.status === 'done' ? '' : today()}); toast(t.status === 'done' ? 'أُعيد فتح المهمة.' : 'أحسنتِ، اكتملت المهمة.'); } catch (x) { handleDbErr(x); } }
  if (act === 'dec-status') { const d = D.decisions.find(x => x._id === b.dataset.id); if (d) try { await S.db.collection('decisions').doc(d._id).update({status: d.status === 'modified' ? 'continued' : 'modified'}); } catch (x) { handleDbErr(x); } }
  if (act === 'link') { try { await S.db.collection('team').doc(b.dataset.id).update({userId: S.uid}); toast('رُبط حسابك بالرمز.'); } catch (x) { handleDbErr(x); } }
  if (act === 'unlink') { const m = myMember(); if (m) try { await S.db.collection('team').doc(m._id).update({userId: ''}); } catch (x) { handleDbErr(x); } }
  if (act === 'phase') { const c = D.cycles.find(x => x._id === b.dataset.id); if (c) { const gaps = phaseGaps(c).filter(g => !g.ok); const p = Math.min(12, Math.max(1, Number(c.phase || 1) + Number(b.dataset.d))); try { await S.db.collection('cycles').doc(c._id).update({phase: p}); S.phaseSel = p; toast(c.code + ': المرحلة ' + p + ' · ' + PHASES[p - 1].n + (Number(b.dataset.d) > 0 && gaps.length ? ` (بقي ${gaps.length} دليل ناقص في المرحلة السابقة)` : '')); } catch (x) { handleDbErr(x); } } }
  if (act === 'ai-compose') { const f = $('#aiForm'); f.prompt.value = composePrompt(Object.assign(formData(f), {})); S.dirty = true; }
  if (act === 'ai-copy') { const f = $('#aiForm'); if (!f.aiOutput.value) { toast('لا يوجد مقترح بعد. أرسلي الطلب أو الصقي مخرج الأداة.'); return; } f.teacherFinal.value = f.aiOutput.value; S.dirty = true; updateAiDiff(); f.teacherFinal.focus(); }
  if (act === 'ai-stop') { if (S.aiAbort) S.aiAbort.abort(); }
  if (act === 'ai-send') sendAi();
  if (act === 'export') exportDs(b.dataset.ds);
  if (act === 'rep-dl') reportDownload();
  if (act === 'rep-copy') { const txt = $('#repOut').innerText; try { await navigator.clipboard.writeText(txt); toast('نُسخ نص التقرير.'); } catch (x) { const r = document.createRange(); r.selectNodeContents($('#repOut')); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('حُدّد النص؛ انسخيه يدويًا.'); } }
});
document.addEventListener('toggle', e => {
  const d = e.target; if (!(d instanceof HTMLDetailsElement) || !d.open || !d.dataset.aiopen) return;
  const a = D.ai.find(x => x._id === d.dataset.aiopen); const host = d.querySelector('[data-diffhost]'); if (!a || !host) return;
  host.innerHTML = `<div class="twin" style="margin-top:10px"><div><h3>ما كتبه الذكاء الاصطناعي</h3><div class="out">${esc(a.aiOutput || '—')}</div></div><div><h3>ما اعتمدته المعلمة</h3><div class="out">${esc(a.teacherFinal || '—')}</div></div></div><h3 style="margin-top:12px">الفروق</h3>${aiDiffHtml(a.aiOutput, a.teacherFinal)}${a.modification ? `<p class="body"><b>ماذا غيّرت ولماذا:</b> ${esc(a.modification)}</p>` : ''}${help('الطلب المرسل', `<div class="out">${esc(a.prompt || '—')}</div>`)}`;
}, true);

async function sendAi() {
  const f = $('#aiForm'); if (!S.sample || S.aiBusy) return;
  if (!f.prompt.value.trim()) f.prompt.value = composePrompt(formData(f));
  S.aiBusy = true; S.dirty = true; S.aiAbort = new AbortController();
  $('#aiSend').disabled = true; $('#aiStop').hidden = false; $('#aiStatus').textContent = 'Claude يفكّر… قد يستغرق دقيقة.'; f.tool.value = 'Claude داخل بُرهان';
  try {
    const r = await S.sample(f.prompt.value, {signal: S.aiAbort.signal, cache: false, onText: ({text}) => { f.aiOutput.value = text; $('#aiStatus').textContent = 'يكتب…'; }});
    f.aiOutput.value = r.text; $('#aiStatus').textContent = r.truncated ? 'انتهى (المخرج مقتطع).' : 'انتهى. اضغطي «ابدئي التحرير من المقترح».';
  } catch (x) {
    if (x && x.text) f.aiOutput.value = x.text;
    const m = {cancelled:'أُوقف الطلب.', not_granted:'لم يُسمح باستخدام Claude هنا؛ استخدمي أداة خارجية والصقي النص.', rate_limited:'طلبات كثيرة الآن؛ انتظري قليلًا.', prompt_too_large:'الطلب طويل جدًا؛ اختصريه.', refused:'اعتذر Claude عن الطلب؛ أعيدي صياغته.'};
    $('#aiStatus').textContent = m[x && x.code] || 'تعذّر الحصول على مقترح. حاولي مرة أخرى.';
    if (x && x.code === 'not_granted') S.sample = null;
  } finally { S.aiBusy = false; S.aiAbort = null; $('#aiSend').disabled = !S.sample; $('#aiStop').hidden = true; updateAiDiff(); }
}

document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault();
  const kind = f.dataset.form; const o = formData(f); const keep = e.submitter && e.submitter.dataset.keep;
  const btns = $$('button[type=submit]', f); btns.forEach(b => { b.disabled = true; });
  let done = null, rerender = true;
  const attachInput = f.querySelector('input[name=attach]'); delete o.attach;
  try {
    if (['note','evidence','ai','lesson','evbulk'].includes(kind)) { if (!o.subject) { toast('اختاري المقرر أولًا.'); return; } if (!(await ctxResolve(o))) return; }
    if (kind === 'note') {
      const ctx = f.dataset.ctx; const rec = base(Object.assign({context: ctx}, o));
      if (!['observed','text','noticed','discussed'].some(k => rec[k])) { toast('اكتبي الملاحظة قبل الحفظ.'); return; }
      rec.files = await uploadFiles(attachInput);
      done = await create('notes', 'N', 4, rec); if (done) { toast(`حُفظت ${done} · ${rec.subject}${rec.className ? ' · الفصل ' + rec.className : ''}`); if (keep) { rerender = false; keepNote(f); } }
    }
    if (kind === 'evidence') {
      o.studentCode = String(o.studentCode || '').toUpperCase().replace(/\s/g, '');
      if (!/^S\d{3,4}$/.test(o.studentCode)) { toast('رمز الطالبة يكون مثل S014.'); return; }
      INDICATORS.forEach(([k]) => { o[k] = o[k] === '' || o[k] == null ? null : Number(o[k]); });
      if (INDICATORS.every(([k]) => o[k] == null)) { toast('أدخلي درجة واحدة على الأقل.'); return; }
      o.files = await uploadFiles(attachInput);
      done = await create('evidence', 'E', 4, base(o));
      if (done) { toast('حُفظ الدليل ' + done + ' للطالبة ' + o.studentCode); if (keep) { rerender = false; ['studentCode','note'].forEach(n => { f[n].value = ''; }); INDICATORS.forEach(([k]) => { f[k].value = ''; }); f.studentCode.focus(); S.dirty = false; } }
    }
    if (kind === 'ai') {
      if (!o.aiOutput && !o.teacherFinal) { toast('أضيفي مخرج الذكاء الاصطناعي أو النسخة المعتمدة.'); return; }
      const d = o.aiOutput && o.teacherFinal ? diff(o.aiOutput, o.teacherFinal) : null;
      const rec = base({stage: o.stage, scope: o.scope, evidenceRefs: o.evidenceRefs, decisionLink: o.decisionLink, mode: o.mode, tool: o.tool, subject: o.subject, grade: o.grade, classId: o.classId, className: o.className, studentCount: o.studentCount, lessonId: o.lessonId, lessonCode: o.lessonCode, lessonTitle: o.lessonTitle, baseLessonId: o.baseLessonId, date: o.date, cycleId: o.cycleId,
        goal: o.goal, studentEvidence: o.studentEvidence, prompt: o.prompt, aiOutput: o.aiOutput, teacherFinal: o.teacherFinal, decision: o.decision || 'modified', reason: o.reason, modification: o.modification, practices: o.practices || [],
        diffStats: d ? {sim: d.sim, kept: d.kept, added: d.added, removed: d.removed} : null, observedOutcome: '', reflection: ''});
      const code = await create('ai', 'AI', 4, rec); done = code;
      if (code && (o.asVersion || []).length && o.teacherFinal) {
        const bl = lessonOf(o.baseLessonId) || lessonOf(o.lessonId);
        const vid = await saveLessonVersion({baseLesson: bl ? bl.lessonId : '', lessonTitle: o.lessonTitle, subject: o.subject, grade: o.grade, classId: o.classId, className: o.className, studentCount: o.studentCount, cycleId: o.cycleId, date: o.date, changeNote: o.modification || (o.mode + ' بمساندة AI')}, {body: o.teacherFinal, aiRecord: code, source: 'ai-assisted'});
        if (vid) await S.db.collection('ai').doc(code).update({appliedVersion: vid});
        toast('حُفظ ' + code + (vid ? ' والنسخة ' + vid : ''));
      } else if (code) toast('حُفظ ' + code);
    }
    if (kind === 'evbulk') { done = await saveBulk(f, o); }
    if (kind === 'lib') {
      if (!o.title) { toast('اكتبي العنوان.'); return; }
      const rec = {category: o.category, type: o.type, title: o.title, authors: o.authors, year: o.year, publisher: o.publisher, link: o.link, apa: o.apa || apaOf(o), summary: o.summary, use: o.use, rqs: o.rqs || [], verified: (o.verified || []).length > 0, addedBy: myCode() || '—', createdAt: new Date().toISOString()};
      rec.files = await uploadFiles(attachInput);
      done = await create('library', 'R', 3, rec); if (done) toast('أُضيف إلى المكتبة: ' + o.title);
    }
    if (kind === 'ai-outcome') { await S.db.collection('ai').doc(f.dataset.id).update({observedOutcome: o.observedOutcome || '', reflection: o.reflection || '', decisionLink: o.decisionLink || ''}); toast('حُفظ الأثر.'); done = 1; }
    if (kind === 'dec-outcome') { await S.db.collection('decisions').doc(f.dataset.id).update({outcome: o.outcome || ''}); toast('حُفظت النتيجة.'); done = 1; }
    if (kind === 'lesson') { const id = await saveLessonVersion(o); if (id) toast('حُفظت ' + id); done = id; }
    if (kind === 'meeting') { done = await create('meetings', 'M', 2, base(o)); if (done) toast('حُفظ الاجتماع ' + done + '. سجّلي قراراته ومهامه من التبويبين المجاورين.'); }
    if (kind === 'decision') { done = await create('decisions', 'D', 4, base(Object.assign(o, {status: 'continued', outcome: ''}))); if (done) toast('حُفظ القرار ' + done); }
    if (kind === 'task') { done = await create('tasks', 'K', 3, base(Object.assign(o, {phase: Number(o.phase) || null, status: 'open'}))); if (done) toast('أُضيفت المهمة ' + done); }
    if (kind === 'practice') { const scores = {}; PRACTICES.forEach(([k]) => { if (o['p_' + k]) scores[k] = Number(o['p_' + k]); delete o['p_' + k]; }); done = await create('practice', 'TP', 3, base(Object.assign(o, {scores}))); if (done) toast('حُفظ القياس ' + done); }
    if (kind === 'settings') { await S.db.doc('config/project').set(Object.assign({}, D.settings, o, {updatedAt: new Date().toISOString()})); toast('حُفظت الإعدادات.'); done = 1; }
    if (kind === 'member') { const code = await nextCode('team', 'T', 2); await S.db.collection('team').doc(code).set({code, discipline: o.discipline, role: o.role, status: 'نشطة', joined: today(), userId: ''}); toast('أُضيفت ' + code); done = code; }
    if (kind === 'class') { done = await create('classes', 'CL', 2, {name: o.name, count: Number(o.count) || null, subject: o.subject, grade: o.grade, teacher: o.teacher, classRole: o.classRole || 'intervention', createdAt: new Date().toISOString()}); if (done) toast('أُضيف الفصل ' + o.name); }
    if (kind === 'cycle') { done = await create('cycles', 'C', 2, {title: o.title, subject: o.subject, startDate: o.startDate, phase: 1, studyPhase: o.cyPhase || phase(), createdAt: new Date().toISOString()}); if (done) { await S.db.doc('config/project').set(Object.assign({}, D.settings, {currentCycle: done})); toast('أُنشئت الدورة ' + done + ' وأصبحت الدورة الحالية.'); } }
  } catch (x) { handleDbErr(x); }
  finally { btns.forEach(b => { b.disabled = false; }); }
  if (done) { rememberCtx(o, kind); dropDraft(f); }
  if (done && rerender) { S.dirty = false; if (document.activeElement) document.activeElement.blur(); const y = window.scrollY; render(); window.scrollTo(0, y); }
});

/* =========================================================
   8. Downloads: reports and CSV
   ========================================================= */
async function reportDownload() {
  if (!S.downloads) return; const r = REPORTS.find(x => x[0] === S.repType);
  const css = 'body{font-family:"IBM Plex Sans Arabic",Tahoma,sans-serif;max-width:900px;margin:32px auto;padding:0 20px;color:#17292B;line-height:1.8}h2{font-size:26px;margin:0 0 6px}h3{font-size:18px;border-bottom:2px solid #DDEDEA;padding-bottom:4px;margin-top:24px}table{border-collapse:collapse;width:100%;font-size:14px;margin:8px 0}th,td{border:1px solid #D6DED9;padding:6px 8px;text-align:right;vertical-align:top}th{background:#EBF0EC}.rmeta{display:flex;flex-wrap:wrap;gap:4px 16px;color:#4F6164;font-size:14px}.chip{padding:1px 8px;border-radius:999px;background:#EBF0EC;font-size:13px}dl{display:grid;grid-template-columns:170px 1fr;gap:4px 12px}dt{color:#4F6164}dd{margin:0}.muted,.tiny{color:#4F6164;font-size:13px}';
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>${esc(r[1])}</title><style>${css}</style></head><body>${$('#repOut').innerHTML}</body></html>`;
  try { await S.downloads.save({filename: r[1].replace(/\s+/g, '_') + '_' + today() + '.html', data: html}); toast('نُزّل التقرير.'); } catch (x) { toast(x && x.code === 'declined' ? 'أُلغي التنزيل.' : 'تعذّر التنزيل في هذا العرض.'); }
}
function csv(rows, cols) { const q = v => { const s = v == null ? '' : (Array.isArray(v) ? v.join('|') : String(v)); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }; return '﻿' + [cols.join(','), ...rows.map(r => cols.map(c => q(r[c])).join(','))].join('\r\n'); }
function summaryOf(r) { return r.observed || r.text || r.noticed || r.discussed || r.decision || r.goal || r.changeNote || ''; }
function buildDs(ds, ph, cy, sj) {
  const keep = r => (r.studyPhase || 'Pilot') === ph && (!cy || r.cycleId === cy) && (!sj || !r.subject || r.subject === sj);
  if (ds === 'Student_Evidence_Long') { const rows = []; D.evidence.filter(keep).forEach(e => INDICATORS.forEach(([k, l]) => { if (e[k] != null) rows.push({StudyPhase: e.studyPhase, EvidenceID: e.code, StudentID: e.studentCode, TeacherID: e.author, CycleID: e.cycleId, Subject: e.subject, ClassID: e.classId, ClassName: e.className, ClassSize: e.studentCount, ClassRole: (D.classes.find(x => x.code === e.classId) || {}).classRole || 'intervention', LessonID: e.lessonCode, LessonTitle: e.lessonTitle, TimePoint: e.timePoint, EvidenceType: e.evidenceType, Indicator: k, IndicatorAr: l, Score: e[k], SupportLevel: e.supportLevel, AIUse: e.aiUse, InstrumentVersion: e.instrument, Date: e.date}); })); return [rows, ['StudyPhase','EvidenceID','StudentID','TeacherID','CycleID','Subject','ClassID','ClassName','ClassSize','ClassRole','LessonID','LessonTitle','TimePoint','EvidenceType','Indicator','IndicatorAr','Score','SupportLevel','AIUse','InstrumentVersion','Date']]; }
  if (ds === 'Teacher_Practice_Long') { const rows = []; D.practice.filter(keep).forEach(p => Object.entries(p.scores || {}).forEach(([k, v]) => rows.push({StudyPhase: p.studyPhase, PracticeID: p.code, TeacherID: p.teacher, Subject: (D.team.find(m => m.code === p.teacher) || {}).discipline, MeasurePoint: p.measurePoint, Indicator: k, IndicatorAr: PRACTICE_NAME[k], Score: v, RaterID: p.author, InstrumentVersion: p.instrument, Date: p.date}))); return [rows, ['StudyPhase','PracticeID','TeacherID','Subject','MeasurePoint','Indicator','IndicatorAr','Score','RaterID','InstrumentVersion','Date']]; }
  if (ds === 'AI_Decision_Log') return [D.ai.filter(keep).map(a => ({StudyPhase: a.studyPhase, AIRecordID: a.code, CycleID: a.cycleId, TeacherID: a.author, Subject: a.subject, Date: a.date, ToolUsed: a.tool, Purpose: a.mode, ClassName: a.className, ClassSize: a.studentCount, LessonTitle: a.lessonTitle, Prompt: a.prompt, AIOutput: a.aiOutput, TeacherFinal: a.teacherFinal, Decision: a.decision, Reason: a.reason, ModificationMade: a.modification, RetainedPct: a.diffStats && a.diffStats.sim, WordsAdded: a.diffStats && a.diffStats.added, WordsRemoved: a.diffStats && a.diffStats.removed, Practices: a.practices, AppliedInLesson: a.appliedVersion, ObservedOutcome: a.observedOutcome, Reflection: a.reflection})), ['StudyPhase','AIRecordID','CycleID','TeacherID','Subject','Date','ToolUsed','Purpose','ClassName','ClassSize','LessonTitle','Prompt','AIOutput','TeacherFinal','Decision','Reason','ModificationMade','RetainedPct','WordsAdded','WordsRemoved','Practices','AppliedInLesson','ObservedOutcome','Reflection']];
  if (ds === 'Notes_Qualitative') { const cols = ['StudyPhase','NoteID','Context','CycleID','MeetingID','TeacherID','Subject','Date','Time','ClassName','ClassSize','LessonTitle','Target','Moment','StudentLevel','Task','Observed','Stumble','PromptUsed','SupportType','Response','LearningEvidence','Kind','Text','Discussed','Proposal','Noticed','Learned','PracticeChanged','Evidence','Next','OpenQuestion','Practices']; return [D.notes.filter(keep).map(n => ({StudyPhase: n.studyPhase, NoteID: n.code, Context: n.context, CycleID: n.cycleId, MeetingID: n.meetingId, TeacherID: n.author, Subject: n.subject, Date: n.date, Time: n.time, ClassName: n.className, ClassSize: n.studentCount, LessonTitle: n.lessonTitle, Target: n.target, Moment: n.moment, StudentLevel: n.level, Task: n.task, Observed: n.observed, Stumble: n.stumble, PromptUsed: n.promptUsed, SupportType: n.supportType, Response: n.response, LearningEvidence: n.learningEvidence, Kind: n.kind, Text: n.text, Discussed: n.discussed, Proposal: n.proposal, Noticed: n.noticed, Learned: n.learned, PracticeChanged: n.change, Evidence: n.evidenceRef, Next: n.next, OpenQuestion: n.openQuestion, Practices: n.practices})), cols]; }
  if (ds === 'Decisions_Log') return [D.decisions.filter(keep).map(d => ({StudyPhase: d.studyPhase, DecisionID: d.code, CycleID: d.cycleId, MeetingID: d.meetingId, Subject: d.subject, Date: d.date, Situation: d.situation, Evidence: d.evidence, Alternatives: d.alternatives, Decision: d.decision, Reason: d.reason, Action: d.action, Participants: d.participants, Outcome: d.outcome, Status: d.status})), ['StudyPhase','DecisionID','CycleID','MeetingID','Subject','Date','Situation','Evidence','Alternatives','Decision','Reason','Action','Participants','Outcome','Status']];
  if (ds === 'Lesson_Versions') return [D.lessons.filter(keep).map(l => ({StudyPhase: l.studyPhase, LessonID: l.lessonId, Version: l.version, LessonVersionID: l._id, CycleID: l.cycleId, Subject: l.subject, Grade: l.grade, ClassName: l.className, ClassSize: l.studentCount, Title: l.title, Source: l.source || 'teacher', AIRecordID: l.aiRecord, DecisionID: l.decisionId, ChangeNote: l.changeNote, Date: l.date, Text: lessonText(l)})), ['StudyPhase','LessonID','Version','LessonVersionID','CycleID','Subject','Grade','ClassName','ClassSize','Title','Source','AIRecordID','DecisionID','ChangeNote','Date','Text']];
  if (ds === 'Process_Timeline') { const ev = []; const add = (arr, type) => arr.filter(keep).forEach(r => ev.push({Date: dateOf(r), Type: typeof type === 'function' ? type(r) : type, RecordID: r.code || r._id, CycleID: r.cycleId, Subject: r.subject, TeacherID: r.author, Summary: summaryOf(r)})); add(D.notes, r => 'Note:' + r.context); add(D.ai, 'AI'); add(D.decisions, 'Decision'); add(D.meetings, 'Meeting'); add(D.lessons, 'LessonVersion'); add(D.evidence, 'Evidence'); ev.sort((a, b) => String(a.Date).localeCompare(String(b.Date))); return [ev, ['Date','Type','RecordID','CycleID','Subject','TeacherID','Summary']]; }
  return [[], []];
}
async function exportDs(ds) {
  if (!S.downloads) return; const ph = $('#exPhase').value, cy = $('#exCycle').value, sj = $('#exSubj').value;
  const [rows, cols] = buildDs(ds, ph, cy, sj);
  if (!rows.length) { toast('لا صفوف لهذا الملف بالمرشحات المختارة.'); return; }
  const name = ds + '_' + ph + (cy ? '_' + cy : '') + '_' + today() + '.csv';
  try { await S.downloads.save({filename: name, data: csv(rows, cols)}); await create('exports', 'X', 3, {dataset: name, filters: ph + ' · ' + (cy || 'كل الدورات') + ' · ' + (sj || 'كل المقررات'), rows: rows.length, deidentified: true, author: myCode() || '—', createdAt: new Date().toISOString()}); toast('صُدّر ' + rows.length + ' صفًا وسُجّل التصدير.'); }
  catch (x) { toast(x && x.code === 'declined' ? 'أُلغي التنزيل.' : 'تعذّر التنزيل في هذا العرض.'); }
}

/* =========================================================
   8b. UX layer: role-aware guidance, remembered context, quick entry,
       drafts, whole-class evidence, live meeting mode, phone navigation
   ========================================================= */
const MEMBER_HIDE = new Set(['analysis', 'reports', 'research']);
const QBAR = [['home', 'الآن', 'home'], ['rec', 'سجّلي', 'rec'], ['in', 'ملاحظة حصة', 'eye'], ['meetings', 'الاجتماع', 'meetings']];
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2); };
const store = {
  get(k, d) { try { const v = localStorage.getItem('burhan.' + k); return v ? JSON.parse(v) : d; } catch (x) { return d; } },
  set(k, v) { try { localStorage.setItem('burhan.' + k, JSON.stringify(v)); } catch (x) {} },
  del(k) { try { localStorage.removeItem('burhan.' + k); } catch (x) {} }
};

/* ---- Navigation: fewer sections for team members, phone menu and bottom bar ---- */
function renderNav() {
  renderNavBase();
  if (window.burhanSignOut && !$('#who .signout')) $('#who').insertAdjacentHTML('beforeend', '<br><button class="signout" type="button" onclick="burhanSignOut()">تسجيل الخروج</button>');
  if (!isResearch()) $$('#nav .nav').forEach(b => { if (MEMBER_HIDE.has(b.dataset.view) && b.dataset.view !== S.view) b.hidden = true; });
  $$('#nav .navgroup').forEach(g => { let n = g.nextElementSibling, any = false; while (n && !n.classList.contains('navgroup')) { if (!n.hidden) any = true; n = n.nextElementSibling; } g.hidden = !any; });
  const qb = $('#qbar');
  if (qb) qb.innerHTML = QBAR.map(([k, l, ic]) => { const on = k === 'in' ? (S.view === 'rec' && S.recType === 'in') : (S.view === k && !(k === 'rec' && S.recType === 'in')); return `<button type="button" data-act="${k === 'in' || k === 'rec' ? 'go-rec' : 'nav'}" data-view="${k}" data-t="${k === 'in' ? 'in' : ''}"${on ? ' aria-current="page"' : ''}>${icon(ic)}<span>${l}</span></button>`; }).join('') + `<button type="button" data-act="menu">${icon('playbook')}<span>المزيد</span></button>`;
}

/* ---- Remembered context: subject, class, lesson, cycle ---- */
function memCtx() {
  const m = store.get('ctx', {});
  if (!m.subject && mySubject()) m.subject = mySubject();
  if (!m.classId) { const cl = D.classes.find(c => c.teacher === myCode() && (!m.subject || c.subject === m.subject)); if (cl) m.classId = cl.code; }
  if (m.classId && !D.classes.find(c => c.code === m.classId)) delete m.classId;
  if (m.cycleId && !D.cycles.find(c => c.code === m.cycleId)) delete m.cycleId;
  return m;
}
function rememberCtx(o, kind) {
  if (!['note', 'evidence', 'ai', 'lesson', 'evbulk'].includes(kind) || !o || !o.subject) return;
  store.set('ctx', {subject: o.subject, classId: o.classId || '', lessonTitle: o.lessonTitle || '', cycleId: o.cycleId || ''});
}
function ctxBlock(n, pre = {}) {
  const m = memCtx(); const p = Object.assign({}, pre);
  const fresh = !pre.subject && !pre.classId;
  if (fresh) ['subject', 'classId', 'lessonTitle', 'cycleId'].forEach(k => { if (!p[k] && m[k]) p[k] = m[k]; });
  const full = ctxBlockFull(n, p);
  const cl = D.classes.find(c => c.code === p.classId && c.subject === p.subject);
  if (!fresh || !cl) return full;
  const cy = D.cycles.find(c => c.code === (p.cycleId || (curCycle() || {}).code));
  return `<section class="stepsec" data-ctxwrap>${stepHead(n, 'السياق', 'محفوظ من آخر تسجيل لكِ. إن تغيّر الفصل أو الدرس اضغطي «تغيير».')}
  <div class="ctxbar" data-ctxbar>${subjChip(p.subject)}<span>الفصل <b>${esc(cl.name)}</b> · ${esc(cl.count || '؟')} طالبة</span>${p.lessonTitle ? `<span class="sep">|</span><span>الدرس: <b>${esc(p.lessonTitle)}</b></span>` : '<span class="sep">|</span><span class="muted">بلا اسم درس</span>'}${cy ? `<span class="sep">|</span><span>${esc(cy.code)}</span>` : ''}<span class="sep">|</span><span>${esc(fmtDate(today()))}</span><button type="button" class="btn ghost small" data-act="ctx-open">تغيير</button></div>
  <div data-ctxfull hidden>${full}</div></section>`;
}

/* ---- In-class quick observation ---- */
const MOMENTS = ['فهمت وفسّرت', 'تعثّرت', 'احتاجت دعمًا', 'نقلت التعلّم', 'سؤال أو فكرة لافتة'];
const SUPPORTS = ['بلا دعم', 'تلميح لفظي', 'بطاقة دعم مكتوبة', 'مثال محلول جزئيًا', 'دعم الأقران', 'أداة رقمية'];
const chipRadios = (name, list, sel) => `<div class="chips" role="radiogroup">${list.map(v => { const [val, lab] = Array.isArray(v) ? v : [v, v]; return `<label><input type="radio" name="${name}" value="${esc(val)}"${val === sel ? ' checked' : ''}>${esc(lab)}</label>`; }).join('')}</div>`;
function recentTargets() {
  const m = memCtx(); const seen = [];
  D.notes.filter(n => n.context === 'in' && n.target && (!m.classId || n.classId === m.classId)).sort(byNewest).forEach(n => { const t = String(n.target).trim(); if (t && !seen.includes(t) && seen.length < 8) seen.push(t); });
  return seen;
}
function inBody() {
  const rec = recentTargets(); const groups = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6'];
  return `<section class="stepsec">${stepHead(2, 'ماذا لاحظتِ؟', 'ثلاثة أشياء فقط: من؟ ماذا حدث؟ أي دعم؟ اكتبي ما رأيتِه كما حدث، عن الطالبة لا عن المعلمة.')}
  <div class="row between"><span class="small muted">بعد الحفظ يبقى الفصل والدرس كما هما، وتُفرَّغ الملاحظة لتكتبي التالية.</span><span class="counter" id="inCount"${S.inCount ? '' : ' hidden'}>${S.inCount || 0} ملاحظة في هذه الحصة</span></div>
  ${field('الطالبة أو المجموعة', inp('target', '', 'required placeholder="S014 أو G2" autocomplete="off" inputmode="latin" style="max-width:260px"'), 'رمز فقط، بلا اسم. أو اضغطي اختصارًا:')}
  <div class="chips">${groups.concat(rec.filter(r => !groups.includes(r))).map(g => `<button type="button" class="c" data-act="fill" data-name="target" data-v="${esc(g)}">${esc(g)}</button>`).join('')}</div>
  <div><div class="hint" style="margin-bottom:6px">ما نوع اللحظة؟</div>${chipRadios('moment', MOMENTS, '')}</div>
  ${field('ماذا قالت أو فعلت؟', area('observed', '', 'required rows="3" placeholder="اكتبي الكلام أو الفعل كما حدث"'))}
  <div data-example></div>
  <div><div class="hint" style="margin-bottom:6px">الدعم المقدَّم</div>${chipRadios('supportType', SUPPORTS, 'بلا دعم')}</div>
  <div><div class="hint" style="margin-bottom:6px">مستواها في خط الأساس <span class="opt">(اختياري، يساعد على معرفة هل الدعم المصمَّم لمستواها نجح)</span></div>${chipRadios('level', [['أ', 'أ · تحتاج دعمًا'], ['ب', 'ب · متوسطة'], ['ج', 'ج · متقدمة']], '')}</div>
  <details class="more"><summary>تفاصيل أكثر (اختياري): الوقت، المهمة، التعثّر، الاستجابة</summary>
    <div class="grid">${field('الوقت', inp('time', nowTime(), 'type="time"'))}${field('المهمة', inp('task', '', 'placeholder="مثال: مهمة النقل 2"'))}</div>
    <div class="grid wide">${field('أين تعثّرت؟', area('stumble', '', 'placeholder="اتركيه فارغًا إن لم يحدث تعثّر"'))}${field('ما التلميح أو الدعم بالضبط؟', area('promptUsed', '', 'placeholder="مثال: ماذا يحدث للسرعة كل ثانية؟"'))}${field('كيف استجابت بعد الدعم؟', area('response'))}${field('ما الدليل على أنها تعلّمت؟', area('learningEvidence', '', 'placeholder="مثال: فسّرت المنحنى الجديد دون مساعدة"'))}</div>
  </details></section>`;
}
const practiceOpt = n => `<details class="more"><summary>الممارسات المهنية التي ظهرت (اختياري)</summary><p class="small muted">نتتبّع بها نمو الممارسة عبر الدورات. اختاري ما ينطبق فقط.</p>${checks('practices', PRACTICES, [])}</details>`;
function noteButtons(t) {
  const who = `<span class="small muted">يُحفظ برمزك ${esc(myCode() || '— اربطي حسابك من الصفحة الرئيسة')} · ${esc(phase())}</span>`;
  if (t === 'in' || t === 'out') return `<div class="row"><button class="btn bigbtn" type="submit" data-keep="1">حفظ وتسجيل ${t === 'in' ? 'ملاحظة' : 'تدوين'} أخرى</button><button class="btn ghost" type="submit">حفظ وإنهاء</button>${who}</div>`;
  return `<div class="row"><button class="btn bigbtn" type="submit">حفظ</button>${who}</div>`;
}
function keepNote(f) {
  ['target', 'observed', 'stumble', 'promptUsed', 'response', 'learningEvidence', 'task', 'text', 'evidenceRef'].forEach(n => { if (f[n]) f[n].value = ''; });
  $$('input[name=moment],input[name=level]', f).forEach(r => { r.checked = false; });
  const sp = f.querySelector('input[name=supportType][value="بلا دعم"]'); if (sp) sp.checked = true;
  if (f.time) f.time.value = nowTime();
  S.inCount = (S.inCount || 0) + 1; const c = $('#inCount'); if (c) { c.hidden = false; c.textContent = S.inCount + (f.dataset.ctx === 'in' ? ' ملاحظة في هذه الحصة' : ' تدوين في هذه الجلسة'); }
  dropDraft(f); S.dirty = false;
  const first = f.target || f.text; if (first) first.focus();
}

/* ---- Drafts: nothing typed is lost ---- */
const DRAFT_SKIP = new Set(['dec-outcome', 'ai-outcome', 'settings', 'member', 'class', 'cycle']);
const draftKey = f => f && f.dataset.form && !DRAFT_SKIP.has(f.dataset.form) ? 'draft.' + f.dataset.form + (f.dataset.ctx || '') : null;
function readForm(f) { const o = {}; $$('input,select,textarea', f).forEach(el => { if (!el.name || el.type === 'file' || el.type === 'submit') return; if (el.type === 'radio') { if (el.checked) o[el.name] = el.value; } else if (el.type === 'checkbox') { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.value; }); return o; }
let draftT = 0;
function saveDraft(f) { const k = draftKey(f); if (!k) return; clearTimeout(draftT); draftT = setTimeout(() => store.set(k, {t: nowTime(), d: today(), v: readForm(f)}), 400); }
function dropDraft(f) { const k = draftKey(f); if (k) { clearTimeout(draftT); store.del(k); } const bar = f && f.querySelector('[data-draftbar]'); if (bar) bar.remove(); }
function restoreDraft(f) {
  const k = draftKey(f); const dr = k && store.get(k); if (!dr) return;
  const w = f.querySelector('[data-ctxwrap]'); if (w) { const full = w.querySelector('[data-ctxfull]'); const bar = w.querySelector('[data-ctxbar]'); if (full) full.hidden = false; if (bar) bar.hidden = true; }
  if (dr.v.subject) { const r = f.querySelector(`input[name=subject][value="${CSS.escape(dr.v.subject)}"]`); if (r) r.checked = true; const sel = f.querySelector('[data-classfor]'); if (sel) sel.innerHTML = classOptions(dr.v.subject, dr.v.classId); }
  Object.entries(dr.v).forEach(([n, v]) => { $$(`[name="${CSS.escape(n)}"]`, f).forEach(el => { if (el.type === 'radio') el.checked = el.value === v; else if (el.type === 'checkbox') el.checked = Array.isArray(v) && v.includes(el.value); else el.value = v; }); });
  $$('form [data-classfor]').forEach(sel => toggleNewClass(sel));
  const det = f.querySelector('details.more'); if (det && ['stumble', 'promptUsed', 'response', 'learningEvidence', 'task'].some(n => dr.v[n])) det.open = true;
  S.dirty = true; if (f.id === 'aiForm') updateAiDiff();
}
function draftBars() {
  $$('#view form[data-form]').forEach(f => {
    const k = draftKey(f); const dr = k && store.get(k);
    if (!dr || !Object.values(dr.v).some(v => Array.isArray(v) ? v.length : String(v || '').trim() && !/^(\d{4}-\d{2}-\d{2}|\d{2}:\d{2}|بلا دعم|C\d+)$/.test(v))) return;
    if (f.querySelector('[data-draftbar]')) return;
    f.insertAdjacentHTML('afterbegin', `<div class="draftbar" data-draftbar>لديكِ مسودة غير محفوظة (${esc(dr.d === today() ? 'اليوم' : fmtDate(dr.d))} ${esc(dr.t)})<button type="button" class="btn small" data-act="draft-restore">استعادتها</button><button type="button" class="btn ghost small" data-act="draft-drop">تجاهلها</button></div>`);
  });
}

/* ---- Whole-class evidence entry ---- */
const evTabs = () => `<div class="tabs" role="tablist"><button class="tab" role="tab" aria-selected="${S.evMode !== 'class'}" data-act="ev-mode" data-m="one">طالبة واحدة</button><button class="tab" role="tab" aria-selected="${S.evMode === 'class'}" data-act="ev-mode" data-m="class">الفصل كاملًا (جدول)</button></div>`;
function bulkCodes() {
  if (S.bulkCodes && S.bulkCodes.length) return S.bulkCodes;
  const m = memCtx(); const cl = D.classes.find(c => c.code === m.classId);
  const known = [...new Set(D.evidence.filter(e => cl && e.classId === cl.code).map(e => e.studentCode))].sort();
  if (known.length) return known;
  const used = D.evidence.map(e => parseInt(String(e.studentCode || '').replace(/\D/g, ''), 10)).filter(n => n > 0); const start = used.length ? Math.max(...used) + 1 : 1;
  return Array.from({length: Math.min(60, Number(cl && cl.count) || 25)}, (_, i) => 'S' + pad(start + i, 3));
}
function evidenceBulk() {
  const codes = bulkCodes(); const tp = store.get('lastTP', 'Baseline');
  const sc = (code, k) => `<input name="b_${code}_${k}" inputmode="numeric" maxlength="1" autocomplete="off" aria-label="${esc(code)} ${esc(indName(k))}" data-score>`;
  return `<div class="row"><button class="btn ghost small" data-act="go-rec" data-t="">→ كل أنواع التسجيل</button></div>
  <div><h1>دليل تعلّم: الفصل كاملًا</h1><p class="lede">أدخلي درجات فصلك في جدول واحد بعد تصحيح المهمة. صف لكل طالبة، ودرجة من 0 إلى 4 لكل مؤشر. اتركي خانة فارغة إن لم يُقَس المؤشر، وصف الطالبة الغائبة فارغًا كله.</p></div>
  ${evTabs()}
  <form class="panel" data-form="evbulk">${ctxBlock(1)}
    <section class="stepsec">${stepHead(2, 'القياس', 'يُطبَّق على كل صفوف الجدول.')}
      <div><div class="hint" style="margin-bottom:6px">نقطة القياس</div>${chipRadios('timePoint', TIMEPOINTS, tp)}</div>
      <div class="grid">${field('نوع الدليل', `<select name="evidenceType" id="f-evidenceType">${opts(['بطاقة خروج', 'منتج طالبة', 'إجابة شفهية', 'مهمة نقل', 'مهمة خط أساس/بعدية'], store.get('lastEvType', ''))}</select>`)}${field('الأداة وإصدارها', `<select name="instrument" id="f-instrument">${opts(D.instruments.map(i => [i.code + '-' + i.version, i.code + ' ' + i.name + ' ' + i.version]), 'INS02-v0.1')}</select>`)}</div></section>
    <section class="stepsec">${stepHead(3, 'الدرجات', 'اكتبي رقمًا ثم Enter للانتقال للخانة التالية. الخانة الحمراء ليست بين 0 و4.')}
      <div class="row small"><span class="muted">رموز الطالبات:</span>من <input id="bFrom" value="${esc(codes[0] || 'S001')}" style="width:90px;min-height:38px" aria-label="من رمز"> إلى <input id="bTo" value="${esc(codes[codes.length - 1] || 'S025')}" style="width:90px;min-height:38px" aria-label="إلى رمز"><button type="button" class="btn ghost small" data-act="bulk-rows">تحديث الصفوف</button><span class="muted">${codes.length} طالبة</span></div><p class="tiny muted">الرموز ثابتة لكل طالبة طوال الدراسة، ومأخوذة من ملف الربط الذي تحتفظ به القائدة خارج المنصة. لا تكرري رموز فصل آخر.</p>
      ${help('مقياس 0–4: تذكير سريع', `<ul><li><b>0</b> لا يظهر · <b>1</b> بداية · <b>2</b> جزئي أو بدعم كبير · <b>3</b> واضح مع نقص بسيط · <b>4</b> متمكّن مستقل ومبرَّر</li></ul>`)}
      <div class="scroll"><table class="bulk"><thead><tr><th>الطالبة</th>${INDICATORS.map(([k, l]) => `<th>${esc(l)}</th>`).join('')}<th>الدعم الذي احتاجته</th></tr></thead><tbody>${codes.map(c => `<tr data-row="${esc(c)}"><td>${esc(c)}</td>${INDICATORS.map(([k]) => `<td>${sc(c, k)}</td>`).join('')}<td><select name="b_${esc(c)}_support" aria-label="دعم ${esc(c)}" style="min-height:40px">${opts(['بلا دعم', 'دعم 1: تلميح', 'دعم 2: بطاقة موجّهة', 'دعم 3: مثال محلول'])}</select></td></tr>`).join('')}</tbody></table></div>
    </section>
    <div class="row"><button class="btn bigbtn" type="submit" id="bulkSave">حفظ درجات الفصل</button><span class="small muted" id="bulkInfo">لم تُدخل درجات بعد.</span></div></form>`;
}
function bulkInfo() {
  const f = $('form[data-form=evbulk]'); if (!f) return; let n = 0, bad = 0;
  $$('tr[data-row]', f).forEach(tr => { const ins = $$('input[data-score]', tr); const any = ins.some(i => i.value !== ''); tr.classList.toggle('filled', any); if (any) n++; ins.forEach(i => { const ok = i.value === '' || /^[0-4]$/.test(i.value); i.classList.toggle('bad', !ok); if (!ok) bad++; }); });
  $('#bulkInfo').textContent = bad ? `${bad} خانة غير صحيحة (المسموح 0 إلى 4).` : (n ? `جاهز لحفظ ${n} طالبة.` : 'لم تُدخل درجات بعد.');
  $('#bulkSave').textContent = n ? `حفظ درجات ${n} طالبة` : 'حفظ درجات الفصل';
}
async function createMany(coll, prefix, width, list) {
  if (!S.db || !list.length) return [];
  const first = await nextCode(coll, prefix, width); let n = parseInt(first.slice(prefix.length), 10) || 1; const out = [];
  for (const data of list) {
    let code = prefix + pad(n, width);
    for (let i = 0; i < 20; i++) { const snap = await S.db.collection(coll).doc(code).get(); if (!snap.exists) break; n++; code = prefix + pad(n, width); }
    await S.db.collection(coll).doc(code).set(Object.assign({code}, data)); out.push(code); n++;
  }
  return out;
}
async function saveBulk(f, o) {
  const rows = []; let bad = 0;
  $$('tr[data-row]', f).forEach(tr => {
    const code = tr.dataset.row; const r = {studentCode: code}; let any = false;
    INDICATORS.forEach(([k]) => { const v = (o['b_' + code + '_' + k] || '').trim(); if (v === '') r[k] = null; else if (/^[0-4]$/.test(v)) { r[k] = Number(v); any = true; } else bad++; });
    r.supportLevel = o['b_' + code + '_support'] || 'بلا دعم';
    if (any) rows.push(r);
  });
  if (bad) { toast('صحّحي الخانات الحمراء أولًا: الدرجة من 0 إلى 4.'); return null; }
  if (!rows.length) { toast('لا درجات للحفظ بعد.'); return null; }
  const common = {subject: o.subject, classId: o.classId, className: o.className, studentCount: o.studentCount, lessonId: o.lessonId, lessonCode: o.lessonCode, lessonTitle: o.lessonTitle, cycleId: o.cycleId, date: o.date, timePoint: o.timePoint || 'Baseline', evidenceType: o.evidenceType, instrument: o.instrument, aiUse: 'لا', note: '', files: [], entry: 'class-table'};
  store.set('lastTP', common.timePoint); store.set('lastEvType', common.evidenceType || '');
  try {
    const codes = await createMany('evidence', 'E', 4, rows.map(r => base(Object.assign({}, common, r))));
    toast(`حُفظت درجات ${codes.length} طالبة (${codes[0]}–${codes[codes.length - 1]}) · ${tpName(common.timePoint)}`);
    S.bulkCodes = null; return codes.length;
  } catch (x) { handleDbErr(x); return null; }
}

/* ---- Home: who am I, where are we, what is my next step ---- */
function linkChooser() {
  if (myMember() || !S.db) return '';
  const free = D.team.filter(m => !m.userId).sort((a, b) => a.code.localeCompare(b.code));
  return `<section class="panel hero"><span class="kicker">خطوة واحدة قبل البدء</span><h2>من أنتِ في الفريق؟</h2><p class="lede small">اضغطي رمزك مرة واحدة. بعدها يُحفظ كل ما تسجّلينه برمزك لا باسمك، وتظهر لكِ مهامك وفصولك.</p>
  <div class="chips">${free.map(m => `<button type="button" class="c" data-act="link" data-id="${esc(m._id)}">أنا ${esc(m.code)} · ${esc(m.discipline || '')}</button>`).join('') || '<span class="muted small">كل الرموز مرتبطة. اطلبي من قائدة المشروع إضافة رمز لكِ.</span>'}</div></section>`;
}
function cycleStrip(c) {
  const cur = Math.min(12, Math.max(1, Number(c.phase || 1)));
  return `<div class="strip" aria-hidden="true">${PHASES.map((p, i) => `<span class="${i + 1 < cur ? 'd' : (i + 1 === cur ? 'n' : '')}" title="${esc((i + 1) + ' · ' + p.n)}"></span>`).join('')}</div>`;
}
const actBtn = ([l, a, t], primary) => `<button class="btn ${primary ? 'bigbtn' : 'ghost'}" data-act="${a === 'rec' ? 'go-rec' : (a === 'meet' ? 'go-meet' : (a === 'report' ? 'go-report' : 'nav'))}" data-view="${esc(t)}" data-t="${esc(t)}">${esc(l)}</button>`;
function nextStepCard(c) {
  const idx = Math.min(11, Math.max(0, Number(c.phase || 1) - 1)); const p = PHASES[idx]; const gaps = phaseGaps(c); const done = gaps.filter(g => g.ok).length;
  const next = PHASES[idx + 1];
  return `<section class="panel hero"><div class="row between"><span class="kicker">الدورة ${esc(c.code)} · المرحلة ${idx + 1} من 12 · ${esc(p.wk)}</span><button class="btn ghost small" data-act="nav" data-view="cycle">كل المراحل</button></div>${cycleStrip(c)}
  <h2 style="font-size:24px">${esc(p.n)}</h2><p><b>المطلوب الآن:</b> ${esc(p.goal)}</p>
  <div class="row">${p.act.map((a, i) => actBtn(a, i === 0)).join('')}</div>
  <div class="mini"><b class="small">تكتمل المرحلة عندما يتوفر (${done} من ${gaps.length}):</b>${gaps.map(g => `<div class="gap"><span class="tick ${g.ok ? 'y' : 'n'}" aria-hidden="true">${g.ok ? '✓' : ''}</span><span style="flex:1">${esc(g.t)}</span>${g.target ? `<div class="meter" aria-hidden="true"><span style="width:${Math.min(100, Math.round(g.n / g.target * 100))}%"></span></div><span class="small muted">${g.n}/${g.target}</span>` : ''}</div>`).join('')}</div>
  <details class="more"><summary>ماذا نفعل في هذه المرحلة؟ ومن المسؤولة؟</summary><ul style="margin:0;padding-inline-start:20px">${p.do.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="small muted">المسؤولة: ${esc(p.who)} · المخرج: ${esc(p.out)}${next ? ' · بعدها: ' + esc(next.n) : ''}</p></details></section>`;
}
function memberActivity(m, lastMeet) {
  const mine = [...D.notes, ...D.evidence, ...D.ai, ...D.lessons].filter(r => r.author === m.code);
  const last = mine.map(dateOf).filter(Boolean).sort().pop() || '';
  const week = mine.filter(r => dateOf(r) >= daysAgo(7)).length;
  const refl = lastMeet ? D.notes.some(n => n.context === 'after' && n.meetingId === lastMeet.code && n.author === m.code) : null;
  const attended = lastMeet ? (lastMeet.attendees || []).includes(m.code) : false;
  const open = D.tasks.filter(t => t.status !== 'done' && t.owner === m.code).length;
  const late = D.tasks.filter(t => t.status !== 'done' && t.owner === m.code && t.due && t.due < today()).length;
  const age = last ? Math.round((new Date(today()) - new Date(last)) / 864e5) : 99;
  return {last, week, refl, attended, open, late, dot: age <= 7 ? 'g' : (age <= 14 ? 'a' : 'r')};
}
function lastPastMeeting() { return D.meetings.filter(m => m.date && m.date <= today()).sort((a, b) => b.date.localeCompare(a.date))[0]; }
function teamPanel() {
  const lm = lastPastMeeting(); const rows = D.team.slice().sort((a, b) => a.code.localeCompare(b.code)).map(m => [m, memberActivity(m, lm)]);
  const missing = rows.filter(([m, a]) => lm && a.attended && !a.refl).map(([m]) => m.code);
  return `<section class="panel"><div class="row between"><h2>متابعة الفريق</h2><span class="small muted">للقائدة فقط · ${lm ? 'آخر اجتماع ' + esc(lm.code) + ' (' + esc(fmtDate(lm.date)) + ')' : 'لا اجتماع مسجّل بعد'}</span></div>
  <div class="scroll"><table class="teamtbl"><thead><tr><th>العضوة</th><th>آخر تسجيل</th><th>هذا الأسبوع</th><th>تأمل آخر اجتماع</th><th>مهام مفتوحة</th></tr></thead><tbody>${rows.map(([m, a]) => `<tr><td><span class="dot ${a.dot}" aria-hidden="true"></span><b>${esc(m.code)}</b> ${subjChip(m.discipline)}${m.userId ? '' : ' <span class="chip warn">لم تربط حسابها</span>'}</td><td>${a.last ? esc(fmtDate(a.last)) : '<span class="muted">لا شيء بعد</span>'}</td><td>${a.week} سجل</td><td>${!lm ? '—' : (!a.attended ? '<span class="muted">لم تحضر</span>' : (a.refl ? '✓ سُجّل' : '<span class="chip warn">لم يُسجّل</span>'))}</td><td>${a.open}${a.late ? ` <span class="chip warn">${a.late} متأخرة</span>` : ''}</td></tr>`).join('')}</tbody></table></div>
  <p class="tiny muted"><span class="dot g"></span>سجّلت خلال 7 أيام · <span class="dot a"></span>8–14 يومًا · <span class="dot r"></span>أكثر من أسبوعين أو لا شيء</p>
  ${missing.length ? `<div class="row"><span class="small">تأملات ناقصة: ${esc(missing.join('، '))}</span><button class="btn ghost small" data-act="copy-nudge" data-who="${esc(missing.join('،'))}" data-m="${esc(lm.code)}">نسخ رسالة تذكير</button></div>` : ''}</section>`;
}
function myReminders() {
  const me = myMember(); if (!me) return '';
  const lm = lastPastMeeting(); const a = memberActivity(me, lm); const items = [];
  if (lm && a.attended && !a.refl) items.push(`<div class="note row between"><span>لم تسجّلي تأملك بعد اجتماع ${esc(lm.code)} (${esc(fmtDate(lm.date))}). يكفي 3 جمل.</span><button class="btn small" data-act="go-rec" data-t="after">سجّلي التأمل</button></div>`);
  if (a.late) items.push(`<div class="note">لديكِ ${a.late} مهمة متأخرة في «مهامي» أدناه.</div>`);
  return items.join('');
}
V.home = () => {
  const st = setupStatus(); const setupDone = st.every(s => s[1]); const c = curCycle(); const me = myMember(); const lead = isLeader();
  const myTasks = D.tasks.filter(t => t.status !== 'done' && (!me || t.owner === me.code || t.owner === 'الفريق')).sort((a, b) => String(a.due).localeCompare(String(b.due)));
  const nextMeeting = D.meetings.filter(m => m.date >= today()).sort((a, b) => a.date.localeCompare(b.date))[0];
  return `<div><h1>${me ? 'أهلًا ' + esc(me.code) : 'ماذا أفعل الآن؟'}</h1><p class="lede">${me ? esc(me.discipline || '') + ' · ' + esc(me.role || '') + '. ' : ''}هنا ما يلزمكِ اليوم: أين وصل الفريق، وخطوتكِ التالية، وأين تسجّلينها.</p></div>
  ${introCard()}
  ${linkChooser()}
  ${accessPanel()}
  ${lead && !setupDone ? `<section class="panel"><h2>إعداد المنصة (مرة واحدة)</h2><ul class="checklist">${st.map(([t, ok]) => `<li><span class="tick ${ok ? 'y' : 'n'}" aria-hidden="true">${ok ? '✓' : ''}</span><span>${esc(t)}</span></li>`).join('')}</ul><div><button class="btn" data-act="nav" data-view="setup">أكملي الإعداد</button></div></section>` : ''}
  ${myReminders()}
  ${c ? nextStepCard(c) : `<section class="panel"><div class="empty">لا توجد دورة بحث بعد. ${lead ? 'أنشئيها من «الإعداد».' : 'ستظهر هنا عندما تنشئها قائدة المشروع.'}</div></section>`}
  ${lead ? teamPanel() : ''}
  <section class="panel"><h2>سجّلي بسرعة</h2><div class="grid">
    ${Object.entries(CONTEXTS).map(([k, x]) => `<button class="action" data-act="go-rec" data-t="${k}"><b>${icon(x.icon)}${esc(x.n)}</b><span>${esc(x.d)}</span></button>`).join('')}
    <button class="action" data-act="go-rec" data-t="evidence"><b>${icon('evidence')}درجات الطالبات</b><span>طالبة واحدة، أو الفصل كاملًا في جدول.</span></button>
    <button class="action" data-act="nav" data-view="ai"><b>${icon('ai')}تصميم درس مع AI</b><span>يحفظ ما كتبه الذكاء الاصطناعي وما غيّرتِه ولماذا.</span></button></div></section>
  <div class="cols">
    <section class="panel"><h2>مهامي</h2><div class="ledger">${myTasks.length ? myTasks.slice(0, 6).map(taskRow).join('') : '<div class="empty">لا مهام مفتوحة لكِ. تُوزَّع المهام في نهاية كل اجتماع.</div>'}</div>
    ${nextMeeting ? `<div class="ok">الاجتماع القادم ${esc(nextMeeting.code)}: ${esc(fmtDate(nextMeeting.date))}${nextMeeting.goal ? ' — ' + esc(nextMeeting.goal) : ''}</div>` : '<div class="note">لا اجتماع قادم مسجّل. الإيقاع المقترح: اجتماع أسبوعي ثابت 45 دقيقة.</div>'}</section>
    ${lead ? `<section class="panel"><h2>المقررات المشاركة</h2><div class="ledger">${SUBJ.map(s => { const cls = D.classes.filter(x => x.subject === s.n); return `<div class="rec"><div class="row between">${subjChip(s.n)}<span class="small muted">${cls.length} فصل · ${cls.reduce((a, x) => a + (Number(x.count) || 0), 0)} طالبة</span></div><div class="small">${D.notes.filter(n => n.subject === s.n).length} ملاحظة · ${D.evidence.filter(n => n.subject === s.n).length} دليل تعلّم · ${D.lessons.filter(n => n.subject === s.n).length} نسخة درس · ${D.ai.filter(n => n.subject === s.n).length} سجل AI</div></div>`; }).join('')}</div></section>` : ''}
  </div>`;
};

/* ---- Live meeting mode ---- */
const LIVE_STEPS = [['افتتاح', 5], ['عرض الأدلة', 15], ['تحليل وقرار', 15], ['المهام', 5], ['تأمل وحفظ', 5]];
function liveNew() { const c = curCycle(); const ph = c ? PHASES[Math.min(11, Math.max(0, Number(c.phase || 1) - 1))] : null; return {step: 0, started: 0, stepAt: 0, date: today(), cycleId: c ? c.code : '', goal: ph ? 'المرحلة ' + c.phase + ' (' + ph.n + '): ' + ph.goal : '', attendees: D.team.map(m => m.code), ev: {}, discussion: '', decisions: [], tasks: [], reflection: ''}; }
function live() { if (!S.live) S.live = store.get('live', null) || liveNew(); return S.live; }
function liveSave() { store.set('live', S.live); }
const lv = (path, val, attrs = '', tag = 'textarea') => tag === 'textarea' ? `<textarea data-live="${path}" ${attrs}>${esc(val || '')}</textarea>` : `<input data-live="${path}" value="${esc(val || '')}" ${attrs}>`;
const mmss = s => pad(Math.floor(s / 60), 2) + ':' + pad(s % 60, 2);
function liveHtml() {
  const L = live(); const c = curCycle();
  if (!L.started) { const f = liveNew(); if (!L.attTouched && !L.attendees.length) L.attendees = f.attendees; if (!L.cycleId) L.cycleId = f.cycleId; if (!L.goal) L.goal = f.goal; }
  if (!L.started) return `<section class="panel hero"><span class="kicker">وضع الاجتماع</span><h2>اجتماع بحث الدرس في 45 دقيقة</h2><p class="lede small">خمس خطوات على شاشة واحدة. تكتبين أثناء الاجتماع، وفي النهاية يُحفظ المحضر والقرارات والمهام دفعة واحدة. إن أُغلقت الصفحة يبقى ما كتبتِه على هذا الجهاز.</p>
    <div class="grid">${field('التاريخ', lv('date', L.date, 'type="date"', 'input'))}${field('الدورة', `<select data-live="cycleId">${opts(D.cycles.map(x => x.code), L.cycleId, '—')}</select>`)}</div>
    ${field('هدف الاجتماع', lv('goal', L.goal, 'rows="2"'))}
    <div><div class="hint" style="margin-bottom:6px">الحاضرات (اضغطي لإلغاء الغائبة)</div><div class="chips">${D.team.map(m => `<label><input type="checkbox" data-live-att value="${esc(m.code)}"${L.attendees.includes(m.code) ? ' checked' : ''}>${esc(m.code)} · ${esc(m.discipline || '')}</label>`).join('')}</div></div>
    <div><button class="btn bigbtn" type="button" data-act="live-start">ابدئي الاجتماع</button></div></section>`;
  const st = L.step; const att = D.team.filter(m => L.attendees.includes(m.code));
  let body = '';
  if (st === 0) { const ph = c ? PHASES[Math.min(11, Math.max(0, Number(c.phase || 1) - 1))] : null; body = `${field('هدف الاجتماع', lv('goal', L.goal, 'rows="2"'))}${ph ? `<div class="mini"><b class="small">أين نحن: المرحلة ${esc(c.phase)} · ${esc(ph.n)}</b><span class="small">${esc(ph.goal)}</span>${phaseGaps(c).map(g => `<span class="small">${g.ok ? '✓' : '○'} ${esc(g.t)} (${g.n}${g.target ? '/' + g.target : ''})</span>`).join('')}</div>` : ''}`; }
  if (st === 1) body = `<p class="small muted">3 دقائق لكل معلمة: ماذا تُظهر أعمال طالباتها؟ اكتبي الأرقام والرموز لا الانطباعات.</p><div class="grid wide">${att.map(m => field(m.code + ' · ' + (m.discipline || ''), lv('ev.' + m.code, L.ev[m.code], 'rows="3" placeholder="مثال: 4 من 6 بطاقات خروج فسّرت دون نقل (E0012–E0017)"'))).join('')}</div>`;
  if (st === 2) body = `${field('ماذا تعني الأدلة؟ ما البدائل التي طُرحت؟', lv('discussion', L.discussion, 'rows="4"'))}
    <div class="mini"><b>إضافة قرار</b><div class="grid wide">${field('الدليل', `<textarea id="ldEv" rows="2" placeholder="لا قرار بلا دليل: رموز أو أرقام"></textarea>`)}${field('القرار', `<textarea id="ldDec" rows="2" placeholder="ماذا قرّرنا؟"></textarea>`)}${field('السبب', `<textarea id="ldWhy" rows="2"></textarea>`)}${field('الإجراء', `<textarea id="ldAct" rows="2" placeholder="ماذا سنفعل؟ في أي نسخة من الدرس؟"></textarea>`)}</div><div class="row">${field('المقرر المعني', `<select id="ldSubj">${opts(SUBJ.map(s => s.n), '', 'كل المقررات')}</select>`)}<button type="button" class="btn" data-act="live-dec" style="align-self:end">＋ إضافة القرار</button></div></div>
    ${L.decisions.length ? `<div class="ledger">${L.decisions.map((d, i) => `<div class="rec"><div class="row between"><b>قرار ${i + 1}: ${esc(d.decision)}</b><button type="button" class="btn ghost small" data-act="live-rm" data-k="decisions" data-i="${i}">حذف</button></div><div class="small muted">الدليل: ${esc(d.evidence)}${d.reason ? ' · السبب: ' + esc(d.reason) : ''}</div></div>`).join('')}</div>` : '<div class="empty">لم يُضف قرار بعد.</div>'}`;
  if (st === 3) body = `<div class="mini"><b>إضافة مهمة</b><div class="grid">${field('المهمة', `<input id="ltTitle" placeholder="مثال: إدخال درجات خط الأساس لفصلي">`)}${field('المسؤولة', `<select id="ltOwner">${opts([...att.map(m => [m.code, m.code + ' · ' + (m.discipline || '')]), ['الفريق', 'الفريق كله']])}</select>`)}${field('الاستحقاق', `<input id="ltDue" type="date" value="${addDays(7)}">`)}</div><div><button type="button" class="btn" data-act="live-task">＋ إضافة المهمة</button></div></div>
    ${L.tasks.length ? `<div class="ledger">${L.tasks.map((t, i) => `<div class="rec"><div class="row between"><b>${esc(t.title)}</b><button type="button" class="btn ghost small" data-act="live-rm" data-k="tasks" data-i="${i}">حذف</button></div><div class="small muted">${esc(t.owner)} · حتى ${esc(fmtDate(t.due))}</div></div>`).join('')}</div>` : '<div class="empty">لم تُضف مهام بعد. كل قرار يحتاج مهمة واحدة على الأقل.</div>'}`;
  if (st === 4) body = `${field('جملة من كل عضوة: ماذا نأخذ من هذا الاجتماع؟', lv('reflection', L.reflection, 'rows="4"'))}
    <div class="note">ذكّري الفريق: كل عضوة تكتب تأملها الفردي من «سجّلي ← بعد الاجتماع» خلال 24 ساعة.</div>
    <div class="mini"><b>سيُحفظ الآن:</b><span class="small">اجتماع واحد بحضور ${att.length} · ${L.decisions.length} قرار · ${L.tasks.length} مهمة · ${Object.values(L.ev).filter(v => String(v).trim()).length} عرض أدلة</span>${!L.decisions.length ? '<span class="small" style="color:var(--amber)">لا قرارات بعد. يمكن الحفظ، لكن الاجتماع الجيد ينتهي بقرار.</span>' : ''}</div>
    <div class="row"><button type="button" class="btn bigbtn" data-act="live-save">حفظ الاجتماع وكل ما فيه</button></div>`;
  return `<section class="panel"><div class="row between"><div><span class="kicker" style="color:var(--accent);font-weight:700;font-size:13px">اجتماع جارٍ · ${esc(fmtDate(L.date))}</span><h2>${esc(LIVE_STEPS[st][0])} <span class="small muted">(${LIVE_STEPS[st][1]} دقائق مقترحة)</span></h2></div><div style="text-align:left"><div class="clock" id="liveClock">00:00</div><div class="tiny muted" id="liveStepClock"></div></div></div>
  <div class="livesteps">${LIVE_STEPS.map(([n, mi], i) => `<button type="button" data-act="live-step" data-i="${i}"${i === st ? ' aria-current="step"' : ''} class="${i < st ? 'done' : ''}"><b>${i + 1}. ${esc(n)}</b><span class="tiny">${mi} د</span></button>`).join('')}</div>
  ${body}
  <div class="row between"><div class="row">${st > 0 ? `<button type="button" class="btn ghost" data-act="live-step" data-i="${st - 1}">→ السابق</button>` : ''}${st < 4 ? `<button type="button" class="btn" data-act="live-step" data-i="${st + 1}">التالي: ${esc(LIVE_STEPS[st + 1][0])} ←</button>` : ''}</div><button type="button" class="btn ghost small" data-act="live-cancel">إلغاء الاجتماع</button></div></section>`;
}
function liveTick() {
  const el = $('#liveClock'); const L = S.live; if (!el || !L || !L.started) return;
  const t = Math.floor((Date.now() - L.started) / 1000); el.textContent = mmss(t) + ' / 45:00'; el.classList.toggle('over', t > 45 * 60);
  const s2 = $('#liveStepClock'); if (s2 && L.stepAt) { const u = Math.floor((Date.now() - L.stepAt) / 1000); const lim = LIVE_STEPS[L.step][1] * 60; s2.textContent = 'هذه الخطوة ' + mmss(u) + ' من ' + mmss(lim); s2.style.color = u > lim ? 'var(--amber)' : ''; }
}
setInterval(liveTick, 1000);
async function liveSaveAll() {
  const L = live(); if (!S.db) { toast('لا يمكن الحفظ: قاعدة البيانات غير متاحة في هذا العرض.'); return; }
  const att = L.attendees; const evText = Object.entries(L.ev).filter(([, v]) => String(v).trim()).map(([k, v]) => k + ': ' + v).join('\n');
  const mins = L.started ? Math.round((Date.now() - L.started) / 60000) : null;
  try {
    const mid = await create('meetings', 'M', 2, base({date: L.date, cycleId: L.cycleId, attendees: att, goal: L.goal, agenda: PROTOCOL.join('\n'), evidence: evText, discussion: L.discussion, decisionsSummary: L.decisions.map((d, i) => (i + 1) + '. ' + d.decision).join('\n'), reflection: L.reflection, durationMin: mins, mode: 'live'}));
    if (!mid) return;
    const c = curCycle();
    const dc = await createMany('decisions', 'D', 4, L.decisions.map(d => base({meetingId: mid, cycleId: L.cycleId, date: L.date, subject: d.subject, situation: L.discussion ? L.discussion.slice(0, 400) : '', evidence: d.evidence, alternatives: '', decision: d.decision, reason: d.reason, action: d.action, participants: att, status: 'continued', outcome: ''})));
    const tc = await createMany('tasks', 'K', 3, L.tasks.map(t => base({title: t.title, owner: t.owner, due: t.due, meetingId: mid, cycleId: L.cycleId, phase: c ? Number(c.phase) || null : null, status: 'open'})));
    S.live = null; store.del('live');
    toast(`حُفظ الاجتماع ${mid} مع ${dc.length} قرار و${tc.length} مهمة. يظهر المحضر في التقارير.`);
    S.meetTab = 'meetings'; render(); window.scrollTo(0, 0);
  } catch (x) { handleDbErr(x); }
}


function accessPanel() {
  if (!window.burhanIsOwner) return '';
  const req = (D.access || []).filter(r => r.status === 'pending').sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const ok = (D.access || []).filter(r => r.status === 'approved');
  if (!req.length) return ok.length ? '' : `<section class="panel"><h2>انضمام الفريق</h2><p class="small muted">أرسلي رابط المنصة للمعلمات. كل معلمة تضغط «إنشاء حساب» ببريدها، ويظهر طلبها هنا لتقبليه.</p></section>`;
  return `<section class="panel hero"><span class="kicker">طلبات انضمام جديدة (${req.length})</span><h2>من تريدين قبوله في الفريق؟</h2><p class="small muted">اقبلي فقط البريد الذي تعرفين صاحبته. بعد القبول تدخل المعلمة وتضغط رمزها (T0x) مرة واحدة.</p>
  <div class="ledger">${req.map(r => `<div class="rec"><div class="row between"><b dir="ltr">${esc(r.email || r._id)}</b><div class="row"><button class="btn small" data-act="acc-set" data-id="${esc(r._id)}" data-st="approved">قبول</button><button class="btn ghost small" data-act="acc-set" data-id="${esc(r._id)}" data-st="rejected">رفض</button></div></div><div class="meta"><span>طلبت ${esc(fmtDate(r.createdAt))}</span></div></div>`).join('')}</div></section>`;
}
document.addEventListener('click', async e => { const b = e.target.closest('button[data-act="acc-set"]'); if (!b || !S.db) return; b.disabled = true;
  try { await S.db.collection('access').doc(b.dataset.id).update({status: b.dataset.st, decidedAt: new Date().toISOString()}); toast(b.dataset.st === 'approved' ? 'قُبلت. تستطيع الدخول الآن.' : 'رُفض الطلب.'); } catch (x) { handleDbErr(x); b.disabled = false; } });

/* ---- After every render ---- */
function afterRender() { draftBars(); liveTick(); if (S.view === 'rec' && S.recType === 'evidence' && S.evMode === 'class') bulkInfo(); }

/* ---- Events for the UX layer ---- */
document.addEventListener('input', e => {
  const t = e.target; const f = t.closest && t.closest('#view form[data-form]');
  if (f) saveDraft(f);
  if (t.matches && t.matches('input[data-score]')) bulkInfo();
  if (t.dataset && t.dataset.live) { const L = live(); const p = t.dataset.live.split('.'); if (p.length === 2) L[p[0]][p[1]] = t.value; else L[p[0]] = t.value; liveSave(); }
});
document.addEventListener('change', e => {
  const t = e.target; const f = t.closest && t.closest('#view form[data-form]'); if (f) saveDraft(f);
  if (t.matches && t.matches('[data-live-att]')) { const L = live(); L.attendees = $$('[data-live-att]').filter(x => x.checked).map(x => x.value); L.attTouched = true; liveSave(); }
  if (t.dataset && t.dataset.live) { const L = live(); L[t.dataset.live] = t.value; liveSave(); }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.matches || !e.target.matches('input[data-score]')) return;
  e.preventDefault(); const all = $$('input[data-score]'); const i = all.indexOf(e.target); if (all[i + 1]) { all[i + 1].focus(); all[i + 1].select(); }
});
document.addEventListener('click', async e => {
  const b = e.target.closest('button[data-act]'); if (!b) return; const act = b.dataset.act;
  if (act === 'menu') { const r = $('.rail'); const open = !r.classList.contains('open'); r.classList.toggle('open', open); $('#menuBtn').setAttribute('aria-expanded', open); window.scrollTo(0, 0); }
  if (act === 'nav' || act === 'go-rec' || act === 'go-meet' || act === 'go-report') { const r = $('.rail'); if (r) r.classList.remove('open'); }
  if (act === 'ctx-open') { const w = b.closest('[data-ctxwrap]'); w.querySelector('[data-ctxfull]').hidden = false; w.querySelector('[data-ctxbar]').hidden = true; const sh = w.querySelector(':scope > .stephead'); if (sh) sh.hidden = true; }
  if (act === 'fill') { const f = b.closest('form'); const el = f && f[b.dataset.name]; if (el) { el.value = b.dataset.v; S.dirty = true; saveDraft(f); const nx = f.observed || f.text; if (nx) nx.focus(); } }
  if (act === 'draft-restore') { const f = b.closest('form'); restoreDraft(f); b.closest('[data-draftbar]').remove(); toast('استُعيدت المسودة. راجعيها ثم احفظي.'); }
  if (act === 'draft-drop') { const f = b.closest('form'); dropDraft(f); }
  if (act === 'ev-mode') { S.evMode = b.dataset.m; render(); }
  if (act === 'bulk-rows') { const a = $('#bFrom').value.toUpperCase().trim(), z = $('#bTo').value.toUpperCase().trim(); const na = parseInt(a.replace(/\D/g, ''), 10), nz = parseInt(z.replace(/\D/g, ''), 10); if (!(na > 0 && nz >= na && nz - na < 80)) { toast('اكتبي مدى صحيحًا مثل S001 إلى S028 (80 طالبة حدًا أقصى).'); return; } const w = Math.max(3, String(nz).length); S.bulkCodes = Array.from({length: nz - na + 1}, (_, i) => 'S' + pad(na + i, w)); render(); }
  if (act === 'copy-nudge') { const msg = `السلام عليكن، تذكير لطيف: نحتاج تأملكن القصير بعد اجتماع ${b.dataset.m} في منصة بُرهان (سجّلي ← بعد الاجتماع). ثلاث جمل تكفي: ماذا لاحظتُ، ماذا تعلّمتُ، ماذا سأغيّر. شكرًا لكن. (${b.dataset.who})`; try { await navigator.clipboard.writeText(msg); toast('نُسخت رسالة التذكير. الصقيها في مجموعة الفريق.'); } catch (x) { toast(msg); } }
  if (act === 'live-start') { const L = live(); L.started = Date.now(); L.stepAt = Date.now(); L.step = 0; liveSave(); render(); }
  if (act === 'live-step') { const L = live(); L.step = Number(b.dataset.i); L.stepAt = Date.now(); liveSave(); render(); window.scrollTo(0, 0); }
  if (act === 'live-dec') { const ev = $('#ldEv').value.trim(), dec = $('#ldDec').value.trim(); if (!ev || !dec) { toast('القرار يحتاج دليلًا ونص القرار.'); return; } const L = live(); L.decisions.push({evidence: ev, decision: dec, reason: $('#ldWhy').value.trim(), action: $('#ldAct').value.trim(), subject: $('#ldSubj').value}); liveSave(); render(); toast('أُضيف القرار ' + L.decisions.length + '.'); }
  if (act === 'live-task') { const ti = $('#ltTitle').value.trim(); if (!ti) { toast('اكتبي المهمة.'); return; } const L = live(); L.tasks.push({title: ti, owner: $('#ltOwner').value, due: $('#ltDue').value || addDays(7)}); liveSave(); render(); toast('أُضيفت المهمة.'); }
  if (act === 'live-rm') { const L = live(); L[b.dataset.k].splice(Number(b.dataset.i), 1); liveSave(); render(); }
  if (act === 'live-cancel') { if (S.liveArm !== 1) { S.liveArm = 1; b.textContent = 'اضغطي مرة أخرى لتأكيد الإلغاء'; setTimeout(() => { S.liveArm = 0; }, 4000); return; } S.liveArm = 0; S.live = liveNew(); store.del('live'); render(); toast('أُلغي الاجتماع ولم يُحفظ شيء.'); }
  if (act === 'live-save') { b.disabled = true; await liveSaveAll(); b.disabled = false; }
});

/* ---- About: what Burhan is, why, and how to work with it ---- */
ICONS.about = '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>';
NAV[0][1].unshift(['about', 'ما هو بُرهان؟']); VIEW_KEYS.unshift('about');
const ABOUT_FLOW = [
  ['1', 'نشخّص', 'كل معلمة تجمع عينات من أعمال طالباتها، ونتفق في اجتماع على مشكلة تعلّم واحدة مشتركة بين المقررات.'],
  ['2', 'نقيس قبل', 'مهمة قصيرة لكل فصل تُصحَّح بمقياس 0–4، فنعرف مستوى الطالبات قبل أي تغيير.'],
  ['3', 'نصمّم معًا', 'نكتب درسًا بحثيًا متمايزًا (مستويات دعم أ/ب/ج)، ونستعين بالذكاء الاصطناعي ونوثّق ما قبلناه وما غيّرناه ولماذا.'],
  ['4', 'نلاحظ الطالبات', 'معلمة تدرّس والبقية يلاحظن تعلّم الطالبات (لا أداء المعلمة)، ويسجّلن اللحظات من «ملاحظة حصة».'],
  ['5', 'نحلّل ونقرّر', 'اجتماع 45 دقيقة: ماذا تقول الأدلة؟ ماذا نغيّر؟ كل قرار مربوط بدليل، وكل قرار له مهمة.'],
  ['6', 'نعيد ونقيس بعد', 'نطبّق النسخة المحسّنة، ثم نقيس الطالبات مرة أخرى ونقارن بالبداية، وتكتب كل معلمة تأملها.']];
const ABOUT_WHEN = [
  ['eye', 'أثناء الحصة', 'وأنتِ تلاحظين درسًا بحثيًا: من الطالبة؟ ماذا حدث؟ أي دعم؟', 'in'],
  ['notes', 'خارج الحصة', 'وأنتِ تخططين أو تصححين أو تجربين شيئًا في فصلك.', 'out'],
  ['evidence', 'درجات الطالبات', 'بعد تصحيح مهمة القياس: الفصل كاملًا في جدول واحد.', 'evidence'],
  ['meetings', 'في الاجتماع', 'القائدة تدير الاجتماع من «اجتماع الآن» فيُحفظ المحضر والقرارات والمهام.', 'meet'],
  ['refl', 'بعد الاجتماع', 'ثلاث جمل خلال 24 ساعة: ماذا لاحظتُ، ماذا تعلّمتُ، ماذا سأغيّر.', 'after'],
  ['ai', 'مع الذكاء الاصطناعي', 'عند تصميم الدرس أو تعديله: الصقي ما كتبه AI وما اعتمدتِه، فتظهر الفروق وسببها.', 'ai']];
V.about = () => `<div><h1>ما هو بُرهان؟</h1><p class="lede">منصة عمل لمجتمع تعلّم مهني من معلمين ومعلمات من تخصصات مختلفة يطوّرون معًا تدريسًا متمايزًا عبر <b>بحث الدرس</b>، بمساندة الذكاء الاصطناعي، ويحفظن كل خطوة دليلًا.</p></div>
  <section class="panel hero"><span class="kicker">الفكرة في سطرين</span><h2 style="font-size:22px">دليلٌ على التعلّم، وقرارٌ مبنيٌّ على الدليل</h2><p>لا نغيّر الدرس لأننا «نشعر» أنه أفضل، بل لأن أعمال الطالبات تقول ذلك. وبُرهان يجمع هذه الأدلة في مكان واحد: ماذا رأينا، ماذا قررنا، ماذا اقترح الذكاء الاصطناعي وماذا اخترنا، وماذا تغيّر عند الطالبات.</p></section>
  <section class="panel"><h2>لماذا؟ الأهداف</h2><div class="grid">${[['للطالبات', 'أن تنتقل الطالبة من حل الخطوات إلى تفسيرها ونقلها لموقف جديد، كلٌّ حسب مستواها.'], ['للمعلمات', 'تطوير ممارسات التعليم المتمايز والحكم المهني عبر عمل جماعي حقيقي داخل الصف، لا دورات منفصلة.'], ['للذكاء الاصطناعي', 'استخدامه مساعدًا يقترح، والقرار للمعلمة دائمًا، مع توثيق ما قُبل وما عُدّل وما رُفض.'], ['للمدرسة والبحث', 'نموذج موثّق قابل للتطبيق في مدارس أخرى، وبيانات منظمة تخدم دراسة علمية.']].map(([t, d]) => `<div class="mini"><b>${esc(t)}</b><span class="small">${esc(d)}</span></div>`).join('')}</div></section>
  <section class="panel"><h2>كيف نعمل؟ دورة بحث الدرس (نحو 6 أسابيع)</h2><p class="small muted">الدورة الكاملة 12 مرحلة، وهذه هي الخطوات الكبرى. الصفحة الرئيسة تخبركِ دائمًا في أي مرحلة نحن وما المطلوب الآن.</p>
  <div class="ledger">${ABOUT_FLOW.map(([n, t, d]) => `<div class="rec"><div class="stephead"><span class="n">${n}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div></div>`).join('')}</div></section>
  <section class="panel"><h2>ماذا أسجّل، ومتى؟</h2><div class="grid">${ABOUT_WHEN.map(([ic, t, d, go]) => `<button class="action" data-act="${go === 'ai' ? 'nav' : (go === 'meet' ? 'go-meet' : 'go-rec')}" data-view="${go === 'ai' ? 'ai' : 'meetings'}" data-t="${go === 'meet' ? 'live' : go}"><b>${icon(ic)}${esc(t)}</b><span>${esc(d)}</span></button>`).join('')}</div></section>
  <section class="panel"><h2>من يفعل ماذا؟</h2><div class="scroll"><table><thead><tr><th>الدور</th><th>ماذا تفعل</th><th>كم من وقتها</th></tr></thead><tbody>
    <tr><td><b>قائدة المشروع</b></td><td>تدير الاجتماع الأسبوعي من «اجتماع الآن»، تنقل الدورة من مرحلة لأخرى، تقبل انضمام المعلمات، تتابع الفريق من الصفحة الرئيسة، وتصدّر البيانات أسبوعيًا.</td><td>ساعة ونصف أسبوعيًا تقريبًا</td></tr>
    <tr><td><b>المعلمة المشاركة</b></td><td>تحضر الاجتماع، تجمع أعمال طالباتها وتدخل درجاتها، تلاحظ الدرس البحثي، وتكتب تأملها بعد كل اجتماع.</td><td>45 دقيقة اجتماع + 20–30 دقيقة تسجيل</td></tr>
    <tr><td><b>معلمة الدرس البحثي</b></td><td>تدرّس الدرس الذي صممه الفريق، وتسجّل ما حدث من «خارج الحصة».</td><td>مرة في كل دورة</td></tr>
  </tbody></table></div></section>
  <section class="panel"><h2>قواعد ثابتة</h2><ul class="checklist">${['لا أسماء أبدًا: المعلمات برموز (T01…) والطالبات برموز (S001…). ملف الربط بالأسماء عند القائدة خارج المنصة.', 'نلاحظ تعلّم الطالبات، ولا نقيّم المعلمة. لا تُستخدم أي بيانات في التقييم الوظيفي.', 'الذكاء الاصطناعي يقترح، والمعلمة تقرر. ولا تُدخل فيه أي بيانات تعرّف بطالبة.', 'كل قرار يحتاج دليلًا: رقمًا أو رمز سجل، لا انطباعًا.'].map(t => `<li><span class="tick y" aria-hidden="true">✓</span><span>${esc(t)}</span></li>`).join('')}</ul></section>
  <section class="panel"><h2>أول خمس دقائق لكِ</h2><ol style="margin:0;padding-inline-start:22px;display:flex;flex-direction:column;gap:6px"><li>من الصفحة الرئيسة اضغطي رمزك في «من أنتِ في الفريق؟».</li><li>افتحي «سجّلي» ← «خارج الحصة»، واختاري مقررك وفصلك (يُحفظان بعدها تلقائيًا).</li><li>اكتبي ملاحظة قصيرة عن أعمال طالباتك واحفظي.</li><li>ارجعي للصفحة الرئيسة: ستجدين المرحلة الحالية وخطوتك التالية ومهامك.</li><li>على الجوال: استخدمي الشريط السفلي (الآن · سجّلي · ملاحظة حصة · الاجتماع).</li></ol>
  <div class="row"><button class="btn" data-act="nav" data-view="home">ابدئي من الصفحة الرئيسة</button><button class="btn ghost" data-act="nav" data-view="playbook">دليل القيادة المفصّل</button></div></section>`;
function introCard() {
  if (store.get('introSeen', false)) return '';
  return `<section class="panel" style="border-color:var(--accent)"><div class="row between"><h2>أهلًا بكِ في بُرهان</h2><button class="btn ghost small" data-act="intro-hide">فهمت، أخفِ هذا</button></div>
  <p>منصة يعمل فيها فريق من تخصصات مختلفة على <b>بحث الدرس</b>: نشخّص مشكلة تعلّم، نصمّم درسًا متمايزًا معًا، نلاحظ الطالبات، ونقرر بالأدلة، بمساندة الذكاء الاصطناعي.</p>
  <div class="grid"><div class="mini"><b class="small">ما المطلوب منكِ؟</b><span class="small">اجتماع أسبوعي، وتسجيل قصير: ملاحظاتك، درجات طالباتك، وتأملك بعد الاجتماع.</span></div><div class="mini"><b class="small">أين أبدأ؟</b><span class="small">البطاقة الخضراء أدناه تخبركِ بالمرحلة الحالية وخطوتك التالية.</span></div><div class="mini"><b class="small">الخصوصية</b><span class="small">رموز فقط: T للمعلمات وS للطالبات، بلا أي أسماء.</span></div></div>
  <div><button class="btn small" data-act="nav" data-view="about">اقرئي الشرح كاملًا (3 دقائق)</button></div></section>`;
}
document.addEventListener('click', e => { const b = e.target.closest('button[data-act="intro-hide"]'); if (!b) return; store.set('introSeen', true); render(); });

/* ---- Any school, any subjects: stage, subjects and team size come from project settings ---- */
const SUBJ_CATALOG = [
  ['الرياضيات', 'math', 'حل المعادلات', 'حلّت المجموعة المعادلة إجرائيًا، وعند سؤالها «لماذا هذه الخطوة؟» لم تربطها بالمفهوم.'],
  ['الفيزياء', 'phys', 'تفسير منحنيات السرعة–الزمن', 'قرأت الطالبة الميل رقمًا ولم تفسّره معدل تغيّر للسرعة إلا بعد تلميح.'],
  ['الكيمياء', 'chem', 'سرعة التفاعل الكيميائي', 'فسّرت الطالبة أثر الحرارة على سرعة التفاعل، لكنها لم تنقل التفسير إلى أثر التركيز.'],
  ['التقنية الرقمية', 'dt', 'تصميم خوارزمية لحل مشكلة', 'كتبت الطالبة خطوات الخوارزمية صحيحة لكنها لم تفسّر ترتيب الشرط قبل التكرار.'],
  ['العلوم', '', 'الدورة المائية', 'وصفت الطالبة مراحل الدورة بالترتيب، لكنها لم تفسّر سبب التكاثف.'],
  ['الأحياء', '', 'انقسام الخلية', 'سمّت المراحل صحيحة، ولم تربط ما يحدث للكروموسومات بالنتيجة.'],
  ['علم الأرض والفضاء', '', 'الصفائح التكتونية', 'حدّدت نوع الحد بين الصفيحتين، ولم تفسّر سبب الزلازل عنده.'],
  ['اللغة العربية', '', 'تحليل نص أدبي', 'استخرجت الطالبة الصورة البلاغية، ولم تفسّر أثرها في المعنى.'],
  ['اللغة الإنجليزية', '', 'Reading for main idea', 'اختارت الطالبة الفكرة الرئيسة صحيحة، ولم تبرّرها بدليل من النص.'],
  ['الدراسات الإسلامية', '', 'استنباط حكم من دليل', 'ذكرت الطالبة الحكم، ولم توضّح وجه الدلالة من الدليل.'],
  ['الدراسات الاجتماعية', '', 'قراءة خريطة', 'حدّدت الموقع على الخريطة، ولم تفسّر أثره على النشاط الاقتصادي.'],
  ['المهارات الحياتية', '', 'إدارة الميزانية', 'حسبت الطالبة المصروفات، ولم تبرّر أولويات الإنفاق.'],
  ['التفكير الناقد', '', 'تقييم حجة', 'حدّدت الطالبة النتيجة، ولم تميّز المقدمات الضعيفة.'],
  ['التربية الفنية', '', 'تحليل عمل فني', 'وصفت الألوان المستخدمة، ولم تربطها بالفكرة التي يعبّر عنها العمل.'],
  ['التربية البدنية', '', 'مهارة التمرير', 'أدّت المهارة صحيحة، ولم تفسّر متى تختار التمرير القصير.']];
const STAGES = ['ابتدائية', 'متوسطة', 'ثانوية'];
const DEFAULT_SUBJ = ['التقنية الرقمية', 'الرياضيات', 'الكيمياء', 'الفيزياء'];
const projSubjects = () => { const l = D.settings.subjects; return Array.isArray(l) && l.length ? l : DEFAULT_SUBJ; };
let subjSig = '';
function applySubjects() {
  const list = projSubjects(); const sig = list.join('|'); if (sig === subjSig) return; subjSig = sig;
  let slot = 0; const fixed = new Set(['dt', 'math', 'chem', 'phys']);
  const out = list.map(n => { const c = SUBJ_CATALOG.find(x => x[0] === n); let k = c && c[1] && fixed.has(c[1]) ? c[1] : ''; if (!k) { slot = slot % 8 + 1; k = 'p' + slot; } return {k, n, ex: c ? c[2] : 'عنوان الدرس', obs: c ? c[3] : 'وصفت الطالبة ما فعلته، ولم تفسّر لماذا اختارت هذه الطريقة.'}; });
  SUBJ.length = 0; out.forEach(x => SUBJ.push(x));
  Object.keys(SUBJ_BY_NAME).forEach(k => delete SUBJ_BY_NAME[k]); SUBJ.forEach(x => { SUBJ_BY_NAME[x.n] = x; });
}
const renderNavCore = renderNav;
renderNav = function () { applySubjects(); renderNavCore(); };
function projectWizard() {
  if (!S.canEdit && !window.burhanIsOwner) return '';
  const st = D.settings; const chosen = new Set(projSubjects()); const extra = projSubjects().filter(n => !SUBJ_CATALOG.some(c => c[0] === n));
  return `<form class="panel hero" data-form="project"><span class="kicker">إعداد المشروع لمدرستك</span><h2>المرحلة والمواد وعدد المشاركين</h2>
  <p class="small muted">بُرهان يعمل مع أي مرحلة وأي تخصصات. ما تختارينه هنا يظهر في كل الصفحات: اختيار المادة في التسجيل، والألوان، والتقارير، واكتمال المراحل.</p>
  <div><div class="hint" style="margin-bottom:6px">المرحلة</div>${chipRadios('stage', STAGES, st.stage || 'ثانوية')}</div>
  <div class="grid">${field('الصف المستهدف', inp('grade', st.grade || '', 'placeholder="مثال: الأول الثانوي"'))}${field('عدد المشاركين في الفريق', inp('teamSize', st.teamSize || D.team.length || 4, 'type="number" min="2" max="30" inputmode="numeric"'), 'تُنشأ رموز T01، T02… بهذا العدد')}</div>
  <div><div class="hint" style="margin-bottom:6px">المواد المشاركة (اختاري ما ينطبق)</div><div class="checks">${SUBJ_CATALOG.map(([n]) => `<label><input type="checkbox" name="subj" value="${esc(n)}"${chosen.has(n) ? ' checked' : ''}>${esc(n)}</label>`).join('')}${extra.map(n => `<label><input type="checkbox" name="subj" value="${esc(n)}" checked>${esc(n)}</label>`).join('')}</div></div>
  ${field('مادة غير موجودة في القائمة؟', inp('customSubj', '', 'placeholder="اكتبيها، ويمكن أكثر من مادة بينها فاصلة"'))}
  <div class="row"><button class="btn" type="submit">حفظ إعداد المشروع</button><span class="small muted">بعد الحفظ حدّدي تخصص كل رمز من جدول «الفريق» أدناه.</span></div></form>`;
}
document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-form="project"]'); if (!f) return; e.preventDefault(); if (!S.db) return;
  const subj = $$('input[name=subj]:checked', f).map(x => x.value).concat(String(f.customSubj.value || '').split(/[،,]/).map(x => x.trim()).filter(Boolean));
  const list = [...new Set(subj)]; if (list.length < 1) { toast('اختاري مادة واحدة على الأقل.'); return; }
  const size = Math.min(30, Math.max(2, Number(f.teamSize.value) || 4)); const stage = (f.querySelector('input[name=stage]:checked') || {}).value || 'ثانوية';
  const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
  try {
    await S.db.doc('config/project').set(Object.assign({}, D.settings, {stage, grade: f.grade.value.trim(), subjects: list, teamSize: size, updatedAt: new Date().toISOString()}));
    const have = new Set(D.team.map(m => m.code)); let added = 0;
    for (let i = 1; i <= size; i++) { const code = 'T' + pad(i, 2); if (have.has(code)) continue; await S.db.collection('team').doc(code).set({code, discipline: list[(i - 1) % list.length], role: 'معلمة مشاركة', status: 'نشطة', joined: today(), userId: ''}); added++; }
    S.dirty = false; toast(`حُفظ إعداد المشروع: ${list.length} مادة${added ? ' · أُضيف ' + added + ' رمز جديد' : ''}.`);
  } catch (x) { handleDbErr(x); } finally { btn.disabled = false; }
});

/* =========================================================
   9. Boot
   ========================================================= */
render();
(async () => {
  const cl = window.claude; if (!cl || !cl.use) { S.err = 'قاعدة البيانات غير متاحة خارج Claude.'; renderNav(); return; }
  const [db, user, sample, downloads, assets] = await Promise.all(['db','user','sample','downloads','assets'].map(n => cl.use(n).catch(() => null)));
  S.db = db; S.user = user; S.sample = sample; S.downloads = downloads; S.assets = assets;
  if (user) { try { S.uid = await user.id(); S.canEdit = await user.canEdit(); } catch (x) {} }
  if (!db) { S.err = 'قاعدة البيانات غير متاحة في هذا العرض؛ يمكنك التصفح فقط.'; render(); return; }
  const accept = (key, val) => { const s = JSON.stringify(val); if (S.sig[key] === s) return; S.sig[key] = s; schedule(); };
  db.doc('config/project').onSnapshot(s => { D.settings = s.exists ? s.data() : {}; accept('settings', D.settings); }, () => {});
  COLLS.forEach(c => db.collection(c).limit(1000).onSnapshot(snap => { D[c] = snap.docs.map(d => Object.assign({_id: d.id}, d.data())); accept(c, D[c]); }, err => { if (err && err.code === 'revoked') { S.err = 'انتهت صلاحية الوصول.'; renderNav(); } }));
  render();
})();
})();
