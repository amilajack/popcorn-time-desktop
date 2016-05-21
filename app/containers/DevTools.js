import React from 'react';
import { createDevTools } from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

if (process.env.NODE_ENV !== 'production') {
  const whyDidYouUpdate = require('why-did-you-update');
  whyDidYouUpdate(React);
}

export default createDevTools(
  <DockMonitor
    toggleVisibilityKey="ctrl-h"
    changePositionKey="ctrl-q"
    defaultIsVisible={false}
  >
    <LogMonitor />
  </DockMonitor>
);
