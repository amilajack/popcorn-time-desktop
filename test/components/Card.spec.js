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
import Card from '../../app/components/card/Card';


function setup(propsOverride) {
  const props = Object.assign({}, {
    image: 'test_image_url',
    title: 'Test movie',
    id: '248245',
    year: 2014,
    rating: 4.5
  }, propsOverride);

  const component = renderIntoDocument(<Card {...props} />);
  return {
    component,
    title: findRenderedDOMComponentWithClass(component, 'Card--title'),
    year: findRenderedDOMComponentWithClass(component, 'Card--year')
  };
}

describe('Card Component', () => {
  it('should have movie title', (done) => {
    const { title } = setup();
    expect(title.textContent).to.equal('Test movie');
    done();
  });

  it('should have movie year', (done) => {
    const { title, year } = setup();
    expect(year.textContent).to.equal('2014');
    done();
  });
});
