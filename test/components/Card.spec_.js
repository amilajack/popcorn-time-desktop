import React from 'react';
import {
  renderIntoDocument,
  findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';
import Card from '../../app/components/card/Card';

function setup(propsOverride) {
  const props = Object.assign(
    {},
    {
      image: 'test_image_url',
      title: 'Test movie',
      id: '248245',
      genres: ['action', 'comedy'],
      rating: 4.5,
      kind: 'shows',
      baseUrl: '/item/shows'
    },
    propsOverride
  );

  const component = renderIntoDocument(<Card {...props} />);

  return {
    component,
    title: findRenderedDOMComponentWithClass(component, 'Card--title'),
    genres: findRenderedDOMComponentWithClass(component, 'Card--genres')
  };
}

describe('Card Component', () => {
  it('should have movie title', () => {
    const { title } = setup();
    expect(title.textContent).toBe('Test movie');
  });

  it('should have movie genres', () => {
    const { genres } = setup();
    expect(genres.textContent).toBe('action');
  });
});
