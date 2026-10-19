export const STORAGE_KEY = 'learnloop.v1';

const question = (prompt, options, correctId) => ({ prompt, options: options.map(([id, text, feedback]) => ({ id, text, feedback })), correctId });

export const seedCourses = [
  {
    id: 'user-stories', title: '把模糊需求变成用户故事', category: '软件工程', level: '入门', duration: '12 分钟', color: 'teal', tag: '从需求开始',
    summary: '从一句“做一个更好用的平台”，走到可讨论、可验证、可交付的需求。',
    intro: '场景：你们正在为一个学生团队开发学习平台。先理解用户要完成的事，再讨论界面和技术。',
    objectives: ['区分用户问题与功能方案', '写出含角色、目标与价值的用户故事', '用可观察的验收条件控制范围'],
    lessons: [
      { id: 'problem', title: '先问问题，再选功能', body: ['“加一个 AI 聊天框”是一个方案，还不是用户需求。先问：谁在什么情境下遇到了什么困难？目前如何处理？成功时会有什么变化？', '例如：学生复习用户故事时，能背诵句式，却不会判断验收条件是否清晰。我们要解决的是应用知识的困难，而不只是增加聊天入口。'], task: '把“需要一个智能学习平台”改写成一个具体的学习困难。', question: question('导师说：“平台应该加个排行榜。”你最适合先做什么？', [['a', '立即实现积分和排名', '这跳过了问题确认；排行也可能让部分学习者失去动力。'], ['b', '询问希望改善哪类学习行为，并听取学习者的实际经历', '对。先弄清问题、情境与预期行为，再选择有依据的方案。'], ['c', '选一个流行的排行榜组件', '组件只能解决实现问题，无法证明这个功能有必要。']], 'b') },
      { id: 'story', title: '写出用户故事的价值', body: ['用户故事可使用“作为［角色］，我希望［完成什么］，以便［获得什么价值］”的句式。它是讨论的起点，不是完整规格书。', '示例：作为第一次学习需求分析的学生，我希望对一个需求案例作出判断并看到解释，以便发现自己遗漏的验收条件。角色要具体，目标应描述用户行动，价值要说明为什么值得做。'], task: '为“教师查看学习情况”写一个包含具体价值的用户故事。', question: question('哪一个故事更适合进入团队讨论？', [['a', '作为用户，我希望系统很好用，以便我感觉不错', '角色、行为和价值都太宽泛，难以形成验收条件。'], ['b', '作为开发者，我希望使用 React，以便使用 React', '这是技术选择，尚未说明学习平台用户得到的价值。'], ['c', '作为课程教师，我希望识别尚未完成练习的学生，以便安排有针对性的辅导', '对。角色、行动和价值清楚，还需继续讨论数据权限与判断标准。']], 'c') },
      { id: 'acceptance', title: '让验收条件可验证', body: ['验收条件说明什么情况下故事可以被接受。可使用 Given / When / Then：给定初始情境，当发生某个行为，那么出现可观察的结果。', '示例：给定学习者已答完当前练习，当选择正确答案，那么显示解释、将本节标记为完成，并在刷新后保留进度。不要把“体验很好”当成验收条件。还要讨论错误答案、空输入和权限等边界。'], task: '为“教师发布课程”写一个成功条件和一个输入无效的边界条件。', question: question('哪条验收条件最容易由团队验证？', [['a', '课程发布要很流畅', '“流畅”缺少可测标准，团队成员可能理解不同。'], ['b', '课程标题为空时，点击发布后显示错误，并且课程库中不新增课程', '对。触发条件、操作和预期结果都可以观察与验证。'], ['c', '所有用户都会喜欢课程', '无法作为一次交付的可验证条件。']], 'b') },
    ],
  },
  {
    id: 'ai-agents', title: '与 AI 编程代理有效协作', category: 'AI 编程', level: '入门', duration: '15 分钟', color: 'coral', tag: '把判断留在团队',
    summary: '练习给出上下文、拆分任务、审查代码与验证结果，让 AI 协作可以解释、可以检查。',
    intro: '场景：AI 编程代理即将为团队实现一个课程发布功能。你需要定义工作边界，并对结果负责。',
    objectives: ['给代理提供目标、上下文与验收标准', '用小步任务控制实现范围', '检查 AI 输出并记录依据'],
    lessons: [
      { id: 'brief', title: '把任务说明写清楚', body: ['有效任务说明包含目标、现有环境、约束和验收标准。与其说“做好课程发布”，不如说明输入字段、错误处理、存储方式和如何验收。', '示例：在本地静态原型中实现课程发布；标题和正文不能为空；保存到当前浏览器；刷新后保留；禁止加入密钥；提交前说明修改与验证结果。不要把真实学生隐私、密码或访问令牌放进提示词。'], task: '为“完成一道练习后保存进度”写四句话的任务说明。', question: question('准备让代理修改项目时，哪项信息最有帮助？', [['a', '“你是世界上最好的工程师，直接做完”', '角色描述无法替代项目上下文和验收标准。'], ['b', '把账户密码发给代理，避免它询问', '不应提供不必要的秘密；应按最小权限提供工作环境。'], ['c', '描述现有存储方式、需改变的行为、边界条件和验收步骤', '对。这些信息让工作范围和验证方式都明确。']], 'c') },
      { id: 'scope', title: '一次做一个可检查的改变', body: ['把任务拆成可运行、可检查的小步：先明确数据结构，再实现保存，最后连接界面。每一步保留可比较的修改，避免一次改动许多无关模块。', '代理报告“完成”不等于需求已满足。阅读实际差异，检查范围是否扩大，运行与改动相关的测试，并手动体验关键路径。对于不理解的代码，要求解释，再由团队判断。'], task: '将“做完教师工作台”拆成三个有明确验收结果的小任务。', question: question('代理实现保存进度时顺便替换了全站框架。你应该如何处理？', [['a', '因为更新，全部接受', '新并不意味着符合本次任务；大范围变化会增加验证成本。'], ['b', '检查变更理由与影响，撤除无依据的范围扩张，再验证保存流程', '对。范围和责任仍由团队控制。'], ['c', '只看代理最后的总结', '总结不能替代对实际代码与行为的检查。']], 'b') },
      { id: 'verify', title: '用证据评价 AI 输出', body: ['验证应覆盖正常路径和关键失败路径。例如：正确答案保存完成状态；错误答案不能直接解锁完成；刷新后进度保留；恶意输入作为文本显示。', '记录你用了什么 AI、完成了什么、为什么采纳或修改输出，以及用什么证据验证。课程项目中的 AI Fluency 反思可围绕任务委派、描述、辨别与尽责展开，但应使用教师指定框架的准确表述。'], task: '为一次 AI 生成的修改写一条“采纳理由 + 验证证据 + 尚未验证内容”的记录。', question: question('代理生成了一个通过现有测试的改动，下一步最合理的是？', [['a', '直接声称系统完全安全、没有缺陷', '测试只能支持其覆盖的行为，不能证明不存在其他缺陷。'], ['b', '查看测试覆盖的行为、审查差异，并检查真实用户操作和相关失败路径', '对。多种证据共同支持结论，同时说明验证边界。'], ['c', '让同一个代理说一次“没有问题”就足够', '自我声明不提供独立的行为证据。']], 'b') },
    ],
  },
  {
    id: 'team-product', title: '在团队里做出有依据的产品决定', category: '协作与软技能', level: '入门', duration: '12 分钟', color: 'gold', tag: '小步协作',
    summary: '练习范围排序、可追踪的任务分工与反馈闭环，为团队项目形成共同的判断依据。',
    intro: '场景：四人团队要在有限时间内准备进度讨论。大家提出了许多功能，但还没有跑通核心学习流程。',
    objectives: ['围绕用户价值确定最小可行范围', '让分工、产出和验收能够追踪', '把真实反馈转化为下一次迭代'],
    lessons: [
      { id: 'priorities', title: '先证明核心学习循环', body: ['最小可行原型应让关键假设可以被检查。本项目的核心循环是：选择课程 → 阅读短内容 → 作出判断 → 获得解释 → 查看进度。界面数量多不等于这个循环有效。', '按用户价值、依赖关系、工作量和风险排序。在核心循环可运行前，排行榜、徽章和复杂动画可以后置。明确“本次实现”和“计划实现”，有助于讨论真实进度。'], task: '为第 8／9 周讨论列出三项必须展示的行为和两项后续功能。', question: question('讨论前只剩两天，核心练习尚不能保存。团队应该优先做什么？', [['a', '新增五个页面，让演示看起来丰富', '页面数量无法弥补核心行为不完整。'], ['b', '修通练习、反馈和保存路径，并如实说明尚未完成的功能', '对。这能形成可检查的阶段成果。'], ['c', '填入模拟学生数据，证明很多人在使用', '不能把虚构记录当成真实使用证据。']], 'b') },
      { id: 'ownership', title: '把分工变成可验收的任务', body: ['“负责前端”过于笼统。更可执行的任务包括负责人、产出、依赖、完成条件和预计检查时间。例如：负责人 A 实现课程列表；完成条件为三门课程可打开、空状态有解释、窄屏可操作。', '任务负责人不等于独自完成所有工作。通过小范围提交、同伴审查和共同演示，团队能分享知识并留下真实贡献记录。分工须由成员确认，不应以占位角色冒充实际贡献。'], task: '把“做测试”改成一条可以交接给队友的任务。', question: question('哪种分工记录最适合进度讨论？', [['a', '四个人都写“参与开发”', '无法理解具体责任、产出和相互依赖。'], ['b', '某成员已完成访谈，但实际尚未联系用户', '计划和事实应分开记录。'], ['c', '记录具体负责人、关联产出、验收标准，并明确待确认项', '对。这既便于协作，也能如实说明进度。']], 'c') },
      { id: 'feedback', title: '让反馈形成闭环', body: ['用户测试应围绕任务，而不只问“你喜欢吗”。让参与者尝试完成一节微课，观察在哪里犹豫、误解或无法继续，再询问原因。事先征得参与同意，避免收集不必要的个人信息。', '将反馈写成“观察 → 推测 → 改动 → 验证计划”。例如：观察到两人找不到反馈；推测视觉层级不清；将解释紧随选项显示；下轮观察是否能主动说出错误原因。没有开展测试时，只能写测试计划。'], task: '为本平台设计一个 5 分钟任务测试，写明观察重点和成功标准。', question: question('你还没开展用户测试，报告应该如何呈现？', [['a', '写“用户普遍满意”，因为团队都喜欢', '团队评价不能替代真实参与者证据。'], ['b', '明确尚未测试，列出任务脚本、招募方式和后续验证标准', '对。如实说明现状，并给出可以执行的下一步。'], ['c', '编造访谈引语补足报告', '虚构引语无法作为项目证据。']], 'b') },
    ],
  },
];

export function initialState() { return { version: 1, courses: [], progress: {}, events: [], draft: null }; }
export function normalizeState(value) {
  if (!value || value.version !== 1 || !Array.isArray(value.courses) || !Array.isArray(value.events)) return initialState();
  const knownIds = new Set(seedCourses.map(c => c.id));
  const courses = value.courses.filter(c => { if (!validateCourse(c).ok || knownIds.has(c.id)) return false; knownIds.add(c.id); return true; });
  const progress = {};
  for (const c of [...seedCourses, ...courses]) {
    for (const l of c.lessons) {
      const saved = value.progress?.[c.id]?.[l.id];
      if (!saved || typeof saved !== 'object') continue;
      progress[c.id] ||= {};
      progress[c.id][l.id] = { completed: saved.completed === true, attempts: Number.isSafeInteger(saved.attempts) && saved.attempts >= 0 ? saved.attempts : 0, lastAnswer: l.question.options.some(o => o.id === saved.lastAnswer) ? saved.lastAnswer : null, updatedAt: Number.isNaN(Date.parse(saved.updatedAt)) ? null : saved.updatedAt };
    }
  }
  const eventTypes = new Set(['open', 'answer', 'complete', 'draft', 'publish', 'edit']);
  return { version: 1, courses, progress, events: value.events.filter(e => e && eventTypes.has(e.type) && typeof e.at === 'string' && !Number.isNaN(Date.parse(e.at))).slice(-500), draft: hasCourseShape(value.draft) ? value.draft : null };
}
export function courseProgress(course, progress) {
  const entry = progress[course.id] || {};
  const completed = course.lessons.filter(l => entry[l.id]?.completed === true).length;
  return { completed, total: course.lessons.length, percent: Math.round(completed / course.lessons.length * 100) };
}
export function recordAnswer(state, course, lessonId, answerId, now = new Date().toISOString()) {
  const lesson = course.lessons.find(l => l.id === lessonId);
  if (!lesson || !lesson.question.options.some(o => o.id === answerId)) throw new Error('练习或选项无效。');
  const correct = answerId === lesson.question.correctId;
  const previous = state.progress[course.id]?.[lessonId] || {};
  const next = structuredClone(state);
  next.progress[course.id] = { ...(next.progress[course.id] || {}), [lessonId]: { completed: previous.completed === true || correct, attempts: (Number(previous.attempts) || 0) + 1, lastAnswer: answerId, updatedAt: now } };
  next.events.push({ type: 'answer', courseId: course.id, lessonId, correct, at: now });
  if (correct && !previous.completed) next.events.push({ type: 'complete', courseId: course.id, lessonId, at: now });
  next.events = next.events.slice(-500);
  return { state: next, correct, feedback: lesson.question.options.find(o => o.id === answerId).feedback };
}
const clean = v => typeof v === 'string' ? v.trim() : '';
const validId = id => typeof id === 'string' && /^[a-z0-9][a-z0-9-]{0,79}$/.test(id) && !['constructor', 'prototype'].includes(id);
function hasCourseShape(course) {
  if (!course || !validId(course.id)) return false;
  if (!['title', 'summary', 'category', 'level', 'duration', 'color', 'tag', 'intro'].every(k => typeof course[k] === 'string')) return false;
  if (!Array.isArray(course.objectives) || !course.objectives.every(o => typeof o === 'string')) return false;
  if (!Array.isArray(course.lessons) || course.lessons.length < 1 || course.lessons.length > 20) return false;
  if (new Set(course.lessons.map(l => l?.id)).size !== course.lessons.length) return false;
  return course.lessons.every(l => l && validId(l.id) && typeof l.title === 'string' && typeof l.task === 'string' && Array.isArray(l.body) && l.body.every(p => typeof p === 'string') && l.question && typeof l.question.prompt === 'string' && Array.isArray(l.question.options) && l.question.options.length >= 2 && l.question.options.length <= 6 && new Set(l.question.options.map(o => o?.id)).size === l.question.options.length && l.question.options.every(o => o && validId(o.id) && typeof o.text === 'string' && typeof o.feedback === 'string') && l.question.options.some(o => o.id === l.question.correctId));
}
export function createDraft(input, id = `local-${Date.now()}`) {
  const topic = clean(input.topic), audience = clean(input.audience), goal = clean(input.goal);
  if (topic.length < 2 || topic.length > 60) throw new Error('主题需要 2–60 个字符。');
  if (audience.length < 2 || audience.length > 120) throw new Error('学习者背景需要 2–120 个字符。');
  if (goal.length < 5 || goal.length > 240) throw new Error('学习目标需要 5–240 个字符。');
  return { id, title: `${topic}：从理解到应用`, category: '教师自建', level: '入门', duration: '10 分钟', color: 'teal', tag: '本地规则草稿', source: 'local-rule', summary: `面向${audience}，围绕“${goal}”组织的三步练习。教师需在发布前核对并补充主题知识。`, intro: `本课由本地固定规则组织结构，不包含大模型推理或外部资料检索。主题：${topic}。学习目标：${goal}。`, objectives: [`说清楚“${topic}”所解决的问题`, `结合案例完成目标：${goal}`, '说明判断依据与需要进一步验证的内容'], lessons: [
    { id: 'understand', title: `界定${topic}的任务`, body: [`从一个具体任务出发学习“${topic}”。先写下谁需要完成这件事、所处的情境，以及当前遇到的困难。学习对象为${audience}。`, `本节目标是将“${goal}”转化为可以观察的行为。请教师在这里补充经过核实的核心概念、术语与一个贴近学习者的例子。`], task: `用一句话描述一个与“${topic}”有关的具体问题，并说明何种结果代表成功。`, question: question(`开始学习“${topic}”之前，哪种做法最有助于确认方向？`, [['a', '先界定具体情境、已有知识和可观察的目标', '对。清晰的情境和目标能帮助判断后续内容是否有用。'], ['b', '只记录术语，不讨论如何应用', '术语可以辅助理解，但还需要与实际目标建立联系。'], ['c', '默认所有学习者的背景完全相同', '不同背景需要不同解释和支持；应先确认已有知识。']], 'a') },
    { id: 'apply', title: '用一个案例练习', body: [`选择一个与“${topic}”相关、范围足够小的案例。先写出输入、约束与预期产出，再尝试完成“${goal}”。`, '请教师补充一个具体案例和参考推理过程。比较不同方案时，关注证据、适用条件与限制，而不只看答案是否看起来完整。'], task: '记录一次实际尝试：你做了什么决定、依据是什么、还缺少什么证据。', question: question('两个方案看起来都能完成目标，应该如何选择？', [['a', '选文字最多的方案', '文字数量不能证明方案适合当前情境。'], ['b', '根据任务约束比较证据，并说明取舍', '对。选择应与目标和具体约束有关。'], ['c', '不检查依据，直接选择第一个', '应解释为何选择，并验证关键假设。']], 'b') },
    { id: 'reflect', title: '验证结果并说明边界', body: [`回顾“${goal}”：实际产出是否满足一开始定义的成功条件？列出一个正常情况与一个边界情况，分别检查结果。`, '请教师补充主题特定的检查方法与常见误区。保留检查记录；区分已经验证的结论、个人推测和后续计划。'], task: '写下一个已验证的结论、一项尚未验证的假设和下一步行动。', question: question('目前只完成了一个案例，怎样表述结果更准确？', [['a', '宣布已经掌握全部相关内容', '一个案例不能支持对全部内容的结论。'], ['b', '省略不足，避免别人提问', '清楚说明边界能让后续改进更有针对性。'], ['c', '说明本次案例的结果、证据与尚未验证的范围', '对。结论应当与实际证据相匹配。']], 'c') },
  ] };
}
export function validateCourse(course) {
  if (!hasCourseShape(course)) return { ok: false, error: '课程结构不完整，请重新生成草稿。' };
  if (!course || clean(course.title).length < 2 || clean(course.title).length > 100) return { ok: false, error: '课程标题需要 2–100 个字符。' };
  if (clean(course.summary).length < 10 || clean(course.summary).length > 500) return { ok: false, error: '课程简介需要 10–500 个字符。' };
  if (!Array.isArray(course.lessons) || !course.lessons.length) return { ok: false, error: '课程至少需要一节内容。' };
  for (const [i, l] of course.lessons.entries()) {
    if (clean(l.title).length < 2 || clean(l.title).length > 100 || !Array.isArray(l.body) || clean(l.body.join('\n')).length < 20 || l.body.join('\n').length > 5000) return { ok: false, error: `第 ${i + 1} 节需要有效标题和 20–5000 个字符的正文。` };
    if (!l.question || !Array.isArray(l.question.options) || l.question.options.length < 2 || !l.question.options.some(o => o.id === l.question.correctId)) return { ok: false, error: `第 ${i + 1} 节练习不完整。` };
  }
  return { ok: true };
}
export function publishDraft(state, draft, reviewed) {
  if (!reviewed) throw new Error('请先确认已核对课程内容、案例和练习。');
  const result = validateCourse(draft);
  if (!result.ok) throw new Error(result.error);
  const next = structuredClone(state);
  const published = { ...structuredClone(draft), tag: '教师自建课程', publishedAt: new Date().toISOString() };
  const index = next.courses.findIndex(c => c.id === published.id);
  if (index < 0) next.courses.push(published); else next.courses[index] = published;
  next.draft = structuredClone(published);
  next.events.push({ type: 'publish', courseId: published.id, at: published.publishedAt });
  next.events = next.events.slice(-500);
  return next;
}
