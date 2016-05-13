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
    const movieDetails = await this.butter.getMovie(movieId);
    console.log(movieDetails);
    this.setState({ movieDetails });
  }

  startTorrent() {
    const client = new WebTorrent();
    const magnetURI = '...';

    client.add(magnetURI, torrent => {
      // Got torrent metadata!
      console.log('Client is downloading:', torrent.infoHash);

      torrent.files.forEach(file => {
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
