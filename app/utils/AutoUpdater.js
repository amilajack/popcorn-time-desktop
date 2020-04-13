import { autoUpdater } from "electron-updater";
import log from "electron-log";

export default function AppUpdater() {
  log.transports.file.level = "debug";
  autoUpdater.logger = log;
  return autoUpdater.checkForUpdatesAndNotify();
}
