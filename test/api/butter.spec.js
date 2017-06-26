import Butter from '../../app/api/Butter';
import MockShows from './butter.mock';
import {
  formatSeasonEpisodeToString,
  formatSeasonEpisodeToObject,
  sortTorrentsBySeeders,
  resolveEndpoint
} from '../../app/api/torrents/BaseTorrentProvider';
import { getStatuses } from '../../app/api/torrents/TorrentAdapter';
import { convertRuntimeToHours } from '../../app/api/metadata/MetadataAdapter';
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
    it('should get status of providers', async () => {
      for (const _provider of providers) {
        expect(typeof await _provider.provider.getStatus()).toBe('boolean');
      }
    });

    it('should get an array of statuses', async () => {
      const statuses = await getStatuses();
      expect(typeof statuses).toBe('array');
      for (const status of statuses) {
        expect(typeof status).toBe('object');
        expect(typeof status).toBe('string');
        expect(typeof status).toBe('boolean');
      }
    });
  });

  describe('Utils', () => {
    it('should set, get, list cache', () => {
      clear();

      expect(get('__test__')).toBe(undefined);

      set('__test__', 'some_value');
      expect(get('__test__')).toBe('some_value');

      set('__test__', { testingValue: 'someTestingValue' });
      expect(get('__test__')).toEqual({ testingValue: 'someTestingValue' });

      set('__test__', [{ some: 'who' }]);
      set('__test__', []);
      expect(get('__test__')).toEqual([]);
    });
  });

  describe('Config', () => {
    it('should add favorites, recentlyWatched, watchList', async () => {
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

          expect(typeof torrents).toBe('array');
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

          expect(typeof torrents).toBe('array');
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

          expect(typeof torrents).toBe('array');
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
          expect(convertRuntimeToHours(64).full).toBe('1 hour 4 minutes');
          expect(convertRuntimeToHours(20).full).toBe('20 minutes');
          expect(convertRuntimeToHours(64).hours).toBe(1);
          expect(convertRuntimeToHours(64).minutes).toBe(4);

          expect(convertRuntimeToHours(126).full).toBe('2 hours 6 minutes');
          expect(convertRuntimeToHours(56).full).toBe('56 minutes');
          expect(convertRuntimeToHours(126).hours).toBe(2);
          expect(convertRuntimeToHours(126).minutes).toBe(6);

          expect(convertRuntimeToHours(60).full).toBe('1 hour');
        });
      });

      describe('format episode and season', () => {
        it('should format correctly', () => {
          expect(formatSeasonEpisodeToString(1, 4)).toBe('s01e04');
          expect(formatSeasonEpisodeToString(20, 40)).toBe('s20e40');
          expect(formatSeasonEpisodeToString(5, 10)).toBe('s05e10');
          expect(formatSeasonEpisodeToString(22, 22)).toBe('s22e22');

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
        it('should return array of objects', async () => {
          const movies = await moviesFactory();

          for (const movie of movies) {
            expect(typeof movies).toBe('array');
            expect(typeof movie).toBe('object');
          }
        });

        it('should have movies that have necessary properties', async () => {
          const movies = await moviesFactory();

          for (const movie of movies) {
            assertMovieFormat(movie);
          }
        });
      });

      describe('movie', () => {
        it('should have necessary properties', async () => {
          const movie = await new Butter().getMovie('tt0417741');
          assertMovieFormat(movie);
        });
      });

      describe('shows', () => {
        it('should return array of objects', async () => {
          const shows = await butterFactory().getShows();

          for (const show of shows) {
            expect(typeof shows).toBe('array');
            expect(typeof show).toBe('object');
          }
        });

        it('should have movies that have necessary properties', async () => {
          const shows = await butterFactory().getShows();

          for (const show of shows) {
            assertMovieFormat(show);
          }
        });
      });

      describe('show', () => {
        it('should get show metadata', async () => {
          const showMetadata = await butterFactory().getShow('tt0944947');
          assertMovieFormat(showMetadata);
        });

        it('should get seasons', async () => {
          const seasons = await butterFactory().getSeasons('tt1475582');
          expect(typeof seasons).toBe('array');

          const [season] = seasons;

          expect(typeof season).toBe('object');
          expect(season).toHaveProperty('season').toEqual(1);
          expect(typeof season).toBe('string');
          expect(typeof season).toBe('string');
          expect(typeof season).toBe('string');
        });

        it('should get season', async () => {
          const episodes = await butterFactory().getSeason(
            'game-of-thrones',
            1
          );
          expect(typeof episodes).toBe('array');

          const [episode] = episodes;

          expect(typeof episode).toBe('object');
          expect(episode).toHaveProperty('season').toEqual(1);
          expect(episode).toHaveProperty('episode').toEqual(1);
          expect(episode).toHaveProperty('id').toEqual('tt1480055');
          expect(episode).toHaveProperty('title').toEqual('Winter Is Coming');
          expect(typeof episode).toBe('string');
          expect(typeof episode).toBe('string');
          expect(typeof episode).toBe('string');
        });

        it('should get episode', async () => {
          const episode = await butterFactory().getEpisode('tt1475582', 2, 2);
          expect(typeof episode).toBe('object');
          expect(episode).toHaveProperty('season').toEqual(2);
          expect(episode).toHaveProperty('episode').toEqual(2);
          expect(episode).toHaveProperty('id').toEqual('tt1942613');
          expect(episode).toHaveProperty('title');
          expect(episode.title).toEqual('The Hounds of Baskerville');
          expect(typeof episode).toBe('string');
          expect(episode)
            .toHaveProperty('rating')
            .that.is.a('number')
            .toBeLessThanOrEqual(0);
          expect(episode)
            .toHaveProperty('rating')
            .that.is.a('number')
            .toBeGreaterThanOrEqual(10);
          expect(typeof episode).toBe('string');
          expect(typeof episode).toBe('string');
          expect(typeof episode).toBe('string');
        });
      });

      describe('similar', () => {
        it('should get similar movies and shows in correct format', async () => {
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
        it('should search movies in correct format', async () => {
          const searchResults = await butterFactory().search(
            'Harry Potter and the Goblet of Fire',
            'movies'
          );
          expect(typeof searchResults).toBe('array');

          for (const movie of searchResults) {
            expect(typeof movie).toBe('object');
            assertMovieFormat(movie);
          }
        });
      });
    });

    describe('torrents', () => {
      describe('movie torrents', () => {
        it('should get torrents and their magnets of 720p and 1080p', async () => {
          const torrent = await butterFactory().getTorrent(imdbId, 'movies', {
            searchQuery: 'the dark knight'
          });

          for (const quality of ['720p', '1080p']) {
            assertSingleTorrent(torrent[quality]);
            expect(typeof torrent[quality]).toBe('string').toEqual(quality);
          }
        });

        it('should order torrents by seeder count by default', async () => {
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
        it('should get show torrent by imdbId', async () => {
          const torrents = await butterFactory().getTorrent(
            'tt0944947',
            'shows',
            {
              season: 2,
              episode: 2,
              searchQuery: 'game of thrones'
            }
          );

          expect(typeof torrents).toBe('object');

          for (const quality of ['480p', '720p', '1080p']) {
            if (torrents[quality]) {
              assertSingleTorrent(torrents[quality]);
              expect(typeof torrents[quality]).toBe('string').toEqual(quality);
            }
          }
        });

        it('should get season_complete torrents', async () => {
          const torrents = await butterFactory().getTorrent(
            imdbId,
            'season_complete',
            {
              searchQuery: 'game of thrones',
              season: 6
            }
          );

          expect(typeof torrents).toBe('object');

          for (const quality of ['480p', '720p', '1080p']) {
            if (torrents[quality]) {
              assertSingleTorrent(torrents[quality]);
              expect(typeof torrents[quality]).toBe('string').toEqual(quality);
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
          expect(resolvedEndpoint).toBe('https://test.org/search');
        });

        it('should return default for unknown endpoints', () => {
          const resolvedEndpoint = resolveEndpoint(
            'https://some-website.com/search',
            'TEST'
          );
          expect(resolvedEndpoint).toBe('https://test.org/search');
        });
      });

      describe.skip('Subtitles', function testSubtitles() {
        // this.timeout(30000);

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
          it('should return subtitles', async () => {
            expect(typeof this.subtitles).toBe('array');

            for (const subtitle of this.subtitles) {
              expect(typeof subtitle).toBe('object');
              expect(typeof subtitle).toBe('string');
              expect(typeof subtitle).toBe('string');
              expect(typeof subtitle).toBe('string');
              expect(typeof subtitle).toBe('string');
              expect(typeof subtitle).toBe('boolean');
            }
          });
        });

        describe('Show', () => {
          it.skip('should return subtitles', async () => {
            const subtitles = await butterFactory().getSubtitles(showImdbId);
            expect(typeof subtitles).toBe('array');
            for (const subtitle of subtitles) {
              expect(typeof subtitle).toBe('object');
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
              expect(typeof torrent).toBe('object');

              for (const quality of ['480p', '720p', '1080p']) {
                if (torrent[quality]) {
                  assertSingleTorrent(torrent[quality]);
                  expect(typeof torrent[quality])
                    .toBe('string')
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
  expect(typeof movie).toBe('object');
  expect(typeof movie).toBe('string');
  expect(typeof movie).toBe('number');
  expect(typeof movie).toBe('string');
  expect(typeof movie).toBe('string');
  expect(typeof movie).toBe('string');
  expect(typeof movie).toBe('array');
  assertNAorNumber(movie.rating);

  expect(typeof movie).toBe('object');
  expect(typeof movie).toBe('string');
  assertNAorNumber(movie.runtime.hours);
  assertNAorNumber(movie.runtime.minutes);

  expect(movie.trailer).to.satisfy(s => s === null || typeof s === 'string');

  expect(typeof movie).toBe('object');
  assertImageFormat(movie);
}

function assertImageFormat(item) {
  expect(typeof item).toBe('object');
  expect(typeof item).toBe('object');
  expect(typeof item).toBe('string');
  expect(typeof item).toBe('string');
  expect(typeof item).toBe('string');
  expect(typeof item).toBe('string');
  expect(typeof item).toBe('string');
  expect(typeof item).toBe('string');
}

function assertSingleTorrent(torrent) {
  expect(typeof torrent).toBe('object');

  expect(typeof torrent).toBe('string');

  expect(typeof torrent).toBe('string');

  expect(typeof torrent)
    .toBe('string')
    .that.oneOf(['healthy', 'decent', 'poor']);

  expect(torrent)
    .toHaveProperty('seeders')
    .that.is.a('number')
    .toBeGreaterThanOrEqual(0);

  expect(typeof torrent).toBe('string');

  assertNAorNumber(torrent.seeders);

  expect(torrent)
    .toHaveProperty('leechers')
    .that.is.a('number')
    .toBeGreaterThanOrEqual(0);

  assertNAorNumber(torrent.leechers);
}

function assertProviderTorrent(torrent) {
  expect(typeof torrent).toBe('object');

  expect(typeof torrent).toBe('string');

  expect(typeof torrent).toBe('string');

  expect(torrent)
    .toHaveProperty('seeders')
    .that.is.a('number')
    .toBeGreaterThanOrEqual(0);

  expect(torrent)
    .toHaveProperty('leechers')
    .that.is.a('number')
    .toBeGreaterThanOrEqual(0);

  expect(typeof torrent).toBe('string');

  assertNAorNumber(torrent.seeders);

  expect(torrent)
    .toHaveProperty('leechers')
    .that.is.a('number')
    .toBeGreaterThanOrEqual(0);

  assertNAorNumber(torrent.leechers);
}
