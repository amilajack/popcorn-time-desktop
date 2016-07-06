import { autoUpdate } from 'electron';


function onResponse (err, res, data) {
  if (err) return log(`Update error: ${err.message}`)
  if (res.statusCode === 200) {
    // Update available
    try {
      data = JSON.parse(data)
    } catch (err) {
      return log(`Update error: Invalid JSON response: ${err.message}`)
    }
    windows.main.dispatch('updateAvailable', data.version)
  } else if (res.statusCode === 204) {
    // No update available
  } else {
    // Unexpected status code
    log(`Update error: Unexpected status code: ${res.statusCode}`)
  }
}

function initDarwinWin32 () {
  electron.autoUpdater.on(
    'error',
    (err) => log.error(`Update error: ${err.message}`)
  )

  electron.autoUpdater.on(
    'checking-for-update',
    () => log('Checking for update')
  )

  electron.autoUpdater.on(
    'update-available',
    () => log('Update available')
  )

  electron.autoUpdater.on(
    'update-not-available',
    () => log('Update not available')
  )

  electron.autoUpdater.on(
    'update-downloaded',
    (e, notes, name, date, url) => log(`Update downloaded: ${name}: ${url}`)
  )

  electron.autoUpdater.setFeedURL(AUTO_UPDATE_URL)
  electron.autoUpdater.checkForUpdates()
}
