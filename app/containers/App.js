/* eslint global-require: 0 */
// @flow
import React, { PropTypes } from 'react';


export default function App({ children }) {
  return (
    <div>
      {children}
    </div>
  );
}

App.propTypes = {
  children: PropTypes.element.isRequired
};
