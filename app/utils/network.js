import speedTest from 'speedtest-net';

export const REFRESH_RATE = 180000; // 3 min

const test = speedTest({
  maxTime: 5000
});

export function getDownloadSpeed() {
  test.on('data', (data) => {
    console.log('Download Speed:  ${data.speeds.download} Mb/s');
    return data.speeds.download;
  });
  test.on('error', (err) => {
    console.log('Speed test error:');
    return err;
  });
}

export function getUploadSpeed() {
  test.on('data', (data) => {
    console.log('Upload Speed: ${data.speeds.upload} Mb/s');
    return data.speeds.upload;
  });
  test.on('error', (err) => {
    console.log('Speed test error:');
    return err;
  });
}

// setInterval(getUploadSpeed, process.env.NETWORK_REFRESH_RATE || REFRESH_RATE);
// setInterval(getDownloadSpeed, process.env.NETWORK_REFRESH_RATE || REFRESH_RATE);
