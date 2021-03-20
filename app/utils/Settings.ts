import Config from "./Config";
import { Theme } from "./Theme";

type Flag = {
  id: string;
  name: string;
  enabled: boolean;
};

type Settings = {
  theme: Theme;
  flags: Flag[];
};

export default class SettingsManager {
  static settings: Settings = {
    theme: Theme.System,
    flags: [
      {
        id: "season_complete",
        name: 'Allow the "complete season torrents" feature',
        enabled: process.env.FLAG_SEASON_COMPLETE === "true",
      },
      {
        id: "subtitle_embedded_movies",
        name: "Ignore torrents with embedded subtitles",
        enabled: process.env.FLAG_SUBTITLE_EMBEDDED_MOVIES === "true",
      },
      {
        id: "unverified_torrents",
        name: "Allow torrents whose quality cannot be verified",
        enabled: process.env.FLAG_UNVERIFIED_TORRENTS === "true",
      },
    ],
  };

  static isFlagEnabled(flagId: string) {
    return this.settings.flags.some(
      (flag) => flag.id === flagId && flag.enabled
    );
  }

  static setTheme(theme: Theme) {
    this.settings.theme = theme;
    this.save();
  }

  static setFlag(flagId: string, enabled: boolean): Flag[] {
    this.settings.flags = this.settings.flags.map((flag) => {
      return flag.id === flagId
        ? {
            ...flag,
            enabled,
          }
        : flag;
    });
    this.save();
    return this.settings.flags;
  }

  static toggleFlag(flagId: string) {
    this.setFlag(flagId, !this.isFlagEnabled(flagId));
    return this.settings.flags;
  }

  /**
   * Read the user's settings from their config
   */
  static load(): Settings {
    const config = Config.get<Partial<Settings>>("settings");
    if (!config) return this.settings;

    const { theme, flags = [] } = config;
    const usersFlags = new Map<string, Flag>(
      flags.map((flag) => [flag.id, flag])
    );
    this.settings.flags = this.settings.flags.map((flag) => {
      if (usersFlags.has(flag.id)) {
        return usersFlags.get(flag.id) as Flag;
      }
      return flag;
    });
    this.settings.theme = theme || this.settings.theme;
    return this.settings;
  }

  static save() {
    Config.set("settings", this.settings);
  }
}
