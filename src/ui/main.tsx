/*
|--------------------------------------------------------------------------
| React and Router
|--------------------------------------------------------------------------
*/

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import Root from './components/Root';
import Router from './router/Router';
import store from './store';

/*
|--------------------------------------------------------------------------
| Styles
|--------------------------------------------------------------------------
*/

import './styles/main.scss';

/*
|--------------------------------------------------------------------------
| Some security things
|--------------------------------------------------------------------------
*/

// @ts-ignore
window.eval = global.eval = function () {
  throw new Error(`Sorry, this app does not support window.eval().`);
};

/*
|--------------------------------------------------------------------------
| Render the app
|--------------------------------------------------------------------------
*/

ReactDOM.render(
  <Root>
    <Provider store={store}>
      <Router />
    </Provider>
  </Root>,
  document.getElementById('wrap')
);
