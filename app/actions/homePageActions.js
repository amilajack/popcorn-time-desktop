export function setActiveMode(activeMode, activeModeOptions = {}) {
  return {
    type: 'SET_ACTIVE_MODE',
    activeMode,
    activeModeOptions
  };
}

export function paginate(items) {
  return {
    type: 'PAGINATE',
    items
  };
}

export function clearItems() {
  return {
    type: 'CLEAR_ITEMS'
  };
}

export function setLoading(isLoading) {
  return {
    type: 'SET_LOADING',
    isLoading
  };
}

export function setCurrentPlayer(player) {
  return {
    type: 'SET_CURRENT_PLAYER',
    player
  };
}
