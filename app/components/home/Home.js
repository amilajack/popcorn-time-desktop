// @flow
import React, { PropTypes } from 'react';
import VisibilitySensor from 'react-visibility-sensor';
// import { shell } from 'electron';
// import notie from 'notie';
import Header from '../header/Header';
import CardList from '../card/CardList';


export default function Home({ activeMode, actions, items, isLoading, onChange }) {
  return (
    <div className="row">
      <Header
        activeMode={activeMode}
        setActiveMode={actions.setActiveMode}
      />
      <div className="col-xs-12">
        <CardList
          items={items}
          isLoading={isLoading}
        />
        <VisibilitySensor
          onChange={(inViewport) => onChange(inViewport)}
        />
      </div>
    </div>
  );
}

Home.propTypes = {
  actions: PropTypes.shape({
    setActiveMode: PropTypes.func.isRequired,
    paginate: PropTypes.func.isRequired,
    clearAllItems: PropTypes.func.isRequired,
    setLoading: PropTypes.func.isRequired,
    setCurrentPlayer: PropTypes.func.isRequired
  }).isRequired,
  activeMode: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    rating: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    genres: PropTypes.arrayOf(
      PropTypes.string.isRequired
    ).isRequired
  })).isRequired,
  isLoading: PropTypes.bool.isRequired
};
