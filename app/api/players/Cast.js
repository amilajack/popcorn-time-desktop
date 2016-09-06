const network = require('network-address');
const { argv } = require('yargs');
const cast = require('chromecast-player');


const { url, title, image } = argv;
const addr = url.replace('localhost', network());

cast({
  path: addr,
  type: 'video/mp4',
  metadata: {
    title,
    images: [
      { url: image }
    ]
  }
});
