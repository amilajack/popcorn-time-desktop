/* eslint-disable */
import { autoUpdater } from 'electron';

const AUTO_UPDATE_URL =
  'https://popcorn-desktop-release-server.herokuapp.com/updates/latest';

export default function initDarwinWin32() {
  // autoUpdater.on(
  //   'error',
  //   (error) => alert(`Update error: ${err.message}`)
  // );
  //
  // autoUpdater.on(
  //   'checking-for-update',
  //   () => alert('Checking for update')
  // );
  //
  // autoUpdater.on(
  //   'update-available',
  //   () => alert('Update available')
  // );
  //
  // autoUpdater.on(
  //   'update-not-available',
  //   () => alert('Update not available')
  // );
  //
  // autoUpdater.on(
  //   'update-downloaded',
  //   (e, notes, name, date, url) => alert(`Update downloaded: ${name}: ${url}`)
  // );
  //
  // autoUpdater.setFeedURL(AUTO_UPDATE_URL);
  // autoUpdater.checkForUpdates();
}
