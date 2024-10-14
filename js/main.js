import https from "https";
import fs from "fs";

const timeUnits = [
    { unit: "year", seconds: 31536000 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
];

/**
 * Downloads a file from the specified URL and saves it to the given file path.
 * Provides progress updates through the onProgress callback.
 *
 * @param {string} url - The URL of the file to download.
 * @param {string} filePath - The path where the downloaded file will be saved.
 * @param {function({ percentage: number, speedMBS: number, etaString: string, etaSeconds: number, downloadedLength: number, totalLength: number})} onProgress - Callback function to receive progress updates.
 * The callback receives an object with the following properties:
 * - percentage: The percentage of the file downloaded.
 * - speedMBS: The download speed in MB/s.
 * - etaString: The estimated time of arrival in a human-readable format.
 * - etaSeconds: The estimated time of arrival in seconds.
 * - downloadedLength: The total number of bytes downloaded.
 * - totalLength: The total number of bytes in the file.
 * @param {{ updateInterval: number}} options - Optional settings for the download.
 * The options object can contain the following property:
 * - updateInterval: The interval in milliseconds at which to update the progress. Default is 1000ms.
 * @returns {void}
 * 
 * @example
 * import { downloadFile } from "../main.js";
 * import readline from "readline";
 *
 * const url = "www.example.com/file.zip";
 * const filePath = "./test.zip";
 *
 * downloadFile(url, filePath, ({ percentage, speedMBS, etaString }) => {
 *     readline.cursorTo(process.stdout, 0);
 *     readline.clearLine(process.stdout, 0);
 *     process.stdout.write(`Downloading: ${percentage.toFixed(2)}% | Speed: ${speedMBS.toFixed(2)} MB/s | ETA: ${etaString}`);
 * });
 */
export function downloadFile(url, filePath, onProgress, options = {}) {
    const updateInterval = options.updateInterval || 1000;

    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
        const totalLength = parseInt(response.headers["content-length"], 10);
        let downloadedLength = 0;
        const startTime = Date.now();

        const progressInterval = setInterval(() => {
            const currentTime = Date.now();
            const elapsedSeconds = (currentTime - startTime) / 1000;
            const speedMBS = downloadedLength / 1048576 / elapsedSeconds;
            const percentage = (downloadedLength / totalLength) * 100;
            const eta = (totalLength - downloadedLength) / (speedMBS * 1048576);

            let etaString;
            for (const { unit, seconds } of timeUnits) {
                if (eta >= seconds) {
                    const value = Math.floor(eta / seconds);
                    etaString = `${value} ${unit}${value !== 1 ? "s" : ""}`;
                    break;
                }
            }

            onProgress({ percentage, speedMBS, etaString, etaSeconds, downloadedLength, totalLength });
        }, updateInterval);

        response.on("data", (chunk) => {
            file.write(chunk);
            downloadedLength += chunk.length;
        });

        response.on("end", () => {
            clearInterval(progressInterval);
            file.end();
            onProgress({ percentage: 100, speedMBS: 0, etaString: "0s", eta: 0, downloadedLength, totalLength });
        });

        response.on("error", (err) => {
            clearInterval(progressInterval);
            file.end();
            console.error("Download failed:", err);
        });
    });
}
