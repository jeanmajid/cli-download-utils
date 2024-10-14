import { downloadFile } from "../main.js";
import readline from "readline";

const url = "https://www.minecraft.net/bedrockdedicatedserver/bin-win/bedrock-server-1.21.31.04.zip";
const filePath = "./test.zip";

downloadFile(url, filePath, ({ percentage, speedMBS, etaString }) => {
    readline.cursorTo(process.stdout, 0);
    readline.clearLine(process.stdout, 0);
    process.stdout.write(`Downloading: ${percentage.toFixed(2)}% | Speed: ${speedMBS.toFixed(2)} MB/s | ETA: ${etaString}`);
});