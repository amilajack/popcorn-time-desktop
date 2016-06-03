/**
 * Card in the CardList component
 */

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Rating from 'react-star-rating-component';


export default class Card extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    id: PropTypes.string,
    year: PropTypes.number,
    rating: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ])
  };

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const placeholder =
      'https://raw.githubusercontent.com/butterproject/butter-desktop/master/src/app/images/posterholder.png';

    const divStyle = {
      backgroundImage: `url(${this.props.image !== 'N/A' ? this.props.image : placeholder})`
    };

    return (
      <div className="Card">
        <Link to={`/movie/${this.props.id}`}>
          <div className="Card--overlay-container" style={divStyle}>
            <div className="Card--overlay"></div>
          </div>
        </Link>
        <div>
          <Link className="Card--title" to={`/movie/${this.props.id}`}>
            {this.props.title}
          </Link>
        </div>
        {this.props.rating !== 'n/a' ?
          <Rating
            renderStarIcon={() => <span className="ion-android-star"></span>}
            starColor={'white'}
            name={'rating'}
            value={this.props.rating}
            editing={false}
          />
          :
          null
        }
        <div className="Card--year">{this.props.year}</div>
      </div>
    );
  }
}
