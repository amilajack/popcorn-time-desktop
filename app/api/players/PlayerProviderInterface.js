// @flow
// Initialize the player
export interface PlayerAdapterInterface {
  name: string,

  setup: () => void,

  start: () => void,

  pause: () => void,

  restart: () => void,

  /**
   * Handle any logic to remove the traces of the player from memory
   */
  cleanup: () => void,

  /**
   * Check if the plugin is supported on the machine
   */
  isSupported: () => void,

  supportedFormats: Array<string>,

  supportsSubtitles: boolean,

  svgIconFilename: string
}
