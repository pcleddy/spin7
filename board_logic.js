(function(root, factory){
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  if (root) {
    root.Spin7BoardLogic = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  function getBoardAction(game, access){
    const canRejoin = !!(access && game && game.state !== 'finished');
    const finished = game && game.state === 'finished';
    return {
      label: finished ? 'Finished' : (canRejoin ? 'Rejoin' : 'Join'),
      buttonClass: canRejoin ? 'b-gold' : 'b-purple',
      disabled: !!finished,
      canRejoin,
    };
  }

  function buildBoardMemoryText(rememberedName, lastAccess){
    if (lastAccess && lastAccess.username && lastAccess.gameId) {
      return `Ready as ${lastAccess.username}. Quick rejoin saved for ${lastAccess.gameId}.`;
    }
    if (rememberedName) {
      return `Ready as ${rememberedName}. Board join and rejoin will use that automatically when possible.`;
    }
    return 'Enter a name once and quick join/rejoin will get much smoother.';
  }

  function formatTransferValues(details){
    const safe = details || {};
    return {
      gameId: safe.gameId || '--------',
      username: safe.username || '--------',
      rejoinCode: safe.rejoinCode || '------',
    };
  }

  function boardIsEmpty(games){
    return !games || games.length === 0;
  }

  return {
    getBoardAction,
    buildBoardMemoryText,
    formatTransferValues,
    boardIsEmpty,
  };
});
