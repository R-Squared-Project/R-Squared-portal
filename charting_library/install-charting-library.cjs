var fs = require("fs");
var path = require("path");
const md5File = require("md5-file");
const http = require("https");
var extract = require("extract-zip");

function getMD5Digest(file) {
    const hash = md5File.sync(file);
    return hash.toUpperCase();
}

var outputFileName = "charting_library.17.025.02b61a1c.zip";
var outputFilePath = path.join(__dirname, outputFileName);

// download only if it doesnt exist
if (!fs.existsSync(outputFilePath)) {
    console.error("To build the Portal, you must have the Advanced Charts library from TradingView. According to the license terms, we cannot distribute this library.\n" +
        "Please visit https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/ to get your free copy of the Advanced Charts library.\n");
} else {
    checkDigest();
}

function checkDigest() {
    const actualDigest = getMD5Digest(outputFilePath);
    const expectedDigest = fs.readFileSync(outputFilePath + ".md5").toString().trim();
    if (actualDigest !== expectedDigest) {
        fs.unlinkSync(outputFilePath);
        throw new Error("MD5 of downloaded file (" + actualDigest + ") not matches expected (" + expectedDigest + ")");
    }
    console.log("MD5 digest validated, extracting library...");
    extract(outputFilePath, {dir: __dirname}, function (err) {
        if (err) {
            console.error("Decompress error!", err);
        }
    });
}
