const test = require('node:test');
const assert = require('node:assert/strict');

const {
  getSpellAnalysis,
  scoreWord,
  buildPreviewText,
} = require('../game_logic.js');

const {
  getBoardAction,
  buildBoardMemoryText,
  formatTransferValues,
  boardIsEmpty,
} = require('../board_logic.js');

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

test('getBoardAction prefers rejoin when browser already knows the player', () => {
  const action = getBoardAction({state: 'active'}, {username: 'Alice', gameId: 'ABCD1234'});

  assert.deepEqual(action, {
    label: 'Rejoin',
    buttonClass: 'b-gold',
    disabled: false,
    canRejoin: true,
  });
});

test('getBoardAction disables finished games', () => {
  const action = getBoardAction({state: 'finished'}, {username: 'Alice'});

  assert.equal(action.label, 'Finished');
  assert.equal(action.disabled, true);
  assert.equal(action.canRejoin, false);
});

test('buildBoardMemoryText reflects quick rejoin details when available', () => {
  const text = buildBoardMemoryText('Alice', {username: 'Alice', gameId: 'ABCD1234'});

  assert.equal(text, 'Ready as Alice. Quick rejoin saved for ABCD1234.');
});

test('formatTransferValues fills placeholders for missing fields', () => {
  assert.deepEqual(formatTransferValues({}), {
    gameId: '--------',
    username: '--------',
    rejoinCode: '------',
  });
});

test('boardIsEmpty reports whether the board has games', () => {
  assert.equal(boardIsEmpty([]), true);
  assert.equal(boardIsEmpty([{game_id: 'ABCD1234'}]), false);
});
