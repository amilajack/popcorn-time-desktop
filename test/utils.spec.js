import { getDownloadSpeed, getUploadSpeed } from '../app/utils/Network';
import { isNewerSemvar } from '../app/utils/CheckUpdate';

describe('CheckUpdate', () => {
  it('should compare semvers', () => {
    expect(isNewerSemvar('v0.0.6-alpha', '0.0.7')).toBe(false);
    expect(isNewerSemvar('v0.0.7', '0.0.6')).toBe(true);
  });
});

describe('Network', () => {
  // HACK: The 'speedtest-net' module needs to be rewritten. It fails to resolve
  //       speeds in a timely manner and ignores any timeout that is givent to it

  describe('download', () => {
    it.skip('should resolve to a download speed', async () => {
      const downloadSpeed = getDownloadSpeed();
      expect(typeof downloadSpeed).toBe('promise');
      expect(typeof (await getDownloadSpeed())).toBe('number');
    });
  });

  describe('upload ->', () => {
    it.skip('should resolve to an upload speed', async () => {
      const uploadSpeed = getUploadSpeed();
      expect(typeof uploadSpeed).toBe('promise');
      expect(typeof (await getUploadSpeed())).toBe('number');
    });
  });
});
