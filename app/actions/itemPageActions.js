/* eslint "fp/no-mutation": "error", "fp/no-unused-expression": "error" */
// @flow

export function setItem(item: Object) {
  return {
    type: 'SET_ITEM',
    item
  };
}

export function setCurrentPlayer(currentPlayer: string) {
  return {
    type: 'SET_CURRENT_PLAYER',
    currentPlayer
  };
}

export function setServingUrl(servingUrl: string) {
  return {
    type: 'SET_SERVING_URL',
    servingUrl
  };
}

export function setLoadingStatus(statusName: string, isLoading: boolean) {
  return {
    type: 'SET_LOADING_STATUS',
    statusName,
    isLoading
  };
}

export function setInitialState() {
  return {
    type: 'SET_INITIAL_STATE'
  };
}

export function setTorrentProgress(torrentInProgress: boolean) {
  return {
    type: 'SET_TORRENT_PROGRESS',
    torrentInProgress
  };
}

export function setProp(propName: boolean, propValue: any) {
  return {
    type: 'SET_PROP',
    propName,
    propValue
  };
}

export function mergeProp(prop: any) {
  return {
    type: 'MERGE_PROP',
    mergeProp: prop
  };
}
