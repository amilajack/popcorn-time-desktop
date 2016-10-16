/**
 * @TODO
 */
import fetch from 'isomorphic-fetch';
import cheerio from 'cheerio';
import {
  handleProviderError
} from './BaseTorrentProvider';


const extratorrentUrl = 'http://extratorrent.cc';

export default class ExtraTorrent {

  fetch(searchQuery: string) {
    return fetch(
      `${extratorrentUrl}/search/?search=${encodeURIComponent(searchQuery)}&new=1&x=0&y=0`
    )
      .then(res => res.text())
      .then(torrent => this.format(torrent))
      .catch(error => {
        handleProviderError(error);
        return [];
      });
  }

  format(torrentsText: string) {
    const $ = cheerio.load(torrentsText);

    if ($('.tl').find('tr').length > 3) {
      $('.tl tr').map(torrent => {
        if ($(torrent).find('td a').attr('href') !== '#') {
          const findTorrentLink = $(torrent).find('td a');

          const magnet = extratorrentUrl +
                          findTorrentLink.attr('href')
                            .split('torrent_download')
                            .join('download');

          const title = findTorrentLink.attr('title')
                          .split('Download ')
                          .join('')
                          .split(' torrent')
                          .join('');
          const size = $(torrent).find('td')
                                .next()
                                .next()
                                .next()
                                .first()
                                .text();
          const seeders = $(torrent).find('td.sy').text();
          const leechers = $(torrent).find('td.ly').text();

          return {
            title,
            seeders,
            leechers,
            size,
            magnet
          };
        }

        return {};
      });
    }
  }
}
