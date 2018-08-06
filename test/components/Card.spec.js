import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
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

  const component = shallow(<Card {...props} />);

  return {
    component,
    title: component.find('.Card--title')
  };
}

describe('Card Component', () => {
  it('should have movie title', () => {
    const { title } = setup();
    expect(toJson(title)).toMatchSnapshot();
  });
});
