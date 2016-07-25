import speedTest from 'speedtest-net';

export const REFRESH_RATE = 180000; // 3 min

let test = speedTest({
  maxTime: 5000
});

export default function getSpeed() {
  test.on('data', function(data) {
    console.log("Download Speed: " + data.speeds.download + "Mb/s");
    console.log("Upload Speed: " + data.speeds.upload + "Mb/s")
  });
  test.on('error', function(err) {
    console.log('Speed test error:');
    return err;
  });
}

// setInterval(getSpeed, process.env.REFRESH_RATE || REFRESH_RATE);
