/**
 * Credits to https://github.com/voronianski for writing this component
 * This was taken from his react-star-rating-component repo and is being
 * modified our own custom uses to improve perf
 */

import React, { Component, PropTypes } from 'react';
import cx from 'classnames';


export class StarRating extends Component {

  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.number,
    editing: PropTypes.bool,
    starCount: PropTypes.number,
    starColor: PropTypes.string,
    onStarClick: PropTypes.func,
    renderStarIcon: PropTypes.func,
    className: PropTypes.string
  };

  static defaultProps = {
    starCount: 5,
    value: 0,
    editing: true,
    starColor: '#ffb400'
  };

  constructor(props) {
    super();

    this.state = {
      value: props.value
    };
  }

  onChange(value) {
    const { editing } = this.props;
    if (!editing) {
      return;
    }

    this.setState({ value });
  }

  onStarClick(i, value, name) {
    const { onStarClick, editing } = this.props;
    if (!editing) {
      return;
    }
    onStarClick && onStarClick(i, value, name);
  }

  shouldComponentUpdate() {
    return this.props.editing;
  }

  renderStars() {
    const { name, starCount, starColor, editing, renderStarIcon } = this.props;
    const { value } = this.state;
    const starStyles = {
      float: 'right',
      cursor: editing ? 'pointer' : 'default'
    };
    const radioStyles = {
      display: 'none',
      position: 'absolte',
      marginLeft: -9999
    };

    // populate stars
    const starNodes = [];

    for (let i = starCount; i > 0; i--) {
      const id = `${name}_${i}`;
      const starNodeInput = (
        <input
          key={`input_${id}`}
          style={radioStyles}
          className="dv-star-rating-input"
          type="radio"
          name={name}
          id={id}
          value={i}
          checked={value === i}
          onChange={this.onChange.bind(this, i, name)}
        />
      );
      const starNodeLabel = (
        <label
          key={`label_${id}`}
          style={
            value >= i ? {
              float: starStyles.float,
              cursor: starStyles.cursor,
              color: starColor
            } : starStyles
          }
          className="dv-star-rating-star"
          htmlFor={id}
          onClick={this.onStarClick.bind(this, i, value, name)}
        >
          {typeof renderStarIcon === 'function' ? (
              renderStarIcon(i, value, name)
          ) : (
            <i style={{ fontStyle: 'normal' }}>&#9733;</i>
          )}
        </label>
      );
      starNodes.push(starNodeInput);
      starNodes.push(starNodeLabel);
    }

    return starNodes;
  }

  render() {
    const { editing, className } = this.props;
    const classes = cx('dv-star-rating', {
      'dv-star-rating-non-editable': !editing
    }, className);

    return (
      <div style={{ display: 'inline-block', position: 'relative' }} className={classes}>
        {this.renderStars()}
      </div>
    );
  }
}
