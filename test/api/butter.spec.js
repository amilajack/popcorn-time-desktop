/* eslint no-underscore-dangle: 0 */
import { expect as chaiExpect } from 'chai';
import Butter from '../../app/api/Butter';
import MockShows from './butter.mock';
import {
  formatSeasonEpisodeToString,
  formatSeasonEpisodeToObject,
  sortTorrentsBySeeders,
  resolveEndpoint
} from '../../app/api/torrents/BaseTorrentProvider';
import { getStatuses } from '../../app/api/torrents/TorrentAdapter';
import { parseRuntimeMinutesToObject } from '../../app/api/metadata/MetadataAdapter';
import { set, get, clear } from '../../app/utils/Config';

const imdbId = 'tt0468569'; // The Dark Knight
const showImdbId = 'tt1475582'; // Sherlock

const torrentBasePath = '../../app/api/torrents';
const providers = [
  // {
  //   name: 'PirateBay',
  //   provider: require(`${torrentBasePath}/PbTorrentProvider`)
  // },
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

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

function greaterThanOrEqualTo(first, second) {
  return first > second || first === second;
}

describe('API', () => {
  describe('Status', () => {
    it.concurrent('should get status of providers', async () => {
      for (const _provider of providers) {
        chaiExpect(await _provider.provider.getStatus()).to.be.a('boolean');
      }
    });

    it.concurrent('should get an array of statuses', async () => {
      const statuses = await getStatuses();
      for (const status of statuses) {
        chaiExpect(status).to.be.an('object');
        chaiExpect(status.providerName).to.be.an('string');
        chaiExpect(status.online).to.be.an('boolean');
      }
    });
  });

  describe('Utils', () => {
    it('should set, get, list cache', () => {
      clear();

      expect(get('__test__')).toBe(undefined);

      set('__test__', 'some_value');
      expect(get('__test__')).toEqual('some_value');

      set('__test__', { testingValue: 'someTestingValue' });
      expect(get('__test__')).toEqual({ testingValue: 'someTestingValue' });

      set('__test__', [{ some: 'who' }]);
      set('__test__', []);
      expect(get('__test__')).toEqual([]);
    });
  });

  describe('Config', () => {
    it.concurrent('should add favorites, recentlyWatched, watchList', async () => {
      for (const type of ['favorites', 'watchList', 'recentlyWatched']) {
        clear();

        const res = {
          who: 'moo',
          id: 'who'
        };

        const butter = butterFactory();

        // Test addition
        expect(await butter[type]('set', res)).toEqual([res]);
        expect(await butter[type]('get', res)).toEqual([res]);

        // Test addition of multiple elements
        expect(
          await butter[type]('set', {
            ...res,
            id: 'lee'
          })
        ).toEqual([
          res,
          {
            ...res,
            id: 'lee'
          }
        ]);
        expect(await butter[type]('get')).toEqual([
          res,
          {
            ...res,
            id: 'lee'
          }
        ]);

        // @TODO: Test removal of elements. Currently, this fails without an
        //        obvious reason
        //
        // expect(await butter[type]('remove', {
        //   id: 'lee'
        // }))
        // .to.eql([res]);
        // expect(await butter[type]('get')).to.eql([res]);
      }
    });
  });

  describe('Torrent Providers', () => {
    describe('Movie', () => {
      const movieProviders = [
        // {
        //   name: 'PirateBay',
        //   provider: require(`${torrentBasePath}/PbTorrentProvider`),
        //   minTorrentsCount: 5,
        //   minSeederCount: 100,
        //   id: 'pb'
        // },
        {
          name: 'PopcornTime',
          provider: require(`${torrentBasePath}/PctTorrentProvider`),
          minTorrentsCount: 0,
          minSeederCount: 300,
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
        it(`${providerConfig.name}TorrentProvider should return movie torrents`, async () => {
          const torrents = await providerConfig.provider.provide(
            'tt0330373',
            'movies',
            {
              searchQuery: 'Harry Potter and the Goblet of Fire'
            }
          );

          console.log(
            `\t ${providerConfig.name}TorrentProvider torrent count: `,
            torrents.length
          );
          expect(torrents.length).toBeGreaterThan(
            providerConfig.minTorrentsCount - 1
          );

          if (torrents.length) {
            const seederCount = sortTorrentsBySeeders(torrents)[0].seeders;
            console.log(
              `\t ${providerConfig.name}TorrentProvider seeder count: `,
              seederCount
            );
            expect(seederCount).toBeGreaterThanOrEqual(
              providerConfig.minSeederCount
            );
          }

          for (const torrent of torrents) {
            assertProviderTorrent(torrent);
            expect(torrent)
              .toHaveProperty('_provider')
            expect(torrent._provider)
              .toEqual(providerConfig.id);
          }
        });
      }
    });

    describe('Show', () => {
      const showTorrentProviders = [
        // {
        //   name: 'PirateBay',
        //   provider: require(`${torrentBasePath}/PbTorrentProvider`),
        //   minTorrentsCount: 5,
        //   minSeederCount: 300,
        //   id: 'pb'
        // },
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
        it(`${providerConfig.name}TorrentProvider should return show torrents`, async () => {
          const torrents = await providerConfig.provider.provide(
            showImdbId,
            'shows',
            extendedDetails
          );

          console.log(
            `\t ${providerConfig.name}TorrentProvider torrent count: `,
            torrents.length
          );
          expect(torrents.length).toBeGreaterThan(
            providerConfig.minTorrentsCount - 1
          );

          if (torrents.length) {
            const seederCount = sortTorrentsBySeeders(torrents)[0].seeders;
            console.log(
              `\t ${providerConfig.name}TorrentProvider seeder count: `,
              seederCount
            );
            expect(seederCount).toBeGreaterThanOrEqual(
              providerConfig.minSeederCount
            );
          }

          for (const torrent of torrents) {
            assertProviderTorrent(torrent);
            expect(torrent)
              .toHaveProperty('_provider')
              .toEqual(providerConfig.id);
          }
        });
      }
    });

    describe('Show Complete', () => {
      const showTorrentProviders = [
        // {
        //   name: 'PirateBay',
        //   provider: require(`${torrentBasePath}/PbTorrentProvider`),
        //   minTorrentsCount: 20,
        //   minSeederCount: 500,
        //   id: 'pb'
        // },
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
        it(`${providerConfig.name}TorrentProvider should return show torrents`, async () => {
          const torrents = await providerConfig.provider.provide(
            showImdbId,
            'season_complete',
            extendedDetails
          );

          console.log(
            `\t ${providerConfig.name}TorrentProvider torrent count: `,
            torrents.length
          );
          expect(torrents.length).toBeGreaterThan(
            providerConfig.minTorrentsCount - 1
          );

          if (torrents.length) {
            const seederCount = sortTorrentsBySeeders(torrents)[0].seeders;
            console.log(
              `\t ${providerConfig.name}TorrentProvider seeder count: `,
              seederCount
            );
            expect(seederCount).toBeGreaterThanOrEqual(
              providerConfig.minSeederCount
            );
          }

          for (const torrent of torrents) {
            assertProviderTorrent(torrent);
            expect(torrent)
              .toHaveProperty('_provider')
              .toEqual(providerConfig.id);
          }
        });
      }
    });
  });

  describe('Butter', () => {
    describe('metadata', () => {
      describe('time format', () => {
        it('should convert time from minutes to hours', () => {
          expect(parseRuntimeMinutesToObject(64).full).toEqual('1 hour 4 minutes');
          expect(parseRuntimeMinutesToObject(20).full).toEqual('20 minutes');
          expect(parseRuntimeMinutesToObject(64).hours).toEqual(1);
          expect(parseRuntimeMinutesToObject(64).minutes).toEqual(4);

          expect(parseRuntimeMinutesToObject(126).full).toEqual('2 hours 6 minutes');
          expect(parseRuntimeMinutesToObject(56).full).toEqual('56 minutes');
          expect(parseRuntimeMinutesToObject(126).hours).toEqual(2);
          expect(parseRuntimeMinutesToObject(126).minutes).toEqual(6);

          expect(parseRuntimeMinutesToObject(60).full).toEqual('1 hour');
        });
      });

      describe('format episode and season', () => {
        it('should format correctly', () => {
          expect(formatSeasonEpisodeToString(1, 4)).toEqual('s01e04');
          expect(formatSeasonEpisodeToString(20, 40)).toEqual('s20e40');
          expect(formatSeasonEpisodeToString(5, 10)).toEqual('s05e10');
          expect(formatSeasonEpisodeToString(22, 22)).toEqual('s22e22');

          expect(formatSeasonEpisodeToObject(1, 4)).toEqual({
            season: '01',
            episode: '04'
          });
          expect(formatSeasonEpisodeToObject(5, 10)).toEqual({
            season: '05',
            episode: '10'
          });
          expect(formatSeasonEpisodeToObject(22, 22)).toEqual({
            season: '22',
            episode: '22'
          });
        });
      });

      describe('movies', () => {
        it.concurrent('should return array of objects', async () => {
          const movies = await moviesFactory();

          for (const movie of movies) {
            chaiExpect(movie).to.be.an('object');
          }
        });

        it.concurrent('should have movies that have necessary properties', async () => {
          const movies = await moviesFactory();

          for (const movie of movies) {
            assertMovieFormat(movie);
          }
        });
      });

      describe('movie', () => {
        it.concurrent('should have necessary properties', async () => {
          const movie = await new Butter().getMovie('tt0417741');
          assertMovieFormat(movie);
        });
      });

      describe('shows', () => {
        it.concurrent('should return array of objects', async () => {
          const shows = await butterFactory().getShows();

          for (const show of shows) {
            chaiExpect(show).to.be.an('object');
          }
        });

        it.concurrent('should have shows that have necessary properties', async () => {
          const shows = await butterFactory().getShows();

          for (const show of shows) {
            assertMovieFormat(show);
          }
        });
      });

      describe('show', () => {
        it.concurrent('should get show metadata', async () => {
          const showMetadata = await butterFactory().getShow('tt0944947');
          assertMovieFormat(showMetadata);
        });

        it.concurrent('should get seasons', async () => {
          const seasons = await butterFactory().getSeasons('tt1475582');
          const [season] = seasons;

          chaiExpect(season).to.be.an('object');
          expect(season).toHaveProperty('season').toEqual(1);
          chaiExpect(season).to.be.a('string');
          chaiExpect(season).to.be.a('string');
          chaiExpect(season).to.be.a('string');
        });

        it.concurrent('should get season', async () => {
          const episodes = await butterFactory().getSeason(
            'game-of-thrones',
            1
          );

          const [episode] = episodes;

          chaiExpect(episode).to.be.an('object');
          expect(episode).toHaveProperty('season').toEqual(1);
          expect(episode).toHaveProperty('episode').toEqual(1);
          expect(episode).toHaveProperty('id').toEqual('tt1480055');
          expect(episode).toHaveProperty('title').toEqual('Winter Is Coming');
          chaiExpect(episode).to.be.a('string');
          chaiExpect(episode).to.be.a('string');
          chaiExpect(episode).to.be.a('string');
        });

        it.concurrent('should get episode', async () => {
          const episode = await butterFactory().getEpisode('tt1475582', 2, 2);
          chaiExpect(episode).to.be.an('object');
          expect(episode).toHaveProperty('season').toEqual(2);
          expect(episode).toHaveProperty('episode').toEqual(2);
          expect(episode).toHaveProperty('id').toEqual('tt1942613');
          expect(episode).toHaveProperty('title');
          expect(episode.title).toEqual('The Hounds of Baskerville');
          chaiExpect(episode).to.be.a('string');
          chaiExpect(episode)
            .to.have.property('rating')
            .that.is.a('number')
            .toBeLessThanOrEqual(0);
          chaiExpect(episode)
            .to.have.property('rating')
            .that.is.a('number')
            .toBeGreaterThanOrEqual(10);
          chaiExpect(episode).to.be.a('string');
          chaiExpect(episode).to.be.a('string');
          chaiExpect(episode).to.be.a('string');
        });
      });

      describe('similar', () => {
        it.concurrent('should get similar movies and shows in correct format', async () => {
          const similarMovies = await butterFactory().getSimilar(
            'movies',
            imdbId
          );

          for (const similarMovie of similarMovies) {
            assertMovieFormat(similarMovie);
          }
        });
      });

      describe('search', () => {
        it.concurrent('should search movies in correct format', async () => {
          const searchResults = await butterFactory().search(
            'Harry Potter and the Goblet of Fire',
            'movies'
          );

          for (const movie of searchResults) {
            assertMovieFormat(movie);
          }
        });
      });
    });

    describe('torrents', () => {
      describe('movie torrents', () => {
        it.concurrent('should get torrents and their magnets of 720p and 1080p', async () => {
          const torrent = await butterFactory().getTorrent(imdbId, 'movies', {
            searchQuery: 'the dark knight'
          });

          for (const quality of ['720p', '1080p']) {
            assertSingleTorrent(torrent[quality]);
            chaiExpect(torrent[quality]).to.be.a('string').that.equals(quality);
          }
        });

        it.concurrent('should order torrents by seeder count by default', async () => {
          // this.timeout(20000);

          // Get all sorted torrents
          const torrents = await butterFactory().getTorrent(
            'tt1375666',
            'movies',
            {
              searchQuery: 'Inception'
            },
            true
          );

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
        });
      });

      describe('show torrents', () => {
        it.concurrent('should get show torrent by imdbId', async () => {
          const torrents = await butterFactory().getTorrent(
            'tt0944947',
            'shows',
            {
              season: 2,
              episode: 2,
              searchQuery: 'game of thrones'
            }
          );

          chaiExpect(torrents).to.be.an('object');

          for (const quality of ['480p', '720p', '1080p']) {
            if (torrents[quality]) {
              assertSingleTorrent(torrents[quality]);
              chaiExpect(torrents[quality]).to.be.a('string').toEqual(quality);
            }
          }
        });

        it.concurrent('should get season_complete torrents', async () => {
          const torrents = await butterFactory().getTorrent(
            imdbId,
            'season_complete',
            {
              searchQuery: 'game of thrones',
              season: 6
            }
          );

          chaiExpect(torrents).to.be.an('object');

          for (const quality of ['480p', '720p', '1080p']) {
            if (torrents[quality]) {
              assertSingleTorrent(torrents[quality]);
              chaiExpect(torrents[quality]).to.be.a('string').that.equals(quality);
            }
          }
        });
      });

      describe('Helpers', () => {
        it('should return custom endpoint config', () => {
          const resolvedEndpoint = resolveEndpoint(
            'https://some-website.com/search',
            'TEST'
          );
          expect(resolvedEndpoint).toEqual('https://test.org/search');
        });

        it('should return default for unknown endpoints', () => {
          const resolvedEndpoint = resolveEndpoint(
            'https://some-website.com/search',
            'TEST'
          );
          expect(resolvedEndpoint).toEqual('https://test.org/search');
        });
      });

      describe.skip('Subtitles', function testSubtitles() {
        // this.timeout(30000);

        beforeAll(async () => {
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
          it.concurrent('should return subtitles', async () => {
            for (const subtitle of this.subtitles) {
              chaiExpect(subtitle).to.be.an('object');
              chaiExpect(subtitle).to.be.a('string');
              chaiExpect(subtitle).to.be.a('string');
              chaiExpect(subtitle).to.be.a('string');
              chaiExpect(subtitle).to.be.a('string');
              chaiExpect(subtitle).to.be.a('boolean');
            }
          });
        });

        describe('Show', () => {
          it.concurrent.skip('should return subtitles', async () => {
            const subtitles = await butterFactory().getSubtitles(showImdbId);
            for (const subtitle of subtitles) {
              chaiExpect(subtitle).to.be.an('object');
            }
          });
        });
      });

      describe.skip('Series Tests', () => {
        describe('valid torrents for top 20 shows', () => {
          for (const show of MockShows.filter((e, i) => i < 20)) {
            it(`${show.title} Season 1 Episode 1`, async () => {
              const torrent = await butterFactory().getTorrent(
                show.id,
                'shows',
                {
                  season: 1,
                  episode: 1,
                  searchQuery: show.title
                }
              );
              chaiExpect(torrent).to.be.an('object');

              for (const quality of ['480p', '720p', '1080p']) {
                if (torrent[quality]) {
                  assertSingleTorrent(torrent[quality]);
                  expect(torrent[quality])
                    .toEqual(quality);
                }
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
  expect(assertion).toBe(true);
}

function assertMovieFormat(movie) {
  assertNAorNumber(movie.rating);
  assertNAorNumber(movie.runtime.hours);
  assertNAorNumber(movie.runtime.minutes);
  assertImageFormat(movie);
}

function assertImageFormat(item) {
  chaiExpect(item.images.poster).to.be.an('object');
  chaiExpect(item.images.fanart).to.be.an('object');
  chaiExpect(item.images.fanart.full).to.be.a('string');
  chaiExpect(item.images.fanart.medium).to.be.a('string');
  chaiExpect(item.images.fanart.thumb).to.be.a('string');
  chaiExpect(item.images.poster.full).to.be.a('string');
  chaiExpect(item.images.poster.medium).to.be.a('string');
  chaiExpect(item.images.poster.thumb).to.be.a('string');
}

function assertSingleTorrent(torrent) {
  chaiExpect(torrent).to.be.an('object');
  chaiExpect(torrent.magnet).to.be.a('string');
  chaiExpect(torrent.quality).to.be.a('string');
  chaiExpect(torrent.metadata).to.be.a('string');
  chaiExpect(torrent._provider).to.be.a('string');

  chaiExpect(torrent)
    .to.have.property('health')
    .that.is.a('string')
    .that.oneOf(['healthy', 'decent', 'poor']);
  chaiExpect(torrent)
    .to.have.property('seeders')
    .that.is.a('number')
    .that.is.greaterThan(0);
  chaiExpect(torrent)
    .to.have.property('leechers')
    .that.is.a('number')
    .that.is.greaterThan(0);

  assertNAorNumber(torrent.seeders);
  assertNAorNumber(torrent.leechers);
}

function assertProviderTorrent(torrent) {
  chaiExpect(torrent).to.be.an('object');
  chaiExpect(torrent.magnet).to.be.a('string');
  chaiExpect(torrent.quality).to.be.a('string');
  chaiExpect(torrent.metadata).to.be.a('string');
  chaiExpect(torrent._provider).to.be.a('string');

  chaiExpect(torrent)
    .to.have.property('seeders')
    .that.is.a('number')
    .that.is.greaterThan(0);
  chaiExpect(torrent)
    .to.have.property('leechers')
    .that.is.a('number')
    .that.is.greaterThan(0);

  assertNAorNumber(torrent.seeders);
  assertNAorNumber(torrent.leechers);
}
