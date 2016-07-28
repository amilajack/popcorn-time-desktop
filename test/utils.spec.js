import { getDownloadSpeed, getUploadSpeed } from '../app/utils/Network';
import { expect } from 'chai';


describe('Network', () => {
  describe('download', () => {
    it('should respond with the download speed', (done) => {
      expect(getDownloadSpeed()).to.be.a('number');
      done();
    });
  });
  describe('upload', () => {
    it('should respond with the upload speed', (done) => {
      expect(getUploadSpeed()).to.be.a('number');
      done();
    });
  });
});
