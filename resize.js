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
        resize(fileName, 1920, 1920);
        resize(fileName, 1920, 500, true);
    }
});


// module.exports =
function resize(file, width, height, thumbnail=false) {
    let to = `public/images/${file}`;
    if (thumbnail) {
        to = `public/images/thumbnail_${file}`;
    }
    sharp(`images/${file}`)
        .resize({
            width: width,
            height: height,
            fit: sharp.fit.inside,
            withoutEnlargement: false
        })
        .jpeg({
            quality: 90,
        })
        .toFile(to);
};