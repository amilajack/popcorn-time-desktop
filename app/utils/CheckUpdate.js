// @flow
import fetch from 'isomorphic-fetch';
import { remote } from 'electron';
import semver from 'semver';


export const defaultUpdateEndpoint =
  process.env.APP_API_UPDATE_ENDPOINT ||
  'https://api.github.com/repos/amilajack/popcorn-time-desktop/releases';

/**
 * Return if the current application version is the latest
 */
export default function CheckUpdate(): Promise<bool> {
  const currentSemvar = remote.app.getVersion();

  return fetch(defaultUpdateEndpoint)
    .then(res => res.json())
    .then(res => !!res.filter(
      each => each.prerelease === false &&
              isNewerSemvar(each.name, currentSemvar)
    ).length);
}

export function isNewerSemvar(current: string, next: string): bool {
  return semver.gt(current, next);
}
