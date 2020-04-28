/* eslint react/jsx-props-no-spreading: off */
import React from "react";
import { remote } from "electron";
import { ToastProvider } from "react-toast-notifications";
import ConnectivityListener from "./ConnectivityListener";
import ThemeManager, { Theme, ThemeWithSystem } from "../../utils/Theme";
import Navbar from "./Navbar";
import Settings from "./Settings";
import CheckUpdateServer from "../../utils/CheckUpdate";
import { ThemeContext } from "./theme-context";
import SettingsManager from "../../utils/Settings";

const { nativeTheme } = remote;

type Props = {
  children: React.ReactNode;
};

type State = {
  theme: Theme;
  hasUpdate: boolean;
  settingsModalOpen: boolean;
};

class App extends React.Component<Props, State> {
  themeManager: ThemeManager;

  updateServer?: CheckUpdateServer;

  constructor(props: Props) {
    super(props);
    SettingsManager.load();
    this.themeManager = new ThemeManager(SettingsManager.settings.theme);
    this.themeManager.on("themeChanged", () => {
      this.setState({
        theme: this.themeManager.getTheme(),
      });
    });
    this.state = {
      settingsModalOpen: false,
      theme: this.themeManager.getTheme(),
      hasUpdate: false,
    };

    // Update server
    this.updateServer = new CheckUpdateServer();
    this.updateServer.once("hasNewVersion", () => {
      this.setState({
        hasUpdate: true,
      });
    });
  }

  componentWillUnmount() {
    nativeTheme.removeAllListeners();
    if (this.updateServer) this.updateServer.stop();
  }

  openSettingsModal = () => {
    this.setState((state) => ({
      settingsModalOpen: !state.settingsModalOpen,
    }));
  };

  changeTheme = (theme: ThemeWithSystem) => {
    SettingsManager.setTheme(theme);
    this.themeManager.change(theme);
    this.setState({
      theme: this.themeManager.getTheme(),
    });
  };

  render() {
    const { children } = this.props;
    const { theme, settingsModalOpen } = this.state;
    return (
      <ThemeContext.Provider value={theme}>
        <ToastProvider placement="bottom-right">
          <ConnectivityListener />
          <Navbar openSettingsModal={this.openSettingsModal} />
          <Settings
            open={settingsModalOpen}
            changeTheme={this.changeTheme}
            openSettingsModal={this.openSettingsModal}
          />
          {children}
        </ToastProvider>
      </ThemeContext.Provider>
    );
  }
}

export default App;

// function Foo(props: Props) {

//   useEffect(() => {

//   })

//   const {children} = props;
//   return (
//     <ThemeContext.Provider value={theme}>
//       <ToastProvider placement="bottom-right">
//         <ConnectivityListener />
//         <Navbar />
//         <Settings open />
//         {children}
//       </ToastProvider>
//     </ThemeContext.Provider>
//   );
// }
