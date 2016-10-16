import { expect } from 'chai';
import reducer, { defaultState } from '../../app/reducers/homePageReducer';


describe('HomePageReducer', () => {
  it('should create paginate action', done => {
    const items = [{
      title: 'Dark Knight'
    }];

    const expectedAction = {
      type: 'PAGINATE',
      items
    };

    expect(reducer(undefined, expectedAction)).to.eql({
      ...defaultState,
      modes: {
        ...defaultState.modes,
        movies: { page: 2, limit: 50, items }
      },
      items
    });

    done();
  });
});
