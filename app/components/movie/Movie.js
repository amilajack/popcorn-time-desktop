/**
 * Movie component that is responsible for playing movie
 *
 * @todo: Remove state mutation, migrate to Redux reducers
 */

import React, { Component } from 'react';
import Butter from '../../api/Butter';
import WebTorrent from 'webtorrent';


export default class Movie extends Component {

  constructor(props) {
    super(props);

    this.butter = new Butter();
    this.state = {
      movieDetails: {}
    };

    this.getMovie(this.props.movieId);
  }

  async getMovie(movieId) {
    const movie = await this.butter.getMovie(movieId);

    this.setState({ movie });
    console.log(movie);
    this.startTorrent(movie.magnet);
  }

  startTorrent(magnetURI) {
    const client = new WebTorrent();
    console.log(magnetURI);

    client.add(magnetURI, function(torrent) {
      // Got torrent metadata!
      console.log('Client is downloading:', torrent.infoHash);

      torrent.files.forEach(function(file) {
        // Display the file by appending it to the DOM. Supports video, audio, images, and
        // more. Specify a container element (CSS selector or reference to DOM node).
        file.appendTo('body');
      });
    });
  }

  render() {
    return (
      <div>
        {this.props.movieDetails}
      </div>
    );
  }
}
