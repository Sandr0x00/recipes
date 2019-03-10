/* global require, module, __dirname, console */
const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
sharp.cache(false);

const dirPath = path.join(__dirname, 'images');
fs.readdirSync(dirPath).forEach(fileName => {
    let filePath = path.join(dirPath, fileName);
    let stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
        console.log('There should be no directory here!');
    } else if (stats.isFile()) {
        resize('', fileName, 1920, 1920, sharp.fit.inside);
        resize('thumbnail_', fileName, 280, 430, sharp.fit.cover);
        resize('placeholder_', fileName, 32, 32, sharp.fit.inside);
    }
});

// module.exports =
function resize(prefix, file, width, height, fit) {
    let to = `public/images/${prefix}${file}`;
    sharp(`images/${file}`)
        .resize({
            width: width,
            height: height,
            fit: fit,
            withoutEnlargement: false
        })
        .jpeg({
            quality: 90,
        })
        .toFile(to);
};