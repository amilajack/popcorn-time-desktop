// @flow
import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import mousetrap from 'mousetrap';
import Root from './containers/Root.jsx';
import { configureStore, history } from './store/configureStore';
import './styles/main.scss';

const store = configureStore();

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root.jsx', () => {
    const NextRoot = require('./containers/Root.jsx'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}

// Bind app shortcuts
mousetrap.bind(['command+f', 'ctrl+f'], () => {
  document.getElementById("pct-search-input").focus();
  return false;
});

mousetrap.bind(['command+1', 'ctrl+1'], () => {
  const [firstLink] = Array.from(document.querySelectorAll('.Header .nav-link'))
  firstLink.click();
  return false;
});

mousetrap.bind(['command+2', 'ctrl+2'], () => {
  const secondLink = Array.from(document.querySelectorAll('.Header .nav-link'))[1];
  secondLink.click();
  return false;
});

mousetrap.bind(['command+3', 'ctrl+3'], () => {
  const secondLink = Array.from(document.querySelectorAll('.Header .nav-link'))[2];
  secondLink.click();
  return false;
});
