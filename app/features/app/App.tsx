/* eslint react/jsx-props-no-spreading: off */
import React from "react";
import { remote } from "electron";
import { ToastProvider } from "react-toast-notifications";
import ConnectivityListener from "./ConnectivityListener";
import ThemeManager, { Theme } from "../../utils/Theme";
import Navbar from "./Navbar";
import CheckUpdateServer from "../../utils/CheckUpdate";

const { nativeTheme } = remote;

type Props = {
  children: React.ReactNode;
};

type State = {
  theme: Theme;
  hasUpdate: boolean;
};

class App extends React.Component<Props, State> {
  state: State = {
    theme: nativeTheme.shouldUseDarkColors ? Theme.Dark : Theme.Light,
    hasUpdate: false,
  };

  updateServer?: CheckUpdateServer;

  componentDidMount() {
    const themeManager = new ThemeManager(
      nativeTheme.shouldUseDarkColors ? Theme.Dark : Theme.Light
    );
    nativeTheme.on("updated", () => {
      const theme = nativeTheme.shouldUseDarkColors ? Theme.Dark : Theme.Light;
      themeManager.change(theme);
      this.setState({
        theme,
      });
    });

    this.updateServer = new CheckUpdateServer();
    this.updateServer.once("hasNewVersion", () => {
      this.setState({});
    });
  }

  componentWillUnmount() {
    if (this.updateServer) this.updateServer.stop();
  }

  render() {
    const { children } = this.props;
    const { theme } = this.state;

    return (
      <ToastProvider placement="bottom-right">
        <ConnectivityListener />
        <Navbar theme={theme} />
        {children}
      </ToastProvider>
    );
  }
}

export default App;
