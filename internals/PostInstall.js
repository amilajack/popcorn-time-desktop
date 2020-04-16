import os from "os";
import path from "path";
import fs from "fs";
import extract from "extract-zip";

const version = process.env.PREBUILT_FFMPEG_RELEASE || "0.37.4";
const baseDir = path.join(__dirname, "node_modules", "electron", "dist");

function copy(filepath, dest) {
  fs.writeFileSync(
    path.join(__dirname, dest),
    fs.readFileSync(path.join(__dirname, filepath))
  );
}

function addEnvFileIfNotExist() {
  if (fs.existsSync(path.join(__dirname, ".env"))) {
    console.log("--> Using existing .env file...");
  } else {
    console.log('--> Creating ".env" file...');
    copy(".env.example", ".env");
  }
}

function getUrl() {
  switch (os.type()) {
    case "Darwin":
      return {
        platform: "osx",
        dest: path.join(
          baseDir,
          "Electron.app",
          "Contents",
          "Frameworks",
          "Electron Framework.framework",
          "Libraries"
        ),
      };
    case "Windows_NT":
      return {
        platform: "win",
        dest: baseDir,
      };
    case "Linux":
      return {
        platform: "linux",
        dest: baseDir,
      };
    default:
      return {
        platform: "linux",
        dest: baseDir,
      };
  }
}

function setupFFmpeg() {
  const { platform, dest } = getUrl();
  const zipLocation = path.join(
    __dirname,
    "ffmpeg",
    `${version}-${platform}-${os.arch()}.zip`
  );

  console.log("--> Replacing ffmpeg...");

  extract(zipLocation, { dir: dest }, (error) => {
    if (error) {
      console.log(error);
    }
  });
}

setupFFmpeg();
addEnvFileIfNotExist();
