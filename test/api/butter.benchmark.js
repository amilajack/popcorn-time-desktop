import Butter from '../../app/api/Butter';
import shows from './butter.mock.js';


const butter = new Butter();

export async function generateMockShows() {
  const _shows = await new Butter().getShows();
  const generatedShows = _shows.map(({ id, title }) => ({ id, title }));
  console.log(generatedShows);
}

describe('Benchmark Butter Shows: Top 50', () => {
  describe('Season 1', () => {
    for (const show of shows) {
      it(`Show: Benchmarking ${show.title} season 1, episode 1`, async (done) => {
        try {
          const torrent = await butter.getTorrent(show.id, 'shows', {
            season: 1,
            episode: 1,
            searchQuery: show.title
          });
          done();
        } catch (err) {
          done(err);
        }
      });
    }

    for (const show of shows) {
      it(`Season Complete: Benchmarking ${show.title} season 1`, async (done) => {
        try {
          const torrent = await butter.getTorrent(show.id, 'season_complete', {
            season: 1,
            searchQuery: show.title
          });
          done();
        } catch (err) {
          done(err);
        }
      });
    }
  });

  describe('Season 2', () => {
    for (const show of shows) {
      it(`Show: Benchmarking ${show.title} season 2, episode 1`, async (done) => {
        try {
          const torrent = await butter.getTorrent(show.id, 'shows', {
            season: 1,
            episode: 1,
            searchQuery: show.title
          });
          done();
        } catch (err) {
          done(err);
        }
      });
    }

    for (const show of shows) {
      it(`Season Complete: Benchmarking ${show.title} season 2`, async (done) => {
        try {
          const torrent = await butter.getTorrent(show.id, 'season_complete', {
            season: 1,
            searchQuery: show.title
          });
          done();
        } catch (err) {
          done(err);
        }
      });
    }
  });
});
