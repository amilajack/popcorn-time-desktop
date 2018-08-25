import { ClientFunction, Selector } from 'testcafe';
import ConfigStore from 'configstore';

export const BASE_URL = '../../app/app.html?';
export const getPageTitle = ClientFunction(() => document.title);
export const getPageUrl = ClientFunction(() => window.location.href);
export const cardlistSelector = Selector('.CardList');
export const titleSelector = Selector('#title');
export const cardSelector = Selector('.Card');
export const getLowerCaseCardTitle = async () =>
  (await cardSelector.find('.Card--title').nth(0).innerText).toLowerCase();
export const scrollBottom = ClientFunction(() =>
  window.scrollTo(0, document.body.scrollHeight)
);

export function clearConfigs() {
  const config = new ConfigStore(
    process.env.E2E_BUILD === 'true' ? 'popcorn-time-test' : 'popcorn-time',
    {
      favorites: [],
      recentlyWatched: [],
      watchList: [],
      state: {}
    }
  );
  config.clear();
}

export async function navigateTo(t, route = 'home') {
  const exactLinkText = (() => {
    switch (route) {
      case 'home':
        return 'Home';
      case 'shows':
        return 'TV Shows';
      case 'movies':
        return 'Movies';
      default:
        return 'Home';
    }
  })();
  return t.click(Selector('a').withExactText(exactLinkText));
}

export async function navigateToCard(t) {
  await navigateTo(t, 'home');
  await t
    .typeText('#pct-search-input', "harry potter and the philosopher's stone")
    .pressKey('enter')
    .click(cardSelector);
}

export function clickItemPageBackButton(t) {
  return t.click('[data-e2e="item-button-back"]');
}
