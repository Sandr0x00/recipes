/* global require, module, __dirname */
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
    }
});


// module.exports =
function resize(file, format, width, height) {
    sharp(`images/${file}`)
        .resize({
            width: width,
            height: height,
            options: sharp.fit.inside,
            withoutEnlargement: false
        })
        .jpeg({
            quality: 90,
        })
        .toFile(`public/images/${file}`);
};