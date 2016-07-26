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
import shows from './butter.mock.js';
import { getIdealTorrent } from '../../app/api/torrents/BaseTorrentProvider';


const butter = new Butter();

export async function generateMockShows() {
  const _shows = await new Butter().getShows();
  const generatedShows = _shows.map(({ id, title }) => ({ id, title }));
  console.log(generatedShows);
}

describe('Benchmark Butter Shows: Top 50', () => {
  describe('Season 1', () => {
    for (const show of shows) {
      it(`Shows: ${show.title} season 1, episode 1`, async (done) => {
        try {
          const torrents = await butter.getTorrent(show.id, 'shows', {
            season: 1,
            episode: 1,
            searchQuery: show.title
          }, true);
          console.log('\t Seeder Count: ', torrents.length ? getIdealTorrent(torrents).seeders : 0);
          done();
        } catch (err) {
          done(err);
        }
      });
    }

    for (const show of shows) {
      it(`Season Complete: ${show.title} season 1`, async function (done) {
        try {
          const torrents = await butter.getTorrent(show.id, 'season_complete', {
            season: 1,
            searchQuery: show.title
          }, true);
          console.log('\t Seeder Count: ', torrents.length ? getIdealTorrent(torrents).seeders : 0);
          done();
        } catch (err) {
          done(err);
        }
      });
    }
  });

  describe('Season 2', () => {
    for (const show of shows) {
      it(`Shows: ${show.title} season 2, episode 1`, async (done) => {
        try {
          const torrents = await butter.getTorrent(show.id, 'shows', {
            season: 1,
            episode: 1,
            searchQuery: show.title
          }, true);
          console.log('\t Seeder Count: ', torrents.length ? getIdealTorrent(torrents).seeders : 0);
          done();
        } catch (err) {
          done(err);
        }
      });
    }

    for (const show of shows) {
      it(`Season Complete: ${show.title} season 2`, async function (done) {
        try {
          const torrents = await butter.getTorrent(show.id, 'season_complete', {
            season: 1,
            searchQuery: show.title
          }, true);
          console.log('\t Seeder Count: ', torrents.length ? getIdealTorrent(torrents).seeders : 0);
          done();
        } catch (err) {
          done(err);
        }
      });
    }
  });
});
