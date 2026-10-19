import { STORAGE_KEY, seedCourses, initialState, normalizeState, courseProgress, recordAnswer, createDraft, publishDraft, validateCourse } from './domain.mjs';

const app = document.querySelector('#app');
const toastNode = document.querySelector('#toast');
let storageAvailable = true;
let state;
try { state = normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { state = initialState(); storageAvailable = false; }
let filter = '全部课程';
let toastTimer;
const icons = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  book: '<path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z"/><path d="M12 5v15"/>',
  edit: '<path d="m16 3 5 5-12 12-6 1 1-6Z"/><path d="m13 6 5 5"/>',
  chart: '<path d="M4 3v18h17M8 16v-5M13 16V7M18 16v-8"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  spark: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
  download: '<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.book}</svg>`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const allCourses = () => [...seedCourses, ...state.courses];
const courseById = id => allCourses().find(c => c.id === id);
const formatDate = value => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); storageAvailable = true; }
  catch { storageAvailable = false; toast('浏览器无法保存数据；当前内容仅保留在本次打开期间。'); }
}
function toast(message) { clearTimeout(toastTimer); toastNode.textContent = message; toastNode.classList.add('visible'); toastTimer = setTimeout(() => toastNode.classList.remove('visible'), 3800); }
function event(type, extra = {}) { state.events.push({ type, ...extra, at: new Date().toISOString() }); state.events = state.events.slice(-500); save(); }
function getRoute() {
  const parts = location.hash.slice(1).split('/').map(p => { try { return decodeURIComponent(p); } catch { return ''; } });
  return { page: ['courses', 'learn', 'teacher', 'activity'].includes(parts[0]) ? parts[0] : 'courses', courseId: parts[1], lessonId: parts[2] };
}
function continueCourse() {
  const last = [...state.events].reverse().find(e => e.courseId && courseById(e.courseId) && ['open', 'answer', 'complete'].includes(e.type));
  return courseById(last?.courseId) || seedCourses[0];
}
function nextLesson(course) { return course.lessons.find(l => !state.progress[course.id]?.[l.id]?.completed) || course.lessons[0]; }
function learnHref(course) { return `#learn/${encodeURIComponent(course.id)}/${encodeURIComponent(nextLesson(course).id)}`; }
const navItems = [['courses', 'grid', '课程库'], ['learn', 'book', '学习工作台'], ['teacher', 'edit', '教师工作台'], ['activity', 'chart', '参与记录']];
function render({ focus = false } = {}) {
  const route = getRoute();
  const title = navItems.find(n => n[0] === route.page)[2];
  document.title = `${title} · LearnLoop 学习环`;
  app.innerHTML = `<div class="layout">
    <aside class="sidebar" aria-label="主导航">
      <a class="brand" href="#courses" aria-label="LearnLoop 学习环首页"><span class="brand-mark">↻</span><span class="brand-name">LearnLoop<small>学习环 · LEARN BY DOING</small></span></a>
      <div class="nav-label">LEARNING SPACE</div>
      <nav class="nav">${navItems.map(([id, img, label]) => `<a href="${id === 'learn' ? learnHref(continueCourse()) : `#${id}`}" class="${route.page === id ? 'active' : ''}" ${route.page === id ? 'aria-current="page"' : ''} title="${label}" aria-label="${label}">${icon(img)}<span>${label}</span></a>`).join('')}</nav>
      <div class="sidebar-project"><span class="status-dot"></span>课程项目 · 阶段原型<strong>每一次练习，形成一个学习环。</strong>第 8／9 周进度讨论版本<br>课程 → 判断 → 反馈 → 进步</div>
      <div class="sidebar-foot">LOCAL PROTOTYPE · V0.1</div>
    </aside>
    <div class="main-wrap"><header class="topbar"><div class="breadcrumb"><span>学习空间</span><span aria-hidden="true">/</span><b>${title}</b></div><div class="top-actions"><span class="local-pill"><span class="status-dot"></span>本地演示</span><span class="top-user">当前浏览器</span><span class="avatar" aria-label="本地学习者">我</span></div></header>
    <main id="main" class="main" tabindex="-1">${!storageAvailable ? '<div class="notice">浏览器存储暂不可用：本次操作不会可靠保留到下次打开。</div>' : ''}${route.page === 'courses' ? renderCourses() : route.page === 'learn' ? renderLearn(route) : route.page === 'teacher' ? renderTeacher() : renderActivity()}</main></div></div>`;
  if (focus) document.querySelector('#main').focus({ preventScroll: true });
}
function heading(kicker, title, text, action = '') { return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1 class="route-title">${title}</h1><p class="subtitle">${text}</p></div>${action}</div>`; }
function stat(value, unit, label, img, color = '') { return `<div class="stat"><span class="stat-icon ${color}">${icon(img)}</span><div><div class="stat-value">${value}<span>${unit}</span></div><div class="stat-label">${label}</div></div></div>`; }
function footer() { return '<footer class="footer-note"><span>LearnLoop 学习环 · 软件工程 × AI 协作 × 互动微学习</span><span>数据仅存于此浏览器 · 无账号与云端同步</span></footer>'; }
function renderCourses() {
  const course = continueCourse();
  const cp = courseProgress(course, state.progress);
  const done = allCourses().reduce((n, c) => n + courseProgress(c, state.progress).completed, 0);
  const finished = allCourses().filter(c => courseProgress(c, state.progress).percent === 100).length;
  const filters = ['全部课程', '软件工程', 'AI 编程', '协作与软技能', '教师自建'];
  const visible = allCourses().filter(c => filter === '全部课程' || c.category === filter);
  return `${heading('YOUR LEARNING, IN MOTION', '让知识，在实践中发生。', '用一段短内容、一个真实情境和一次有依据的判断，积累下一步的能力。', '<span class="date-note">学一点 · 想一步 · 做一次</span>')}
    <section class="hero" aria-labelledby="continue-title"><div class="hero-copy"><div class="eyebrow">${done ? 'CONTINUE YOUR LEARNING · 继续学习' : 'START WITH A SMALL STEP · 从这里开始'}</div><h2 id="continue-title">${esc(course.title)}</h2><p>${esc(course.summary)}</p><a class="btn primary" href="${learnHref(course)}">${cp.percent === 100 ? '回顾这门课程' : cp.completed ? '继续我的学习' : '开始第一段学习'}${icon('arrow')}</a></div><div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="art-card"><div class="art-lines short"></div><div class="art-lines"></div><div class="art-lines"></div></div><div class="art-check">✓</div></div></section>
    <section class="stats" aria-label="当前浏览器的学习概况">${stat(allCourses().length, '门', '可学习的微课程', 'book')}${stat(done, '节', '已完成的情境练习', 'check', 'coral')}${stat(finished, '门', '已完成全部章节', 'chart', 'gold')}</section>
    <div class="library-layout"><section aria-labelledby="library-title"><div class="section-head"><h2 id="library-title">探索微课程</h2><span class="section-caption">短内容，有练习，也有解释。</span></div><div class="filter-row" role="group" aria-label="按课程主题筛选">${filters.map(f => `<button class="chip ${filter === f ? 'active' : ''}" data-action="filter" data-filter="${f}" aria-pressed="${filter === f}">${f}</button>`).join('')}</div><div class="course-grid">${visible.map(renderCourseCard).join('')}</div>${!visible.length ? '<div class="empty"><h3>这里正等待你的第一门课程</h3><p>在教师工作台生成草稿、核对内容并发布后，就会显示在这里。</p><a href="#teacher" class="btn secondary">创建课程草稿</a></div>' : ''}</section>
    <aside class="library-aside"><div class="aside-panel"><h3>一个完整的学习环</h3><ol class="check-list"><li><span class="number">1</span><div><strong>理解一个小概念</strong>从贴近项目的情境开始。</div></li><li><span class="number">2</span><div><strong>作出自己的判断</strong>选择答案，检验理解。</div></li><li><span class="number">3</span><div><strong>读反馈，再前进一步</strong>答对后自动保存完成状态。</div></li></ol></div><div class="aside-note"><strong>为真实的项目实践而学</strong>内置三门微课；你也可以在教师工作台创建并编辑课程。当前草稿生成使用本地规则模板。<br><a class="text-link" href="#teacher">去看看教师工作台 →</a></div></aside></div>${footer()}`;
}
function renderCourseCard(course) {
  const p = courseProgress(course, state.progress);
  return `<article class="course-card"><div class="course-art ${esc(course.color)}" aria-hidden="true"><span class="label">${esc(course.tag)}</span><div class="course-shape"></div></div><div class="course-body"><div class="course-meta"><span>${esc(course.category)}</span><span>·</span><span>${esc(course.duration)}</span></div><h3>${esc(course.title)}</h3><p>${esc(course.summary)}</p><div class="course-bottom"><div class="progress-info"><span>${p.completed ? `已完成 ${p.completed} / ${p.total} 节` : `${p.total} 个章节 · ${esc(course.level)}`}</span><span>${p.percent}%</span></div><div class="progress" role="progressbar" aria-label="${esc(course.title)}完成进度" aria-valuenow="${p.percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p.percent}%"></span></div><a class="btn ${p.completed ? 'primary' : 'secondary'}" href="${learnHref(course)}">${p.percent === 100 ? '回顾课程' : p.completed ? '继续学习' : '进入课程'}${icon('arrow')}</a></div></div></article>`;
}
function renderLearn(route) {
  const course = courseById(route.courseId) || continueCourse();
  const lesson = course.lessons.find(l => l.id === route.lessonId) || nextLesson(course);
  const index = course.lessons.indexOf(lesson);
  const p = courseProgress(course, state.progress);
  const entry = state.progress[course.id]?.[lesson.id];
  const submitted = entry?.lastAnswer;
  const option = lesson.question.options.find(o => o.id === submitted);
  const correct = submitted === lesson.question.correctId;
  return `${heading('LEARN BY DOING', '从理解，走向会用。', '每节完成一次情境判断。答错可以重试，答案解释会帮助你发现遗漏。', `<label class="sr-label"><span class="support-label">切换课程 </span><select class="course-select" id="course-switch" aria-label="切换学习课程">${allCourses().map(c => `<option value="${esc(c.id)}" ${c.id === course.id ? 'selected' : ''}>${esc(c.title)}</option>`).join('')}</select></label>`)}
    <div class="learning-layout"><aside class="panel lesson-nav" aria-label="课程章节"><div class="eyebrow">${esc(course.category)}</div><h3>${esc(course.title)}</h3><div class="progress-info"><span>课程进度</span><span>${p.completed} / ${p.total} 节 · ${p.percent}%</span></div><div class="progress" role="progressbar" aria-label="课程完成进度" aria-valuenow="${p.percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p.percent}%"></span></div><div class="lesson-list">${course.lessons.map((l, i) => `<a class="lesson-item ${l.id === lesson.id ? 'active' : ''} ${state.progress[course.id]?.[l.id]?.completed ? 'complete' : ''}" style="text-decoration:none" href="#learn/${encodeURIComponent(course.id)}/${encodeURIComponent(l.id)}" ${l.id === lesson.id ? 'aria-current="step"' : ''}><span class="lesson-num">${state.progress[course.id]?.[l.id]?.completed ? '✓' : `0${i + 1}`}</span><span>${esc(l.title)}</span></a>`).join('')}</div><div class="workspace-note">${icon('clock')}<span>预计 ${esc(course.duration)}<br>进度保存在当前浏览器</span></div><a class="text-link" style="display:inline-block;margin-top:15px" href="#courses">← 返回课程库</a></aside>
    <article class="panel lesson-content"><div class="lesson-kicker">第 ${index + 1} / ${course.lessons.length} 节 ${entry?.completed ? ' · 已完成 ✓' : ''}</div><h2>${esc(lesson.title)}</h2>${index === 0 ? `<div class="intro-panel"><p>${esc(course.intro)}</p><div class="objectives">${course.objectives.map(o => `<span class="objective">${esc(o)}</span>`).join('')}</div></div>` : ''}${lesson.body.map(t => `<p>${esc(t)}</p>`).join('')}<div class="prompt-box"><strong>带着这个问题想一想</strong>${esc(lesson.task)}</div>
    <form id="quiz-form" class="quiz" data-course="${esc(course.id)}" data-lesson="${esc(lesson.id)}"><div class="eyebrow">YOUR TURN · 情境练习</div><h3 id="question-title">${esc(lesson.question.prompt)}</h3><div class="options" role="radiogroup" aria-labelledby="question-title">${lesson.question.options.map(o => `<label class="option"><input type="radio" name="answer" value="${esc(o.id)}" ${submitted === o.id ? 'checked' : ''} required><span>${esc(o.text)}</span></label>`).join('')}</div><div class="quiz-actions"><button class="btn primary" type="submit">${submitted ? '再次提交判断' : '提交我的判断'}${icon('arrow')}</button><span class="support-label">${entry?.attempts ? `本节已提交 ${entry.attempts} 次` : '选择一个答案后查看解释'}</span></div>${option ? `<div class="feedback ${correct ? '' : 'wrong'}" role="status"><strong>${correct ? '判断正确，学习进度已保存。' : '再想一步。你可以重新选择答案。'}</strong>${esc(option.feedback)}${entry.completed && !correct ? '<div class="small-note">你此前已经完成本节，本次复习不会清除完成状态。</div>' : ''}</div>` : ''}</form>
    <div class="lesson-actions">${index > 0 ? `<a class="btn ghost" href="#learn/${encodeURIComponent(course.id)}/${encodeURIComponent(course.lessons[index - 1].id)}">← 上一节</a>` : '<span></span>'}${index < course.lessons.length - 1 ? entry?.completed ? `<a class="btn secondary" href="#learn/${encodeURIComponent(course.id)}/${encodeURIComponent(course.lessons[index + 1].id)}">下一节 ${icon('arrow')}</a>` : '<span class="support-label">答对练习后，可进入下一节 →</span>' : p.percent === 100 ? '<a class="btn secondary" href="#activity">查看学习记录 →</a>' : '<span class="support-label">完成全部练习后查看课程成果</span>'}</div><p class="small-note">思考题用于自主练习，不收集书面答案；情境选择会记录本地学习事件。</p></article></div>${footer()}`;
}
function renderTeacher() {
  return `${heading('MAKE LEARNING POSSIBLE', '把一个主题，变成一次学习。', '组织微课程，核对内容与练习，再发布到当前浏览器的课程库。')}
    <div class="notice"><strong>本地规则演示</strong>　此处使用固定规则组织三节草稿，不调用大模型，也不检索事实。教师需要补充和核实主题知识。真实生成式 AI、账号权限与多人共享属于后续计划。</div>
    <div class="teacher-grid"><section class="panel teacher-input"><h2>创建课程草稿</h2><p>给出主题、学习者背景与目标。</p><form id="generate-form"><div class="teacher-form-grid"><div class="field"><label for="topic">课程主题</label><input id="topic" name="topic" required minlength="2" maxlength="60" placeholder="例如：API 需求澄清" value="API 需求澄清"><small>2–60 个字符；从一个具体问题开始。</small></div><div class="field"><label for="audience">学习者背景</label><input id="audience" name="audience" required minlength="2" maxlength="120" value="刚开始团队项目的软件工程学生"><small>已有知识、学习情境或需要的支持。</small></div><div class="field wide"><label for="goal">可观察的学习目标</label><textarea id="goal" name="goal" required minlength="5" maxlength="240" rows="3">能够为课程发布 API 写出成功与失败的验收条件</textarea><small>5–240 个字符；说明学完后能够做什么。</small></div></div><div id="generate-error" aria-live="polite"></div><button class="btn primary" type="submit">${icon('spark')}用规则模板生成草稿</button><p class="small-note">不需要 API 密钥。已有草稿会先询问再替换。</p></form>
    ${state.courses.length ? `<div class="edit-section"><label class="field-label" for="edit-course">继续编辑已发布课程</label><div class="field" style="margin-top:9px"><select id="edit-course"><option value="">选择课程…</option>${state.courses.map(c => `<option value="${esc(c.id)}">${esc(c.title)}</option>`).join('')}</select></div></div>` : ''}
    <div class="workspace-note">${icon('book')}<span>流程：生成草稿 → 教师修改 → 核对练习 → 发布课程。学生学习时看到的是发布时的版本。</span></div></section>
    <section class="panel ${state.draft ? '' : 'draft-placeholder'}" aria-label="课程草稿编辑">${state.draft ? renderEditor(state.draft) : `<span class="placeholder-icon">${icon('edit')}</span><h3>第一门自建课程，从这里开始</h3><p>填写左侧信息，即可获得三节可编辑内容和配套情境练习。把具体案例和你的教学判断加进去。</p><span class="badge">教师核对之后，再发布</span>`}</section></div>${footer()}`;
}
function renderEditor(draft) {
  return `<div class="section-head"><div><span class="badge">本地规则草稿 · 可手动编辑</span><h2>预览与编辑</h2></div><button type="button" class="btn ghost small" data-action="discard">移除草稿</button></div><p>草稿字段会在修改后保存；发布前需明确核对。发布后的修改需再次发布才会更新课程库。</p><form id="draft-form"><div class="field"><label for="draft-title">课程标题</label><input id="draft-title" name="title" value="${esc(draft.title)}" required minlength="2" maxlength="100"></div><div class="field"><label for="draft-summary">课程简介</label><textarea id="draft-summary" name="summary" required minlength="10" maxlength="500" rows="3">${esc(draft.summary)}</textarea></div>${draft.lessons.map((l, i) => `<details class="edit-section" ${i === 0 ? 'open' : ''}><summary>第 ${i + 1} 节 · ${esc(l.title)}</summary><div class="field"><label for="lesson-title-${i}">章节标题</label><input id="lesson-title-${i}" name="lesson-title-${i}" value="${esc(l.title)}" required minlength="2" maxlength="100"></div><div class="field"><label for="lesson-body-${i}">章节内容</label><textarea id="lesson-body-${i}" name="lesson-body-${i}" required minlength="20" maxlength="5000" rows="6">${esc(l.body.join('\n\n'))}</textarea><small>请补充经过核实的概念与具体案例；空行分段。</small></div><div class="field"><label for="lesson-task-${i}">思考题</label><input id="lesson-task-${i}" name="lesson-task-${i}" value="${esc(l.task)}" required maxlength="300"></div><div class="readonly-quiz"><strong>配套情境练习 · 发布前核对</strong><p>${esc(l.question.prompt)}</p>${l.question.options.map(o => `<p>${o.id === l.question.correctId ? '✓' : '○'} ${esc(o.text)}<br><span style="color:#8b967f">解释：${esc(o.feedback)}</span></p>`).join('')}</div><p class="small-note">当前编辑器支持标题、正文和思考题；情境选择由规则模板提供。</p></details>`).join('')}<label class="review-check"><input id="reviewed" name="reviewed" type="checkbox" value="yes"><span>我已核对并补充课程的事实、具体案例与练习，确认可供本地演示学习。</span></label><div id="draft-error" aria-live="polite"></div><div class="actions-row"><button type="submit" name="intent" value="save" class="btn secondary">保存草稿</button><button type="submit" name="intent" value="publish" class="btn primary">发布到课程库 ${icon('arrow')}</button><span class="saved-label">仅保存于当前浏览器</span></div></form>`;
}
const eventLabels = { open: '打开章节', answer: '提交判断', complete: '完成章节', draft: '生成规则草稿', publish: '发布课程', edit: '保存草稿' };
function renderActivity() {
  const answers = state.events.filter(e => e.type === 'answer');
  const completed = allCourses().reduce((n, c) => n + courseProgress(c, state.progress).completed, 0);
  const studied = allCourses().filter(c => state.events.some(e => ['open', 'answer'].includes(e.type) && e.courseId === c.id)).length;
  return `${heading('SMALL STEPS, VISIBLE PROGRESS', '每一次练习，都留下足迹。', '以下统计来自当前浏览器的实际操作；尚未产生的记录会保持为空。', '<button class="btn secondary" data-action="export">'+icon('download')+'导出记录</button>')}
    <section class="stats" aria-label="本地参与统计">${stat(studied, '门', '实际打开的课程', 'book')}${stat(answers.length, '次', '已提交的情境判断', 'edit', 'coral')}${stat(completed, '节', '已答对并完成的章节', 'check', 'gold')}</section>
    <div class="activity-layout"><section class="panel"><div class="section-head"><h2>活动记录</h2><span class="section-caption">最近 ${Math.min(state.events.length, 30)} 条 / 已保存 ${state.events.length} 条</span></div>${state.events.length ? `<div class="table-scroll"><table class="activity-table"><thead><tr><th scope="col">内容</th><th scope="col">活动</th><th scope="col">结果</th><th scope="col">本地时间</th></tr></thead><tbody>${[...state.events].reverse().slice(0, 30).map(e => { const c = courseById(e.courseId) || (state.draft?.id === e.courseId ? state.draft : null); const l = c?.lessons.find(x => x.id === e.lessonId); return `<tr><td>${esc(l?.title || c?.title || '课程草稿')}</td><td><span class="activity-type ${e.type === 'answer' && !e.correct ? 'warm' : ''}">${esc(eventLabels[e.type] || '学习活动')}</span></td><td>${e.type === 'answer' ? e.correct ? '答对 · 已记录' : '待理解 · 可重试' : e.type === 'complete' ? '完成状态已保存' : '已记录'}</td><td>${Number.isNaN(Date.parse(e.at)) ? '时间不可用' : esc(formatDate(e.at))}</td></tr>`; }).join('')}</tbody></table></div>` : `<div class="empty"><h3>第一条记录，等你开始</h3><p>打开课程并提交一次判断后，这里会显示真实学习事件。</p><a class="btn primary" href="${learnHref(seedCourses[0])}">开始一节微课 ${icon('arrow')}</a></div>`}<p class="small-note">记录上限为最近 500 个事件，列表显示最近 30 条。统计不是多用户参与率，也不代表学习时长或学习效果。</p></section>
    <aside class="activity-aside"><section class="panel"><h2 style="font-size:16px">课程完成进度</h2><div class="progress-list">${allCourses().map(c => { const p = courseProgress(c, state.progress); return `<div><h3>${esc(c.title)}</h3><div class="progress-info"><span>${p.completed} / ${p.total} 节</span><span>${p.percent}%</span></div><div class="progress" role="progressbar" aria-label="${esc(c.title)}完成进度" aria-valuenow="${p.percent}" aria-valuemin="0" aria-valuemax="100"><span style="width:${p.percent}%"></span></div></div>`; }).join('')}</div></section><section class="panel" style="margin-top:18px"><h2 style="font-size:16px">原型的下一步</h2><ul class="scope-list"><li>真实生成式 AI 与质量评估</li><li>账号、角色与班级管理</li><li>学生导入与跨设备同步</li><li>真实用户测试与迭代</li></ul><p class="activity-note">这些功能当前尚未实现。此页面只呈现当前浏览器的学习与课程操作。</p><button class="btn danger small" data-action="reset">重置本地演示数据</button><p class="small-note">需二次确认；会清除自建课程、草稿、学习进度和活动记录。</p></section></aside></div>${footer()}`;
}
function draftFromForm(form) {
  const data = new FormData(form), draft = structuredClone(state.draft);
  draft.title = String(data.get('title') || '').trim();
  draft.summary = String(data.get('summary') || '').trim();
  draft.lessons.forEach((l, i) => { l.title = String(data.get(`lesson-title-${i}`) || '').trim(); l.body = String(data.get(`lesson-body-${i}`) || '').trim().split(/\n\s*\n/).filter(Boolean); l.task = String(data.get(`lesson-task-${i}`) || '').trim(); });
  return draft;
}
function showError(id, message) { const node = document.getElementById(id); node.className = 'field-error'; node.textContent = message; node.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
app.addEventListener('click', e => {
  const b = e.target.closest('[data-action]'); if (!b) return;
  if (b.dataset.action === 'filter') { filter = b.dataset.filter; render(); document.querySelector(`[data-filter="${filter}"]`)?.focus({ preventScroll: true }); }
  if (b.dataset.action === 'discard' && confirm('移除当前草稿？已发布课程仍会保留。')) { state.draft = null; save(); render(); toast('当前草稿已移除。'); }
  if (b.dataset.action === 'reset' && confirm('确认清除这个浏览器中 LearnLoop 的全部自建课程、草稿、学习进度和活动记录？此操作无法撤销。')) { state = initialState(); filter = '全部课程'; save(); render(); toast('本地演示数据已清空。'); }
  if (b.dataset.action === 'export') {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), scope: '仅当前浏览器的本地原型数据', ...state }, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = `learnloop-local-records-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('本地记录已导出为 JSON。');
  }
});
app.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  if (form.id === 'quiz-form') {
    const answer = new FormData(form).get('answer'); if (!answer) return;
    const result = recordAnswer(state, courseById(form.dataset.course), form.dataset.lesson, answer);
    state = result.state; save(); const scroll = window.scrollY; render(); window.scrollTo(0, scroll); const feedback = document.querySelector('.feedback'); if (feedback) { feedback.tabIndex = -1; feedback.focus({ preventScroll: true }); feedback.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }
  if (form.id === 'generate-form') {
    if (state.draft && !confirm('生成新草稿会替换当前草稿。已发布课程不受影响。继续吗？')) return;
    try { state.draft = createDraft(Object.fromEntries(new FormData(form))); event('draft', { courseId: state.draft.id }); render(); toast('三节规则草稿已生成。请补充主题知识并核对练习。'); document.querySelector('#draft-title')?.focus({ preventScroll: true }); }
    catch (error) { showError('generate-error', error.message); }
  }
  if (form.id === 'draft-form') {
    try {
      const oldError = document.querySelector('#draft-error'); oldError.textContent = ''; oldError.className = '';
      const draft = draftFromForm(form);
      const check = validateCourse(draft); if (!check.ok) throw new Error(check.error);
      state.draft = draft;
      if (e.submitter?.value === 'publish') { state = publishDraft(state, draft, new FormData(form).get('reviewed') === 'yes'); save(); location.hash = '#courses'; filter = '全部课程'; toast('课程已发布到本地课程库，可以开始学习。'); }
      else { event('edit', { courseId: draft.id }); toast('课程草稿已保存。'); }
    } catch (error) { showError('draft-error', error.message); }
  }
});
app.addEventListener('change', e => {
  if (e.target.id === 'course-switch') { const course = courseById(e.target.value); if (course) location.hash = learnHref(course); }
  if (e.target.id === 'edit-course' && e.target.value) {
    if (state.draft && state.draft.id !== e.target.value && !confirm('切换课程会替换当前草稿。继续吗？')) { e.target.value = ''; return; }
    state.draft = structuredClone(state.courses.find(c => c.id === e.target.value)); save(); render(); toast('已载入发布版本；修改后请重新发布。');
  }
  if (e.target.closest('#draft-form') && e.target.name !== 'reviewed') { state.draft = draftFromForm(document.querySelector('#draft-form')); save(); const reviewed = document.querySelector('#reviewed'); if (reviewed) reviewed.checked = false; }
});
function onRouteChange() {
  const route = getRoute();
  if (route.page === 'learn') { const c = courseById(route.courseId) || continueCourse(); const l = c.lessons.find(x => x.id === route.lessonId) || nextLesson(c); event('open', { courseId: c.id, lessonId: l.id }); }
  render({ focus: true }); window.scrollTo(0, 0);
}
window.addEventListener('hashchange', onRouteChange);
onRouteChange();
