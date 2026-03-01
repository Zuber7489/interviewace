const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'src', 'assets', 'favicon.png');
const tempPath = path.join(__dirname, 'src', 'assets', 'favicon_new.png');
const tempWebpPath = path.join(__dirname, 'src', 'assets', 'favicon.webp');

async function optimizeImages() {
    try {
        // Resize favicon.png to 64x64 for standard favicon usage
        await sharp(inputPath)
            .resize(192, 192)
            .png({ quality: 80, compressionLevel: 9 })
            .toFile(tempPath);

        // Create a 64x64 WebP version for in-app images
        await sharp(inputPath)
            .resize(64, 64)
            .webp({ quality: 80 })
            .toFile(tempWebpPath);

        console.log('Images optimized successfully.');
        // Replace old favicon.png with optimized one
        fs.unlinkSync(inputPath);
        fs.renameSync(tempPath, inputPath);
        console.log('Replaced original favicon.png');
    } catch (error) {
        console.error('Error optimizing images:', error);
    }
}

optimizeImages();
