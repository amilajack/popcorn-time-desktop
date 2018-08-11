/**
 * Goals:
 *
 * 1. Measure the performance of each torrent provider against an controlled sample
 *    of torrents. Tests are run against the top 50 most popular tv shows and movies.
 *
 * 2. Measure the download speed of each torrent.
 *
 * 3. Measure the time it takes to start playing the torrent.
 *
 * 4. Assert that the seeder count is above a decent count
 *
 * Torrent speeds are determiend by seeder and leecher counts as well as how
 * fast the torrent downloads (kbps). Benchmarks should be run serially in order
 * to allow fair distribution of bandwith to each torrent.
 */
import Butter from '../../app/api/Butter';
import shows from './butter.mock';
import { getIdealTorrent } from '../../app/api/torrents/BaseTorrentProvider';

const butter = new Butter();

describe('Benchmark Butter Shows: Top 50', () => {
  describe('Season 1', () => {
    describe('Show', function testShow() {
      beforeAll(done => {
        this.torrentCount = 0;
        done();
      });
      afterAll(done => {
        console.log(
          `\t Average Seeder Count: ${this.torrentCount / shows.length}`
        );
        done();
      });
      for (const show of shows) {
        it(`Shows: ${show.title} season 1, episode 1`, async done => {
          try {
            const torrents = await butter.getTorrent(
              show.id,
              'shows',
              {
                season: 1,
                episode: 1,
                searchQuery: show.title
              },
              true
            );
            const torrentCount = torrents.length
              ? getIdealTorrent(torrents).seeders
              : 0;
            this.torrentCount += torrentCount;
            console.log('\t Seeder Count: ', torrentCount);
            done();
          } catch (error) {
            done(error);
          }
        });
      }
    });

    describe('Show Complete', function testShowComplete() {
      beforeAll(done => {
        this.torrentCount = 0;
        done();
      });
      afterAll(done => {
        console.log(
          `\t Average Seeder Count: ${this.torrentCount / shows.length}`
        );
        done();
      });
      for (const show of shows) {
        it(`Season Complete: ${show.title} season 1`, async done => {
          try {
            const torrents = await butter.getTorrent(
              show.id,
              'season_complete',
              {
                season: 1,
                searchQuery: show.title
              },
              true
            );
            const torrentCount = torrents.length
              ? getIdealTorrent(torrents).seeders
              : 0;
            this.torrentCount += torrentCount;
            console.log('\t Seeder Count: ', torrentCount);
            done();
          } catch (error) {
            done(error);
          }
        });
      }
    });
  });

  describe('Season 2', () => {
    describe('Show', function testShow() {
      beforeAll(done => {
        this.torrentCount = 0;
        done();
      });
      afterAll(done => {
        console.log(
          `\t Average Seeder Count: ${this.torrentCount / shows.length}`
        );
        done();
      });
      for (const show of shows) {
        it(`Shows: ${show.title} season 2, episode 1`, async done => {
          try {
            const torrents = await butter.getTorrent(
              show.id,
              'shows',
              {
                season: 1,
                episode: 1,
                searchQuery: show.title
              },
              true
            );
            const torrentCount = torrents.length
              ? getIdealTorrent(torrents).seeders
              : 0;
            this.torrentCount += torrentCount;
            console.log('\t Seeder Count: ', torrentCount);
            done();
          } catch (error) {
            done(error);
          }
        });
      }
    });

    describe('Show Complete', function testShowComplete() {
      beforeAll(done => {
        this.torrentCount = 0;
        done();
      });
      afterAll(done => {
        console.log(
          `\t Average Seeder Count: ${this.torrentCount / shows.length}`
        );
        done();
      });
      for (const show of shows) {
        it(`Season Complete: ${show.title} season 2`, async done => {
          try {
            const torrents = await butter.getTorrent(
              show.id,
              'season_complete',
              {
                season: 1,
                searchQuery: show.title
              },
              true
            );
            const torrentCount = torrents.length
              ? getIdealTorrent(torrents).seeders
              : 0;
            this.torrentCount += torrentCount;
            console.log('\t Seeder Count: ', torrentCount);
            done();
          } catch (error) {
            done(error);
          }
        });
      }
    });
  });
});
