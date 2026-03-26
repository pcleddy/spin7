(function(root, factory){
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.Spin7Logic = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  const TILE_VALUES = {
    A:1, B:3, C:3, D:2, E:1, F:4, G:2, H:4, I:1, J:7, K:6, L:1, M:3,
    N:1, O:1, P:3, Q:9, R:1, S:1, T:1, U:1, V:4, W:4, X:7, Y:4, Z:9,
  };
  const LENGTH_BONUS_FLOOR = 7;
  const LENGTH_BONUS_PER_LETTER = 2;

  function normalizeWord(word){
    return String(word || '').trim().toUpperCase();
  }

  function getSpellAnalysis(word, letters){
    const upper = normalizeWord(word);
    const hand = new Set((letters || []).filter((letter) => letter !== '*'));
    const missing = [...new Set(upper.split('').filter((letter) => !hand.has(letter)))];
    const hasJoker = (letters || []).includes('*');
    return {
      missing,
      hasJoker,
      canSpell: missing.length === 0 || (hasJoker && missing.length === 1),
    };
  }

  function scoreWord(word, letters){
    const upper = normalizeWord(word);
    const base = upper.split('').reduce((sum, letter) => sum + (TILE_VALUES[letter] || 0), 0);
    const analysis = getSpellAnalysis(upper, letters || []);
    const jokerLetter = analysis.hasJoker && analysis.missing.length === 1 ? analysis.missing[0] : null;
    const jokerRepeatPenalty = jokerLetter
      ? Math.max(0, upper.split('').filter((letter) => letter === jokerLetter).length - 1) * (TILE_VALUES[jokerLetter] || 0)
      : 0;
    const bonus = Math.max(0, upper.length - LENGTH_BONUS_FLOOR) * LENGTH_BONUS_PER_LETTER;
    return {
      base,
      bonus,
      jokerLetter,
      jokerRepeatPenalty,
      total: base - jokerRepeatPenalty + bonus,
    };
  }

  function buildPreviewText(score){
    const notes = [];
    if (score.bonus) notes.push(`+${score.bonus} length bonus`);
    if (score.jokerRepeatPenalty && score.jokerLetter) notes.push(`joker scores ${score.jokerLetter} once`);
    return notes.length
      ? `${score.total} pts preview (${notes.join(' · ')})`
      : `${score.total} pts preview`;
  }

  return {
    TILE_VALUES,
    LENGTH_BONUS_FLOOR,
    LENGTH_BONUS_PER_LETTER,
    getSpellAnalysis,
    scoreWord,
    buildPreviewText,
  };
});
