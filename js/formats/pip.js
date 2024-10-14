import { downloadFile } from "../main.js";
import readline from "readline";

const url = "https://www.minecraft.net/bedrockdedicatedserver/bin-win/bedrock-server-1.21.31.04.zip";
const filePath = "./test.zip";

downloadFile(url, filePath, ({ percentage, speedMBS, etaString, downloadedLength, totalLength }) => {
    const progressBarLength = 50;
    const completedLength = Math.round((percentage / 100) * progressBarLength);
    const remainingLength = progressBarLength - completedLength;

    const progressBar = "\x1b[32m" + "━".repeat(completedLength) + "\x1b[31m" + "━".repeat(remainingLength) + "\x1b[0m";

    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`Downloading... ${progressBar} ${~~(downloadedLength / 1048576)}/${~~(totalLength / 1048576)} MB | Speed: ${speedMBS.toFixed(2)} MB/s | ETA: ${etaString}`);
}, { updateInterval: 100 });
