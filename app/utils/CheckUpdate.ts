import fetch from "node-fetch";
import { remote } from "electron";
import semver from "semver";
import { EventEmitter } from "events";

export const defaultUpdateEndpoint =
  process.env.APP_API_UPDATE_ENDPOINT ||
  "https://api.github.com/repos/amilajack/popcorn-time-desktop/releases";

export function isNewerSemvar(current: string, next: string): boolean {
  return semver.gt(current, next);
}

type Release = {
  prerelease: boolean;
  name: string;
};

/**
 * Return if the current application version is the latest
 */
export async function checkUpdate(): Promise<boolean> {
  const currentSemvar = remote.app.getVersion();
  const releases: Release[] = await fetch(defaultUpdateEndpoint).then((res) =>
    res.json()
  );
  return releases.some((release) => {
    return !release.prerelease && isNewerSemvar(release.name, currentSemvar);
  });
}

export default class CheckUpdateServer extends EventEmitter {
  updateInterval?: number;

  intervalId?: number;

  constructor(opts?: { updateInterval?: number }) {
    super();
    this.updateInterval = opts?.updateInterval || 1_000_000;
  }

  start() {
    const checkUpdateInInterval = async () => {
      const hasUpdate = await checkUpdate();
      if (hasUpdate) {
        this.emit("hasNewVersion");
        this.stop();
      }
    };
    checkUpdateInInterval();
    this.intervalId = setInterval(checkUpdateInInterval, this.updateInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
