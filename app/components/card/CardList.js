import React, { Component } from 'react';
import styles from './CardList.css';

export default class Card extends Component {
  render() {
    return (
      <div className="row">
        <div className="col-xs-12">
          <div className={styles.CardList}>
            {this.props.movies.map((movie, index) => {
              return (
                <div className={styles.Card} key={index}>
                  <img src={movie.images.poster} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
