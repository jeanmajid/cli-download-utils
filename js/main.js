import https from "https";
import fs from "fs";
import readline from "readline";

const url = "https://www.minecraft.net/bedrockdedicatedserver/bin-win/bedrock-server-1.21.31.04.zip";
const filePath = "./test.zip";

export function downloadFile(url, filePath) {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
        const totalLength = parseInt(response.headers["content-length"], 10);
        let downloadedLength = 0;
        const startTime = Date.now();
        let lastUpdateTime = startTime;

        const updateProgress = () => {
            const currentTime = Date.now();
            const elapsedSeconds = (currentTime - startTime) / 1000;
            const speedMBS = downloadedLength / (1024 * 1024) / elapsedSeconds;
            const percentage = (downloadedLength / totalLength) * 100;
            const eta = (totalLength - downloadedLength) / (speedMBS * 1024 * 1024);

            readline.cursorTo(process.stdout, 0);
            process.stdout.write(`Downloading: ${percentage.toFixed(2)}% | Speed: ${speedMBS.toFixed(2)} MB/s | ETA: ${eta.toFixed(2)}s`);
            lastUpdateTime = currentTime;
        };

        response.on("data", (chunk) => {
            file.write(chunk);
            downloadedLength += chunk.length;

            if (Date.now() - lastUpdateTime >= 1000) {
                updateProgress();
            }
        });

        response.on("end", () => {
            file.end();
            readline.cursorTo(process.stdout, 0);
            readline.clearLine(process.stdout, 0);
            process.stdout.write(`Downloading: 100% | Speed: 0 MB/s | ETA: 0s`);
            console.log("\nDownload completed!");
        });

        response.on("error", (err) => {
            file.end();
            console.error("Download failed:", err);
        });
    });
}

downloadFile(url, filePath);
