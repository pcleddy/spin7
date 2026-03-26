const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getSpellAnalysis,
  scoreWord,
  buildPreviewText,
} = require('../game_logic.js');

test('getSpellAnalysis allows one missing letter family with a joker', () => {
  const ok = getSpellAnalysis('TEETH', ['*', 'T', 'H', 'A', 'B', 'C', 'D', 'I']);
  const notOk = getSpellAnalysis('TEETH', ['*', 'H', 'A', 'B', 'C', 'D', 'I', 'N']);

  assert.equal(ok.canSpell, true);
  assert.deepEqual(ok.missing, ['E']);
  assert.equal(notOk.canSpell, false);
  assert.deepEqual(notOk.missing.sort(), ['E', 'T']);
});

test('scoreWord applies joker repeat penalty and length bonus', () => {
  const score = scoreWord('TEETHING', ['*', 'T', 'H', 'I', 'N', 'G', 'A', 'O']);

  assert.deepEqual(score, {
    base: 12,
    bonus: 2,
    jokerLetter: 'E',
    jokerRepeatPenalty: 1,
    total: 13,
  });
});

test('buildPreviewText describes bonus and joker scoring adjustments', () => {
  const text = buildPreviewText({
    total: 13,
    bonus: 2,
    jokerLetter: 'E',
    jokerRepeatPenalty: 1,
  });

  assert.equal(text, '13 pts preview (+2 length bonus · joker scores E once)');
});
