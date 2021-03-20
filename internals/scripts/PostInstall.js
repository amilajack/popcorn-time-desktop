import os from "os";
import path from "path";
import fs from "fs";
import extract from "extract-zip";

const version = process.env.PREBUILT_FFMPEG_RELEASE || "0.37.4";
const baseDir = path.join(__dirname, "node_modules", "electron", "dist");
const projectRoot = path.dirname(require.resolve("../../package.json"));

function addEnvFileIfNotExist() {
  if (fs.existsSync(path.join(projectRoot, ".env"))) {
    console.log("--> Using existing .env file...");
  } else {
    console.log('--> Creating ".env" file...');
    fs.copyFileSync(
      path.join(projectRoot, ".env.example"),
      path.join(projectRoot, ".env")
    );
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
    projectRoot,
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
