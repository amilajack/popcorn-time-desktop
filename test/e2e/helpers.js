import { ClientFunction, Selector } from 'testcafe';

export const getPageTitle = ClientFunction(() => document.title);
export const getPageUrl = ClientFunction(() => window.location.href);
export const cardlistSelector = Selector('.CardList');
export const titleSelector = Selector('#title');
export const cardSelector = Selector('.Card');
export const scrollBottom = ClientFunction(() =>
  window.scrollTo(0, document.body.scrollHeight)
);
