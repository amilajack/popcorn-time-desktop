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
    rating: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    type: PropTypes.string.isRequired
  };

  shouldComponentUpdate() {
    return false;
  }

  render() {
    const placeholder =
      '../../images/posterholder.png';

    const divStyle = {
      backgroundImage: `url(${this.props.image !== 'N/A' ? this.props.image : placeholder})`
    };

    return (
      <div className="Card">
        <Link to={`/item/${this.props.type}/${this.props.id}`}>
          <div className="Card--overlay-container" style={divStyle}>
            <div className="Card--overlay" />
          </div>
        </Link>
        <div>
          <Link className="Card--title" to={`/item/${this.props.type}/${this.props.id}`}>
            {this.props.title}
          </Link>
        </div>
        <div>
          {this.props.rating !== 'n/a' ?
            <Rating rating={this.props.rating} />
            :
            null
          }
        </div>
        {this.props.type === 'search' ?
          <div>
            {this.props.type}
          </div>
          :
          null
        }
        Kind: {this.props.type}
        <div className="Card--genres">
          {this.props.genres ? this.props.genres[0] : null}
        </div>
      </div>
    );
  }
}
