import test from 'node:test';
import assert from 'node:assert/strict';
import { seedCourses, initialState, normalizeState, courseProgress, recordAnswer, createDraft, publishDraft, validateCourse } from '../web/domain.mjs';

test('all built-in courses have valid content and unique course and lesson IDs', () => {
  assert.equal(new Set(seedCourses.map(c => c.id)).size, 3);
  for (const course of seedCourses) { assert.equal(validateCourse(course).ok, true); assert.equal(course.lessons.length, 3); assert.equal(new Set(course.lessons.map(l => l.id)).size, 3); }
});
test('incorrect attempt does not complete a lesson; correct answers persist and repeated attempts do not duplicate completion', () => {
  const c = seedCourses[0], l = c.lessons[0], s = initialState();
  const wrong = l.question.options.find(o => o.id !== l.question.correctId).id;
  const a = recordAnswer(s, c, l.id, wrong);
  assert.equal(a.correct, false); assert.equal(courseProgress(c, a.state.progress).completed, 0); assert.equal(s.events.length, 0);
  const b = recordAnswer(a.state, c, l.id, l.question.correctId);
  assert.equal(courseProgress(c, b.state.progress).percent, 33); assert.equal(b.state.progress[c.id][l.id].attempts, 2);
  const d = recordAnswer(b.state, c, l.id, wrong);
  assert.equal(courseProgress(c, d.state.progress).completed, 1); assert.equal(d.state.events.filter(e => e.type === 'complete').length, 1);
  const reloaded = normalizeState(JSON.parse(JSON.stringify(d.state)));
  assert.equal(courseProgress(c, reloaded.progress).completed, 1);
});
test('unknown answers are rejected without mutating state', () => {
  const s = initialState(); assert.throws(() => recordAnswer(s, seedCourses[0], 'unknown', 'a')); assert.throws(() => recordAnswer(s, seedCourses[0], 'problem', 'unknown')); assert.equal(s.events.length, 0);
});
test('completing every chapter produces 100 percent', () => {
  const c = seedCourses[0]; let s = initialState(); for (const l of c.lessons) s = recordAnswer(s, c, l.id, l.question.correctId).state;
  assert.deepEqual(courseProgress(c, s.progress), { completed: 3, total: 3, percent: 100 });
});
const input = { topic: 'API 验收条件', audience: '软件工程新生', goal: '为 API 写出成功和失败的验收条件' };
test('rule drafts use user context and validate input', () => {
  const d = createDraft(input, 'test-course'); assert.equal(d.id, 'test-course'); assert.equal(d.source, 'local-rule'); assert.equal(d.lessons.length, 3); assert.ok(d.summary.includes(input.audience)); assert.ok(d.intro.includes(input.goal)); assert.equal(validateCourse(d).ok, true);
  assert.throws(() => createDraft({ ...input, topic: ' ' })); assert.throws(() => createDraft({ ...input, goal: '短' })); assert.throws(() => createDraft({ ...input, audience: 'a'.repeat(121) }));
});
test('publishing requires review and valid contents, updating a course retains a single entry', () => {
  const s = initialState(), d = createDraft(input, 'test-course');
  assert.throws(() => publishDraft(s, d, false)); assert.throws(() => publishDraft(s, { ...d, title: '' }, true));
  const a = publishDraft(s, d, true); assert.equal(a.courses.length, 1); assert.equal(s.courses.length, 0);
  d.title = '已修改的课程'; const b = publishDraft(a, d, true); assert.equal(b.courses.length, 1); assert.equal(b.courses[0].title, d.title);
  const reloaded = normalizeState(JSON.parse(JSON.stringify(b))); assert.equal(reloaded.courses.length, 1);
});
test('invalid or incompatible stored state falls back safely', () => {
  assert.deepEqual(normalizeState(null), initialState()); assert.deepEqual(normalizeState({ version: 99 }), initialState());
  assert.equal(normalizeState({ ...initialState(), courses: [{ title: '' }] }).courses.length, 0);
});
test('malformed nested course or draft data is discarded while incomplete editable drafts survive', () => {
  assert.equal(normalizeState({ ...initialState(), draft: { lessons: [null] } }).draft, null);
  const bad = createDraft(input, 'bad-course'); delete bad.objectives;
  assert.equal(validateCourse(bad).ok, false);
  assert.equal(normalizeState({ ...initialState(), courses: [bad] }).courses.length, 0);
  const incomplete = createDraft(input, 'incomplete-course'); incomplete.title = ''; incomplete.lessons[0].body = [];
  assert.equal(validateCourse(incomplete).ok, false);
  assert.equal(normalizeState({ ...initialState(), draft: incomplete }).draft.id, 'incomplete-course');
  const missingQuestion = createDraft(input, 'bad-question'); missingQuestion.lessons[0].question.options = [null];
  assert.equal(normalizeState({ ...initialState(), draft: missingQuestion }).draft, null);
});
