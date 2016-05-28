import { expect } from 'chai';
import Butter from '../../app/api/Butter';
import assert from 'assert';

const imdbId = 'tt0120737';

describe('api', () => {
  describe('Butter', () => {
    describe('metadata', () => {
      describe('movies', () => {
        it('should return array of objects', async (done) => {
          const movies = await moviesFactory();
          const movie = movies[0];
          expect(movies).to.be.a('array');
          expect(movie).to.be.an('object');
          done();
        });

        it('should have movies that have necessary properties', async (done) => {
          const movies = await moviesFactory();
          const movie = movies[0];
          assertMovieFormat(movie);
          done();
        });
      });

      describe('movie', () => {
        it('should have necessary properties', async (done) => {
          const movie = await movieFactory();
          assertMovieFormat(movie);
          done();
        });
      });

      describe('search', () => {
        it('should search movies and return valid response', async (done) => {
          const searchResults = await butterFactory().search('harry potter', 'movies');
          expect(searchResults).to.be.a('array');
          const movie = searchResults[0];
          expect(movie).to.be.an('object');
          assertMovieFormat(movie);
          done();
        });
      });
    });

    describe('torrents', () => {
      it('should get torrents and return torrent magnets of 720 and 1080 quality', async (done) => {
        const torrent = await butterFactory().getTorrent(imdbId);
        assertTorrentFormat(torrent);
        done();
      });
    });
  });
});

function butterFactory() {
  return new Butter();
}

function moviesFactory() {
  return new Butter().getMovies(1, 50);
}

function movieFactory() {
  return new Butter().getMovie(imdbId);
}

function assertNAorNumber(variable) {
  const assertion = variable === 'n/a' || typeof variable === 'number';
  expect(assertion).to.be.true;  // eslint-disable-line no-unused-expressions
}

function assertMovieFormat(movie) {
  expect(movie).to.have.property('title').that.is.a('string');
  expect(movie).to.have.property('year').that.is.a('number');
  expect(movie).to.have.property('id').that.is.a('string');
  expect(movie).to.have.property('imdbId').that.is.a('string');
  expect(movie).to.have.property('summary').that.is.a('string');
  assertNAorNumber(movie.rating);
  expect(movie).to.have.property('images').that.is.an('object');
  expect(movie).to.have.deep.property('images.poster').that.is.an('object');
  expect(movie).to.have.deep.property('images.fanart').that.is.an('object');
  expect(movie).to.have.deep.property('images.poster.full').that.is.a('string');
  expect(movie).to.have.deep.property('images.poster.medium').that.is.a('string');
  expect(movie).to.have.deep.property('images.poster.thumb').that.is.a('string');
  expect(movie).to.have.deep.property('images.fanart.full').that.is.a('string');
  expect(movie).to.have.deep.property('images.fanart.medium').that.is.a('string');
  expect(movie).to.have.deep.property('images.fanart.thumb').that.is.a('string');
}

function assertTorrentFormat(torrent) {
  expect(torrent).to.be.an('object');
  expect(torrent).to.have.property('720p').that.is.an('object');
  expect(torrent).to.have.property('1080p').that.is.an('object');

  expect(torrent).to.have.deep.property('720p.quality').that.is.a('string');
  expect(torrent).to.have.deep.property('720p.magnet').that.is.a('string');
  expect(torrent).to.have.deep.property('720p.seeders');
  assertNAorNumber(torrent['720p'].seeders);
  expect(torrent).to.have.deep.property('720p.leechers');
  assertNAorNumber(torrent['720p'].leechers);

  expect(torrent).to.have.deep.property('1080p.quality').that.is.a('string');
  expect(torrent).to.have.deep.property('1080p.magnet').that.is.a('string');
  expect(torrent).to.have.deep.property('1080p.seeders');
  assertNAorNumber(torrent['1080p'].seeders);
  expect(torrent).to.have.deep.property('1080p.leechers');
  assertNAorNumber(torrent['1080p'].leechers);
}
