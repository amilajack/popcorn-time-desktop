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
    genres: ['action', 'comedy'],
    rating: 4.5,
    kind: 'shows',
    baseUrl: '/item/shows'
  }, propsOverride);

  const component = renderIntoDocument(<Card {...props} />);
  return {
    component,
    title: findRenderedDOMComponentWithClass(component, 'Card--title'),
    genres: findRenderedDOMComponentWithClass(component, 'Card--genres')
  };
}

describe('Card Component', () => {
  it('should have movie title', (done) => {
    const { title } = setup();
    expect(title.textContent).to.equal('Test movie');
    done();
  });

  it('should have movie genres', (done) => {
    const { title, genres } = setup();
    expect(genres.textContent).to.equal('action');
    done();
  });
});
