/* eslint react/jsx-props-no-spreading: off */
import React, { useEffect, useState } from "react";
import { remote } from "electron";
import ReactNotification, { store } from "react-notifications-component";
import ConnectivityListener from "./ConnectivityListener";
import ThemeManager from "../../utils/Theme";
import Navbar from "./Navbar";
import Settings from "./Settings";
import CheckUpdateServer from "../../utils/CheckUpdate";
import { ThemeContext } from "./theme-context";
import SettingsManager from "../../utils/Settings";

type Props = {
  children: React.ReactNode;
};

export default function App(props: Props) {
  SettingsManager.load();
  const themeManager = new ThemeManager(SettingsManager.settings.theme);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [theme, setTheme] = useState(themeManager.getTheme());

  useEffect(() => {
    themeManager.on("themeChanged", () => {
      setTheme(themeManager.getTheme());
    });
    // Update server
    const updateServer = new CheckUpdateServer();
    updateServer.start();
    updateServer.on("hasNewVersion", () => {
      setTimeout(() => {
        store.addNotification({
          title: "Update Available",
          message:
            "Go to <a href='https://github.com/amilajack/popcorn-time-desktop/releases'>foo</a> to download it",
          type: "success",
          insert: "top",
          container: "bottom-right",
          animationIn: ["animated", "fadeIn"],
          animationOut: ["animated", "fadeOut"],
          dismiss: {
            duration: 5000,
            onScreen: true,
            pauseOnHover: true,
          },
        });
      }, 1000);
    });
    return () => {
      const { nativeTheme } = remote;
      nativeTheme.removeAllListeners();
      if (updateServer) updateServer.stop();
    };
  });

  const { children } = props;
  return (
    <ThemeContext.Provider value={theme}>
      <ReactNotification />
      <ConnectivityListener />
      <Navbar openSettingsModal={setSettingsModalOpen} />
      <Settings
        open={settingsModalOpen}
        changeTheme={setTheme}
        openSettingsModal={setSettingsModalOpen}
      />
      {children}
    </ThemeContext.Provider>
  );
}
