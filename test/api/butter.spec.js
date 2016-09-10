/* eslint global-require: 0, fp/no-loops: 0 */
import { expect } from 'chai';
import Butter from '../../app/api/Butter';
import MockShows from './butter.mock.js';
import {
  formatSeasonEpisodeToString,
  formatSeasonEpisodeToObject,
  sortTorrentsBySeeders,
  resolveEndpoint
} from '../../app/api/torrents/BaseTorrentProvider';
import { getStatuses } from '../../app/api/torrents/TorrentAdapter';
import { convertRuntimeToHours } from '../../app/api/metadata/MetadataAdapter';


const imdbId = 'tt0468569'; // The Dark Knight
const showImdbId = 'tt1475582'; // Sherlock

const torrentBasePath = '../../app/api/torrents';
const providers = [
  {
    name: 'PirateBay',
    provider: require(`${torrentBasePath}/PbTorrentProvider`)
  },
  {
    name: 'PopcornTime',
    provider: require(`${torrentBasePath}/PctTorrentProvider`)
  },
  {
    name: 'Kat',
    provider: require(`${torrentBasePath}/KatTorrentProvider`)
  },
  {
    name: 'Yts',
    provider: require(`${torrentBasePath}/YtsTorrentProvider`)
  }
];

function greaterThanOrEqualTo(first, second) {
  return (first > second || first === second);
}

describe('api ->', function testApi() {
  this.retries(3);

  describe('Status', () => {
    it('should get status of providers', async done => {
      try {
        for (const _provider of providers) {
          expect(await _provider.provider.getStatus()).to.be.a('boolean');
        }
        done();
      } catch (error) {
        done(error);
      }
    });

    it('should get an array of statuses', async done => {
      try {
        const statuses = await getStatuses();
        expect(statuses).to.be.an('array');
        for (const status of statuses) {
          expect(status).to.be.an('object');
          expect(status).to.have.deep.property('providerName').that.is.a('string');
          expect(status).to.have.deep.property('online').that.is.a('boolean');
        }
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe('Torrent Providers ->', () => {
    describe('Movie ->', () => {
      const movieProviders = [
        {
          name: 'PirateBay',
          provider: require(`${torrentBasePath}/PbTorrentProvider`),
          minTorrentsCount: 5,
          minSeederCount: 100,
          id: 'pb'
        },
        {
          name: 'PopcornTime',
          provider: require(`${torrentBasePath}/PctTorrentProvider`),
          minTorrentsCount: 0,
          minSeederCount: 400,
          id: 'pct'
        },
        // {
        //   name: 'Kat',
        //   provider: require(`${torrentBasePath}/KatTorrentProvider`),
        //   minTorrentsCount: 5,
        //   minSeederCount: 100,
        //   id: 'kat'
        // },
        {
          name: 'Yts',
          provider: require(`${torrentBasePath}/YtsTorrentProvider`),
          minTorrentsCount: 1,
          minSeederCount: 200,
          id: 'yts'
        }
      ];

      for (const providerConfig of movieProviders) {
        it(`${providerConfig.name}TorrentProvider should return movie torrents`,
        async function testTorrentProviders(done) {
          try {
            this.timeout(10000);

            const torrents = await providerConfig.provider.provide('tt0330373', 'movies', {
              searchQuery: 'Harry Potter and the Goblet of Fire'
            });

            expect(torrents).to.be.an('array');
            console.log(
              `\t ${providerConfig.name}TorrentProvider torrent count: `, torrents.length
            );
            expect(torrents).to.have.length.above(providerConfig.minTorrentsCount - 1);

            if (torrents.length) {
              const seederCount = sortTorrentsBySeeders(torrents)[0].seeders;
              console.log(
                `\t ${providerConfig.name}TorrentProvider seeder count: `, seederCount
              );
              expect(seederCount).to.be.at.least(providerConfig.minSeederCount);
            }

            for (const torrent of torrents) {
              assertProviderTorrent(torrent);
              expect(torrent).to.have.property('_provider')
                .that.equals(providerConfig.id);
            }
            done();
          } catch (error) {
            done(error);
          }
        });
      }
    });

    describe('Show ->', () => {
      const showTorrentProviders = [
        {
          name: 'PirateBay',
          provider: require(`${torrentBasePath}/PbTorrentProvider`),
          minTorrentsCount: 5,
          minSeederCount: 400,
          id: 'pb'
        },
        {
          name: 'PopcornTime',
          provider: require(`${torrentBasePath}/PctTorrentProvider`),
          minTorrentsCount: 0,
          minSeederCount: 100,
          id: 'pct'
        }
        // {
        //   name: 'Kat',
        //   provider: require(`${torrentBasePath}/KatTorrentProvider`),
        //   minTorrentsCount: 5,
        //   minSeederCount: 100,
        //   id: 'kat'
        // }
      ];

      const extendedDetails = {
        searchQuery: 'game of thrones',
        season: 6,
        episode: 6
      };

      for (const providerConfig of showTorrentProviders) {
        it(`${providerConfig.name}TorrentProvider should return show torrents`,
        async function testTorrentProviders(done) {
          try {
            this.timeout(10000);

            const torrents = await providerConfig.provider.provide(
              showImdbId, 'shows', extendedDetails
            );

            expect(torrents).to.be.an('array');
            console.log(
              `\t ${providerConfig.name}TorrentProvider torrent count: `, torrents.length
            );
            expect(torrents).to.have.length.above(providerConfig.minTorrentsCount - 1);

            if (torrents.length) {
              const seederCount = sortTorrentsBySeeders(torrents)[0].seeders;
              console.log(
                `\t ${providerConfig.name}TorrentProvider seeder count: `, seederCount
              );
              expect(seederCount).to.be.at.least(providerConfig.minSeederCount);
            }

            for (const torrent of torrents) {
              assertProviderTorrent(torrent);
              expect(torrent).to.have.property('_provider')
                .that.equals(providerConfig.id);
            }
            done();
          } catch (error) {
            done(error);
          }
        });
      }
    });

    describe('Show Complete ->', () => {
      const showTorrentProviders = [
        {
          name: 'PirateBay',
          provider: require(`${torrentBasePath}/PbTorrentProvider`),
          minTorrentsCount: 20,
          minSeederCount: 700,
          id: 'pb'
        },
        {
          name: 'Kat',
          provider: require(`${torrentBasePath}/KatTorrentProvider`),
          minTorrentsCount: 0,
          minSeederCount: 100,
          id: 'kat'
        }
      ];

      const extendedDetails = {
        searchQuery: 'game of thrones',
        season: 6,
        episode: 6
      };

      for (const providerConfig of showTorrentProviders) {
        it(`${providerConfig.name}TorrentProvider should return show torrents`,
        async function testTorrentProviders(done) {
          try {
            this.timeout(10000);

            const torrents = await providerConfig.provider.provide(
              showImdbId, 'season_complete', extendedDetails
            );

            expect(torrents).to.be.an('array');
            console.log(
              `\t ${providerConfig.name}TorrentProvider torrent count: `, torrents.length
            );
            expect(torrents).to.have.length.above(providerConfig.minTorrentsCount - 1);

            if (torrents.length) {
              const seederCount = sortTorrentsBySeeders(torrents)[0].seeders;
              console.log(
                `\t ${providerConfig.name}TorrentProvider seeder count: `, seederCount
              );
              expect(seederCount).to.be.at.least(providerConfig.minSeederCount);
            }

            for (const torrent of torrents) {
              assertProviderTorrent(torrent);
              expect(torrent).to.have.property('_provider')
                .that.equals(providerConfig.id);
            }
            done();
          } catch (error) {
            done(error);
          }
        });
      }
    });
  });

  describe('Butter ->', () => {
    describe('metadata ->', () => {
      describe('time format ->', () => {
        it('should convert time from minutes to hours', done => {
          try {
            expect(convertRuntimeToHours(64).full).to.equal('1 hour 4 minutes');
            expect(convertRuntimeToHours(20).full).to.equal('20 minutes');
            expect(convertRuntimeToHours(64).hours).to.equal(1);
            expect(convertRuntimeToHours(64).minutes).to.equal(4);

            expect(convertRuntimeToHours(126).full).to.equal('2 hours 6 minutes');
            expect(convertRuntimeToHours(56).full).to.equal('56 minutes');
            expect(convertRuntimeToHours(126).hours).to.equal(2);
            expect(convertRuntimeToHours(126).minutes).to.equal(6);

            expect(convertRuntimeToHours(60).full).to.equal('1 hour');
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('format episode and season ->', () => {
        it('should format correctly', done => {
          try {
            expect(formatSeasonEpisodeToString(1, 4)).to.equal('s01e04');
            expect(formatSeasonEpisodeToString(20, 40)).to.equal('s20e40');
            expect(formatSeasonEpisodeToString(5, 10)).to.equal('s05e10');
            expect(formatSeasonEpisodeToString(22, 22)).to.equal('s22e22');

            expect(formatSeasonEpisodeToObject(1, 4)).to.eql({ season: '01', episode: '04' });
            expect(formatSeasonEpisodeToObject(5, 10)).to.eql({ season: '05', episode: '10' });
            expect(formatSeasonEpisodeToObject(22, 22)).to.eql({ season: '22', episode: '22' });
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('movies ->', () => {
        it('should return array of objects', async done => {
          try {
            const movies = await moviesFactory();
            const movie = movies[0];
            expect(movies).to.be.a('array');
            expect(movie).to.be.an('object');
            done();
          } catch (error) {
            done(error);
          }
        });

        it('should have movies that have necessary properties', async done => {
          try {
            const movies = await moviesFactory();
            const movie = movies[0];
            assertMovieFormat(movie);
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('movie ->', () => {
        it('should have necessary properties', async done => {
          try {
            const movie = await new Butter().getMovie('tt0417741');
            assertMovieFormat(movie);
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('shows ->', () => {
        it('should return array of objects', async done => {
          try {
            const shows = await butterFactory().getShows();
            const show = shows[0];
            expect(shows).to.be.a('array');
            expect(show).to.be.an('object');
            done();
          } catch (error) {
            done(error);
          }
        });

        it('should have movies that have necessary properties', async done => {
          try {
            const shows = await butterFactory().getShows();
            const show = shows[0];
            assertMovieFormat(show);
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('show ->', () => {
        it('should get show metadata', async done => {
          try {
            const showMetadata = await butterFactory().getShow('tt0944947');
            assertMovieFormat(showMetadata);
            done();
          } catch (error) {
            done(error);
          }
        });

        it('should get seasons', async done => {
          try {
            const seasons = await butterFactory().getSeasons('tt1475582');
            expect(seasons).to.be.an('array');

            const season = seasons[0];
            expect(season).to.be.an('object');
            expect(season).to.have.property('season').that.equals(1);
            expect(season).to.have.deep.property('images.full').that.is.a('string');
            expect(season).to.have.deep.property('images.medium').that.is.a('string');
            expect(season).to.have.deep.property('images.thumb').that.is.a('string');
            done();
          } catch (error) {
            done(error);
          }
        });

        it('should get season', async done => {
          try {
            const episodes = await butterFactory().getSeason('game-of-thrones', 1);
            expect(episodes).to.be.an('array');

            const episode = episodes[0];
            expect(episode).to.be.an('object');
            expect(episode).to.have.property('season').that.equals(1);
            expect(episode).to.have.property('episode').that.equals(1);
            expect(episode).to.have.property('id').that.equals('tt1480055');
            expect(episode).to.have.property('title').that.equals('Winter Is Coming');
            expect(episode).to.have.deep.property('images.full').that.is.a('string');
            expect(episode).to.have.deep.property('images.medium').that.is.a('string');
            expect(episode).to.have.deep.property('images.thumb').that.is.a('string');
            done();
          } catch (error) {
            done(error);
          }
        });

        it('should get episode', async done => {
          try {
            const episode = await butterFactory().getEpisode('tt1475582', 2, 2);
            expect(episode).to.be.an('object');
            expect(episode).to.have.property('season').that.equals(2);
            expect(episode).to.have.property('episode').that.equals(2);
            expect(episode).to.have.property('id').that.equals('tt1942613');
            expect(episode).to.have.property('title').that.equals('The Hounds of Baskerville');
            expect(episode).to.have.property('overview').that.is.a('string');
            expect(episode).to.have.property('rating').that.is.a('number').that.is.within(0, 10);
            expect(episode).to.have.deep.property('images.full').that.is.a('string');
            expect(episode).to.have.deep.property('images.medium').that.is.a('string');
            expect(episode).to.have.deep.property('images.thumb').that.is.a('string');
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('similar ->', () => {
        it('should get similar movies and shows in correct format', async done => {
          try {
            const similarMovies = await butterFactory().getSimilar('movies', imdbId);
            // const similarShows = await butterFactory().getSimilar('shows', showImdbId);

            assertMovieFormat(similarMovies[0]);
            // assertMovieFormat(similarShows[0]);
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('search ->', () => {
        it('should search movies in correct format', async done => {
          try {
            const searchResults = await butterFactory().search(
              'Harry Potter and the Goblet of Fire', 'movies'
            );
            expect(searchResults).to.be.a('array');
            const movie = searchResults[0];
            expect(movie).to.be.an('object');
            assertMovieFormat(movie);
            done();
          } catch (error) {
            done(error);
          }
        });
      });
    });

    describe('torrents ->', () => {
      describe('movie torrents ->', () => {
        it('should get torrents and their magnets of 720p and 1080p', async done => {
          try {
            const torrent = await butterFactory().getTorrent(imdbId, 'movies', {
              searchQuery: 'the dark knight'
            });

            for (const quality of ['720p', '1080p']) {
              assertSingleTorrent(torrent[quality]);
              expect(torrent[quality])
                .to.have.deep.property('quality')
                .that.is.a('string')
                .that.equals(quality);
            }
            done();
          } catch (error) {
            done(error);
          }
        });

        it('should order torrents by seeder count by default',
        async function testSeederOrder(done) {
          this.timeout(20000);

          try {
            // Get all sorted torrents
            const torrents = await butterFactory().getTorrent('tt1375666', 'movies', {
              searchQuery: 'Inception'
            }, true);

            for (const torrent of torrents) {
              assertSingleTorrent(torrent);
            }

            if (torrents.length >= 4) {
              greaterThanOrEqualTo(torrents[0].seeders, torrents[1].seeders);
              greaterThanOrEqualTo(torrents[1].seeders, torrents[2].seeders);
              greaterThanOrEqualTo(torrents[2].seeders, torrents[3].seeders);
            }

            if (torrents.length > 1) {
              greaterThanOrEqualTo(
                torrents[0].seeders,
                torrents[torrents.length - 1].seeders
              );
            }

            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('show torrents ->', () => {
        it('should get show torrent by imdbId', async done => {
          try {
            const torrents = await butterFactory().getTorrent('tt0944947', 'shows', {
              season: 2,
              episode: 2,
              searchQuery: 'game of thrones'
            });

            expect(torrents).to.be.an('object');

            for (const quality of ['480p', '720p', '1080p']) {
              if (torrents[quality]) {
                assertSingleTorrent(torrents[quality]);
                expect(torrents[quality])
                  .to.have.deep.property('quality')
                  .that.is.a('string')
                  .that.equals(quality);
              }
            }
            done();
          } catch (error) {
            done(error);
          }
        });

        it('should get season_complete torrents', async done => {
          try {
            const torrents = await butterFactory().getTorrent(imdbId, 'season_complete', {
              searchQuery: 'game of thrones',
              season: 6
            });

            expect(torrents).to.be.an('object');

            for (const quality of ['480p', '720p', '1080p']) {
              if (torrents[quality]) {
                assertSingleTorrent(torrents[quality]);
                expect(torrents[quality])
                  .to.have.deep.property('quality')
                  .that.is.a('string')
                  .that.equals(quality);
              }
            }
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('Helpers', () => {
        it('should return custom endpoint config', done => {
          try {
            const resolvedEndpoint = resolveEndpoint('https://some-website.com/search', 'TEST');
            expect(resolvedEndpoint).to.equal('https://test.org/search');
            done();
          } catch (error) {
            done(error);
          }
        });

        it('should return default for unknown endpoints', done => {
          try {
            const resolvedEndpoint = resolveEndpoint('https://some-website.com/search', 'TEST');
            expect(resolvedEndpoint).to.equal('https://test.org/search');
            done();
          } catch (error) {
            done(error);
          }
        });
      });

      describe('Subtitles', function testSubtitles() {
        this.timeout(30000);

        before(async () => {
          this.subtitles = await butterFactory().getSubtitles(
            'tt0468569',
            'The.Dark.Knight.2008.720p.BluRay.x264.YIFY.mp4',
            undefined,
            {
              activeMode: 'movies'
            }
          );
        });

        describe('Movie', () => {
          it('should return subtitles', async done => {
            try {
              expect(this.subtitles).to.be.an('array');

              for (const subtitle of this.subtitles) {
                expect(subtitle).to.be.an('object');
                expect(subtitle).to.have.deep.property('kind').that.is.a('string');
                expect(subtitle).to.have.deep.property('label').that.is.a('string');
                expect(subtitle).to.have.deep.property('srclang').that.is.a('string');
                expect(subtitle).to.have.deep.property('src').that.is.a('string');
                expect(subtitle).to.have.deep.property('default').that.is.a('boolean');
              }

              done();
            } catch (error) {
              done(error);
            }
          });
        });

        describe('Show', () => {
          it.skip('should return subtitles', async done => {
            try {
              const subtitles = await butterFactory().getSubtitles(showImdbId);
              expect(subtitles).to.be.an('array');
              for (const subtitle of subtitles) {
                expect(subtitle).to.be.an('object');
              }
              done();
            } catch (error) {
              done(error);
            }
          });
        });
      });

      describe.skip('Series Tests', () => {
        describe('valid torrents for top 20 shows', () => {
          for (const show of MockShows.filter((e, i) => i < 20)) {
            it(`${show.title} Season 1 Episode 1`, async (done) => {
              try {
                const torrent = await butterFactory().getTorrent(show.id, 'shows', {
                  season: 1,
                  episode: 1,
                  searchQuery: show.title
                });
                expect(torrent).to.be.an('object');

                for (const quality of ['480p', '720p', '1080p']) {
                  if (torrent[quality]) {
                    assertSingleTorrent(torrent[quality]);
                    expect(torrent[quality])
                      .to.have.deep.property('quality')
                      .that.is.a('string')
                      .that.equals(quality);
                  }
                }
                done();
              } catch (error) {
                done(error);
              }
            });
          }
        });
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

  expect(movie.trailer).to.satisfy(s => s === null || typeof s === 'string');

  expect(movie).to.have.property('images').that.is.an('object');
  assertImageFormat(movie);
}

function assertImageFormat(item) {
  expect(item).to.have.deep.property('images.poster').that.is.an('object');
  expect(item).to.have.deep.property('images.fanart').that.is.an('object');
  expect(item).to.have.deep.property('images.poster.full').that.is.a('string');
  expect(item).to.have.deep.property('images.poster.medium').that.is.a('string');
  expect(item).to.have.deep.property('images.poster.thumb').that.is.a('string');
  expect(item).to.have.deep.property('images.fanart.full').that.is.a('string');
  expect(item).to.have.deep.property('images.fanart.medium').that.is.a('string');
  expect(item).to.have.deep.property('images.fanart.thumb').that.is.a('string');
}

function assertSingleTorrent(torrent) {
  expect(torrent)
    .to.be.an('object');

  expect(torrent)
    .to.have.deep.property('_provider')
    .that.is.a('string');

  expect(torrent)
    .to.have.deep.property('magnet')
    .that.is.a('string');

  expect(torrent)
    .to.have.deep.property('health')
    .that.is.a('string')
    .that.oneOf(['healthy', 'decent', 'poor']);

  expect(torrent)
    .to.have.deep.property('seeders')
    .that.is.a('number')
    .that.is.at.least(0);

  expect(torrent)
    .to.have.deep.property('metadata')
    .that.is.a('string');

  assertNAorNumber(torrent.seeders);

  expect(torrent)
    .to.have.deep.property('leechers')
    .that.is.a('number')
    .that.is.at.least(0);

  assertNAorNumber(torrent.leechers);
}

function assertProviderTorrent(torrent) {
  expect(torrent)
    .to.be.an('object');

  expect(torrent)
    .to.have.deep.property('_provider')
    .that.is.a('string');

  expect(torrent)
    .to.have.deep.property('magnet')
    .that.is.a('string');

  expect(torrent)
    .to.have.deep.property('seeders')
    .that.is.a('number')
    .that.is.at.least(0);

  expect(torrent)
    .to.have.deep.property('leechers')
    .that.is.a('number')
    .that.is.at.least(0);

  expect(torrent)
    .to.have.deep.property('metadata')
    .that.is.a('string');

  assertNAorNumber(torrent.seeders);

  expect(torrent)
    .to.have.deep.property('leechers')
    .that.is.a('number')
    .that.is.at.least(0);

  assertNAorNumber(torrent.leechers);
}
