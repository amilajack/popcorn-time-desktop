/**
 * A list of thumbnail poster images of items that are rendered on the home page
 */
import React, { Component, PropTypes } from 'react';
import Card from './Card';
import Loader from '../loader/Loader';


export default class CardList extends Component {

  static propTypes = {
    items: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isFinished: PropTypes.bool.isRequired
  };

  static defaultProps = {
    items: [],
    isLoading: false,
    isFinished: false
  };

  render() {
    const { items, isLoading, isFinished } = this.props;

    return (
      <div>
        <div className="col-xs-12">
          <div className="CardList">
            {items.map((item: Object) => (
              <Card
                image={item.images.poster.thumb}
                title={item.title}
                id={item.imdbId}
                key={item.imdbId}
                year={item.year}
                type={item.type}
                rating={item.rating}
                genres={item.genres}
              />
            ))}
          </div>
        </div>
        <div className="col-xs-12">
          <Loader isLoading={isLoading} isFinished={isFinished} />
        </div>
      </div>
    );
  }
}
