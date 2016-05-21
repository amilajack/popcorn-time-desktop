/**
 * Card in the CardList component
 */

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Rating from 'react-star-rating-component';
import Image from 'legit-image';

export default class Card extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    id: PropTypes.string,
    year: PropTypes.number,
    rating: PropTypes.number
  };

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <div className="Card">
        <Link to={`/movie/${this.props.id}`}>
          <div className="CardList--overlay-container">
            <Image src={this.props.image} />
            <div className="CardList--overlay"></div>
          </div>
        </Link>
        <div>
          <Link className="CardList--title" to={`/movie/${this.props.id}`}>
            {this.props.title}
          </Link>
        </div>
        <Rating
          renderStarIcon={() => <span className="ion-android-star"></span>}
          starColor={'white'}
          value={this.props.rating}
          editing={false}
        />
        <div>{this.props.year}</div>
      </div>
    );
  }
}
