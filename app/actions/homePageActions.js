// @flow
export function setActiveMode(activeMode: string, activeModeOptions: Object = {}) {
  return {
    type: 'SET_ACTIVE_MODE',
    activeMode,
    activeModeOptions
  };
}

export function paginate(items: Array<Object>) {
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

export function clearAllItems() {
  return {
    type: 'CLEAR_ALL_ITEMS'
  };
}

export function setLoading(isLoading: boolean) {
  return {
    type: 'SET_LOADING',
    isLoading
  };
}

export function setCurrentPlayer(player: string) {
  return {
    type: 'SET_CURRENT_PLAYER',
    player
  };
}
