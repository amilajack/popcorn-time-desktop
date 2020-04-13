/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
/* eslint global-require: off */
import { app, BrowserWindow } from "electron";
import windowStateKeeper from "electron-window-state";
import * as Sentry from "@sentry/electron/dist/main";
import MenuBuilder from "./menu";
import AutoUpdater from "./utils/AutoUpdater";

if (process.env.ANALYTICS === "true") {
  Sentry.init({
    dsn: "https://b0d05cee653942148a43b8163bbc6cee@sentry.io/1277263",
  });
}

let mainWindow = null;

if (process.env.NODE_ENV === "production") {
  const sourceMapSupport = require("source-map-support");
  sourceMapSupport.install();
} else {
  process.on("uncaughtRejection", (error) => {
    throw error;
  });
}

if (
  process.env.NODE_ENV === "development" ||
  process.env.DEBUG_PROD === "true"
) {
  require("electron-debug")();
  const path = require("path");
  const p = path.join(__dirname, "..", "app", "node_modules");
  require("module").globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require("electron-devtools-installer");
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ["REACT_DEVELOPER_TOOLS", "REDUX_DEVTOOLS"];

  return Promise.all(
    extensions.map((name) => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on("window-all-closed", () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("ready", async () => {
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_PROD === "true"
  ) {
    await installExtensions();
  }

  const mainWindowState = windowStateKeeper({
    defaultWidth: 1224,
    defaultHeight: 728,
  });

  mainWindow = new BrowserWindow({
    show: false,
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: 900,
    backgroundColor: "white",
    webPreferences: {
      darkTheme: true,
      "web-preferences": { "web-security": false },
      scrollBounce: true,
      overlayFullscreenVideo: false,
      nodeIntegration: true,
    },
  });

  mainWindowState.manage(mainWindow);

  mainWindow.loadURL(`file://${__dirname}/app.html?`);
  mainWindow.show();
  mainWindow.focus();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Remove this if your app does not use auto updates
  await AutoUpdater();
});
