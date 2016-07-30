import speedTest from 'speedtest-net';


const test = speedTest({
  maxTime: 5000
});

export async function getDownloadSpeed() {
  return new Promise((resolve, reject) => {
    test.on('data', data => {
      console.log('Download Speed: ${data.speeds.download} Mb/s');
      resolve(data.speeds.download);
    });
    test.on('error', error => {
      reject(error);
    });
  });
}

export async function getUploadSpeed() {
  return new Promise((resolve, reject) => {
    test.on('data', data => {
      console.log('Upload Speed: ${data.speeds.upload} Mb/s');
      resolve(data.speeds.upload);
    });
    test.on('error', error => {
      reject(error);
    });
  });
}
