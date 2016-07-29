import speedTest from 'speedtest-net';

export const REFRESH_RATE = 180000; // 3 min

const test = speedTest({
  maxTime: 5000
});

export async function getDownloadSpeed() {
  return new Promise((resolve, reject) => {
    test.on('data', (data) => {
      console.log('Download Speed:  ${data.speeds.download} Mb/s');
      resolve(data.speeds.download);
    });
    test.on('error', (err) => {
      reject(err);
    });
  });
}

export async function getUploadSpeed() {
  return new Promise((resolve, reject) => {
    test.on('data', (data) => {
      console.log('Upload Speed: ${data.speeds.upload} Mb/s');
      resolve(data.speeds.upload);
    });
    test.on('error', (err) => {
      reject(err);
    });
  });
}

// setInterval(getUploadSpeed, process.env.NETWORK_REFRESH_RATE || REFRESH_RATE);
// setInterval(getDownloadSpeed, process.env.NETWORK_REFRESH_RATE || REFRESH_RATE);
