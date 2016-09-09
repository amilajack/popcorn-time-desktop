/**
 * Card in the CardList component
 */
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import Rating from './Rating';


export default class Card extends Component {

  static propTypes = {
    title: PropTypes.string.isRequired,
    image: PropTypes.string,
    id: PropTypes.string,
    genres: PropTypes.array,
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    type: PropTypes.string.isRequired
  };

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { image, type, id, rating, genres, title } = this.props;

    const placeholder = '../../images/posterholder.png';

    const divStyle = {
      backgroundImage: `url(${image !== 'N/A' ? image : placeholder})`
    };

    return (
      <div className="Card">
        <Link to={`/item/${type}/${id}`}>
          <div className="Card--overlay-container" style={divStyle}>
            <div className="Card--overlay" />
          </div>
        </Link>
        <div>
          <Link className="Card--title" to={`/item/${type}/${id}`}>
            {title}
          </Link>
        </div>
        <div>
          {rating !== 'n/a' ? <Rating rating={rating} /> : null
          }
        </div>
        {type === 'search' ? <div>
          {type}
        </div> : null
        }
        Kind: {type}
        <div className="Card--genres">
          {genres ? genres[0] : null}
        </div>
      </div>
    );
  }
}
