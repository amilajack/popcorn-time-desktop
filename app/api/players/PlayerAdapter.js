// @flow
// Initialize the player
export interface PlayerAdapterInterface {
  setup: () => void,

  start: () => void,

  pause: () => void,

  restart: () => void,

  // Handle any logic to remove the traces of the player from memory
  cleanup: () => void,

  // Check if the plugin is supported on the machine
  isSupported: () => void,

  name: string,

  supportedFormats: Array<string>,

  supportsSubtitles: false | true,

  svgIconFilename: string
}
