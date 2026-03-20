const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const inputDir = path.join(__dirname, 'public', 'img', 'products');

const convertImages = async () => {
    try {
        const files = fs.readdirSync(inputDir);
        for (const file of files) {
            if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpeg')) {
                const ext = path.extname(file);
                const baseName = path.basename(file, ext);
                const inputPath = path.join(inputDir, file);
                const outputPath = path.join(inputDir, `${baseName}.webp`);

                await sharp(inputPath)
                    .webp({ quality: 80, effort: 4 })
                    .toFile(outputPath);
                    
                console.log(`Converted ${file} to ${baseName}.webp`);
            }
        }
        console.log('Conversion complete!');
    } catch (err) {
        console.error('Error converting images:', err);
    }
};

convertImages();
