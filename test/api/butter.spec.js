import { expect } from 'chai';
import Butter from '../../app/api/Butter';
import assert from 'assert';
import { convertRuntimeToHours } from '../../app/api/metadata/MetadataAdapter';


const imdbId = 'tt0120737';

function greaterThanOrEqualTo(first, second) {
  return (first > second || first === second);
}

describe('api', () => {
  describe('Butter', () => {
    describe('metadata', () => {
      describe('movies', () => {
        it('should convert time from minutes to hours', (done) => {
          try {
            expect(convertRuntimeToHours(64).full).to.equal('1 hour 4 minutes');
            expect(convertRuntimeToHours(64).hours).to.equal(1);
            expect(convertRuntimeToHours(64).minutes).to.equal(4);

            expect(convertRuntimeToHours(126).full).to.equal('2 hours 6 minutes');
            expect(convertRuntimeToHours(126).hours).to.equal(2);
            expect(convertRuntimeToHours(126).minutes).to.equal(6);

            done();
          } catch (err) {
            done(err);
          }
        });

        it('should return array of objects', async (done) => {
          try {
            const movies = await moviesFactory();
            const movie = movies[0];
            expect(movies).to.be.a('array');
            expect(movie).to.be.an('object');
            done();
          } catch (err) {
            done(err);
          }
        });

        it('should have movies that have necessary properties', async (done) => {
          try {
            const movies = await moviesFactory();
            const movie = movies[0];
            assertMovieFormat(movie);
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      describe('movie', () => {
        it('should have necessary properties', async (done) => {
          try {
            const movie = await movieFactory();
            assertMovieFormat(movie);
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      describe('similar', () => {
        it('should get similar movies in correct format', async (done) => {
          try {
            const similarMovies = await butterFactory().getSimilarMovies(imdbId);
            assertMovieFormat(similarMovies[0]);
            done();
          } catch (err) {
            done(err);
          }
        });
      });

      describe('search', () => {
        it('should search movies in correct format', async (done) => {
          try {
            const searchResults = await butterFactory().search('harry potter', 'movies');
            expect(searchResults).to.be.a('array');
            const movie = searchResults[0];
            expect(movie).to.be.an('object');
            assertMovieFormat(movie);
            done();
          } catch (err) {
            done(err);
          }
        });
      });
    });

    describe('torrents', () => {
      it('should get torrents and their magnets of 720p and 1080p', async (done) => {
        try {
          const torrent = await butterFactory().getTorrent(imdbId);
          assertTorrentFormat(torrent);
          done();
        } catch (err) {
          done(err);
        }
      });

      it('should order torrents by seeder count by default', async (done) => {
        try {
          // Get all sorted torrents
          const torrents = await butterFactory().getTorrent('tt1375666', {
            searchQuery: 'Inception',
          }, true);

          greaterThanOrEqualTo(torrents[0].seeders, torrents[1].seeders);
          greaterThanOrEqualTo(torrents[1].seeders, torrents[2].seeders);
          greaterThanOrEqualTo(torrents[3].seeders, torrents[4].seeders);
          done();
        } catch (err) {
          done(err);
        }
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
  expect(movie).to.have.property('genres').that.is.an('array');
  assertNAorNumber(movie.rating);

  expect(movie).to.have.property('runtime').that.is.an('object');
  expect(movie).to.have.deep.property('runtime.full').that.is.a('string');
  assertNAorNumber(movie.runtime.hours);
  assertNAorNumber(movie.runtime.minutes);

  expect(movie).to.have.property('trailer').that.is.a('string');

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
  expect(torrent).to.have.deep.property('720p._provider').that.is.a('string');
  expect(torrent).to.have.deep.property('720p.magnet').that.is.a('string');
  expect(torrent).to.have.deep.property('720p.health')
                  .that.is.a('string')
                  .that.oneOf(['healthy', 'decent', 'poor']);

  expect(torrent).to.have.deep.property('720p.seeders')
                  .that.is.a('number')
                  .that.is.at.least(0);

  assertNAorNumber(torrent['720p'].seeders);
  expect(torrent).to.have.deep.property('720p.leechers')
                  .that.is.a('number')
                  .that.is.at.least(0);

  assertNAorNumber(torrent['720p'].leechers);

  expect(torrent).to.have.deep.property('1080p.quality').that.is.a('string');
  expect(torrent).to.have.deep.property('1080p._provider').that.is.a('string');
  expect(torrent).to.have.deep.property('1080p.magnet').that.is.a('string');
  expect(torrent).to.have.deep.property('1080p.health')
                  .that.is.a('string')
                  .that.oneOf(['healthy', 'decent', 'poor']);

  expect(torrent).to.have.deep.property('1080p.seeders')
                  .that.is.a('number')
                  .that.is.at.least(0);

  assertNAorNumber(torrent['1080p'].seeders);
  expect(torrent).to.have.deep.property('1080p.leechers')
                  .that.is.a('number')
                  .that.is.at.least(0);

  assertNAorNumber(torrent['1080p'].leechers);
}
