// @flow
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Root from './containers/Root';
import configureStoreDefault from './store/configureStore';
import './styles/main.scss';

const { configureStore, history } = configureStoreDefault;

const store = configureStore();

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}

import('mousetrap')
  .then(mousetrap => {
    mousetrap.bind(['command+f', 'ctrl+f'], () => {
      window.scrollTo(0, 0);
      document.getElementById('pct-search-input').focus();
      return false;
    });

    mousetrap.bind(['command+1', 'ctrl+1'], () => {
      const [firstLink] = Array.from(
        document.querySelectorAll('.Header .nav-link')
      );
      firstLink.click();
      return false;
    });

    mousetrap.bind(['command+2', 'ctrl+2'], () => {
      const secondLink = Array.from(
        document.querySelectorAll('.Header .nav-link')
      )[1];
      secondLink.click();
      return false;
    });

    mousetrap.bind(['command+3', 'ctrl+3'], () => {
      const secondLink = Array.from(
        document.querySelectorAll('.Header .nav-link')
      )[2];
      secondLink.click();
      return false;
    });

    mousetrap.bind(['left', 'right', 'enter'], event => {
      const cards = Array.from(document.querySelectorAll('.Card'));
      if (!cards.length) {
        return;
      }

      const prevIndex = window.currentCardSelectedIndex;
      const prevSelectedCard = document.querySelector('.Card--selected');

      switch (event.key) {
        case 'ArrowLeft': {
          if (window.currentCardSelectedIndex - 1 >= 0) {
            window.currentCardSelectedIndex--;
          }
          break;
        }
        case 'ArrowRight': {
          if (window.currentCardSelectedIndex + 1 <= cards.length - 1) {
            window.currentCardSelectedIndex++;
          }
          break;
        }
        case 'Enter': {
          if (prevSelectedCard) {
            prevSelectedCard.querySelector('a').click();
          }
          break;
        }
        default:
          throw new Error('Unsupported key event');
      }

      if (window.currentCardSelectedIndex !== prevIndex || !prevSelectedCard) {
        if (prevSelectedCard) {
          prevSelectedCard.classList.remove('Card--selected');
        }
        cards[window.currentCardSelectedIndex].classList.add('Card--selected');
        cards[window.currentCardSelectedIndex].scrollIntoView();
      }
    });

    return true;
  })
  .catch(console.log);
