import {
  expect
} from 'chai';
import {
  getDownloadSpeed,
  getUploadSpeed
} from '../app/utils/Network';


describe('Network', () => {
  describe('download', () => {
    it('should resolve to a download speed', async done => {
      const downloadSpeed = getDownloadSpeed();
      expect(downloadSpeed).to.be.a('promise');
      expect(await downloadSpeed).to.be.a('number');
      done();
    });
  });

  describe('upload ->', () => {
    it('should resolve to an upload speed', async done => {
      const uploadSpeed = getUploadSpeed();
      expect(uploadSpeed).to.be.a('promise');
      expect(await uploadSpeed).to.be.a('number');
      done();
    });
  });
});
