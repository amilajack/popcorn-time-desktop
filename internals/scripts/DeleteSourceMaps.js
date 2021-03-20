import path from "path";
import rimraf from "rimraf";
import { erb } from "../../package.json";

export default function deleteSourceMaps() {
  if (erb.keepSourceMapsProd) return;
  rimraf.sync(path.join(__dirname, "../../app/dist/*.js.map"));
  rimraf.sync(path.join(__dirname, "../../app/*.js.map"));
}
