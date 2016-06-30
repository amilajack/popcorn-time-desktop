/* eslint no-unused-expressions: 0 */
import { expect } from 'chai';
import { spy } from 'sinon';
import React from 'react';
import {
  renderIntoDocument,
  scryRenderedDOMComponentsWithTag,
  findRenderedDOMComponentWithClass,
  Simulate
} from 'react-addons-test-utils';
import Movie from '../../app/components/movie/Movie';


function setup(propsOverride) {
  const props = Object.assign({}, {
    itemId: 'tt0435761'
  }, propsOverride);

  const component = renderIntoDocument(<Movie {...props} />);
  return {
    component,
    movie: findRenderedDOMComponentWithClass(component, 'Movie')
  };
}
