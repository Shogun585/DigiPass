const sharp = require('sharp');
const { readBarcodes } = require('zxing-wasm/reader');

const extractBarcodeFromBuffer = async (imageBuffer) => {
    try {
        const processedImageBuffer = await sharp(imageBuffer)
            .grayscale()
            .resize(1000)
            .toBuffer();

        const result = await readBarcodes(processedImageBuffer, {
            tryHarder: true,
            formats: ['Code 128', 'QR Code'] // Expand formats as needed
        });

        if (result.length > 0) {
            return { ok: true, data: result[0].text, format: result[0].format };
        }
        return { ok: false, reason: "No barcode found" };
    } catch (err) {
        console.error("Barcode processing error:", err);
        return { ok: false, reason: "Processing failed" };
    }
};

module.exports = { extractBarcodeFromBuffer };