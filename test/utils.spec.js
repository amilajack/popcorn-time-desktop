import { expect } from 'chai';
import {
  getDownloadSpeed,
  getUploadSpeed,
  timeout
} from '../app/utils/Network';


describe('Network', function testNetwork() {
  this.slow(timeout + 1000);
  this.timeout(timeout + 1000000);

  // HACK: The 'speedtest-net' module needs to be rewritten. It fails to resolve
  //       speeds in a timely manner and ignores any timeout that is givent to it

  describe('download', () => {
    it('should resolve to a download speed', async done => {
      try {
        const downloadSpeed = getDownloadSpeed();
        expect(downloadSpeed).to.be.a('promise');
        expect(await getDownloadSpeed()).to.be.a('number');
        done();
      } catch (error) {
        done(error);
      }
    });
  });

  describe('upload ->', () => {
    it('should resolve to an upload speed', async done => {
      try {
        const uploadSpeed = getUploadSpeed();
        expect(uploadSpeed).to.be.a('promise');
        expect(await getUploadSpeed()).to.be.a('number');
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
