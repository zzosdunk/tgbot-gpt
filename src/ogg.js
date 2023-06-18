import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";
import { createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { removeFile } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url)); //src folder path

class OggConverter {
  constructor() {
    ffmpeg.setFfmpegPath(installer.path);
  }

  toMp3(sourceAudio, userId) {
    try {
      const outputPath = resolve(dirname(sourceAudio), `${userId}.mp3`);
      return new Promise((resolve, reject) => {
        ffmpeg(sourceAudio)
          .inputOption("-t 30")
          .output(outputPath)
          .on("end", () => {
            removeFile(sourceAudio);
            resolve(outputPath);
          })
          .on("error", (err) => reject(err.message))
          .run();
      });
    } catch (e) {
      console.log("Error while creating mp3 ", e.message);
    }
  }

  async create(url, fileName) {
    const oggPath = resolve(__dirname, "../voices", `${fileName}.ogg`);
    try {
      const response = await axios({
        method: "get",
        url,
        responseType: "stream",
      });
      return new Promise((resolve) => {
        const stream = createWriteStream(oggPath);
        response.data.pipe(stream);
        stream.on("finish", () => resolve(oggPath));
      });
    } catch (e) {
      console.log("Error while creating ogg ", e.message);
    }
  }
}

export const ogg = new OggConverter();
