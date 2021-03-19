/* eslint react/jsx-props-no-spreading: off */
import React, { useEffect, useState } from "react";
import ReactNotification, { store } from "react-notifications-component";
import ConnectivityListener from "./ConnectivityListener";
import ThemeManager, { Theme } from "../../utils/Theme";
import Navbar from "./Navbar";
import Settings from "./Settings";
import CheckUpdateServer from "../../utils/CheckUpdate";
import { ThemeContext } from "./theme-context";
import SettingsManager from "../../utils/Settings";

type Props = {
  children: React.ReactNode;
};

const themeManager = new ThemeManager(SettingsManager.settings.theme);

export default function App(props: Props) {
  SettingsManager.load();
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [theme, setTheme] = useState(themeManager.getTheme());

  const toggleSetingsModalOpen = () => setSettingsModalOpen(!settingsModalOpen);

  useEffect(() => {
    themeManager.on("updated", () => {
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
      themeManager.cleanup();
      if (updateServer) updateServer.stop();
    };
  }, []);

  const changeTheme = (toTheme: Theme) => {
    setTheme(toTheme);
    themeManager.change(toTheme);
  };

  const { children } = props;
  return (
    <ThemeContext.Provider value={theme}>
      <ReactNotification />
      <ConnectivityListener />
      <Navbar toggleSettingsModal={toggleSetingsModalOpen} />
      <Settings
        open={settingsModalOpen}
        changeTheme={changeTheme}
        toggleSettingsModal={toggleSetingsModalOpen}
      />
      {children}
    </ThemeContext.Provider>
  );
}
